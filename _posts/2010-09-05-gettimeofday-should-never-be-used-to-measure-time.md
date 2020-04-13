---
layout: post
title:  "gettimeofday() should never be used to measure time"
date:   2010-09-05 00:00:00 +0000
categories: coding, bugs
---
`gettimeofday()` and `time()` should only be used to get the current
time if the current wall-clock time is actually what you want. They
should *never* be used to measure time or schedule an event X time
into the future.

## What's the problem?

`gettimeofday()` returns the current wall clock time and
timezone. time() returns a subset of this info (only whole seconds,
and not timezone).

Using these functions in order to measure the passage of time (how
long an operation took) therefore seems like a no-brainer. After all,
in real life you measure by checking your watch before and after the
operation. The differences are:

### 1. Nobody sneaks in and changes your wristwatch when you're not looking

You usually aren't running NTP on your wristwatch, so it probably
won't jump a second or two (or 15 minutes) in a random direction
because it happened to sync up against a proper clock at that point.

Good NTP implementations try to not make the time jump like this. They
instead make the clock go faster or slower so that it will drift to
the correct time. But while it's drifting you either have a clock
that's going too fast or too slow. It's not measuring the passage of
time properly.


### 2. You're not stupid, the computer is

Doing something doesn't take less than 0 time. If you get &lt;0 when
you measure time, you'll realize something is wrong. A program will
happily print that a ping reply came back before you sent it.  Even if
you check for time < 0, the program that uses gettimeofday() still can't
tell the difference between a 2 second delay and 3 seconds plus a time
adjustment.


### 3. You are the limiting factor

In real life you are not expected to measure sub-second times. You
can't measure the difference between 1.08 seconds and 1.03
seconds. This problem is mostly (but far from entirely) in the small
scale.

### What to use instead

The most portable way to measure time correctly seems to be
`clock_gettime(CLOCK_MONOTONIC, ...)`.  It's not stable across reboots,
but we don't care about that. We just want a timer that goes up by one
second for each second that passes in the physical world.

So if you want to wait 10 seconds, then check the monotonic clock, add
10 seconds and wait until that time has come.

```c
#include <time.h>
#include <stdio.h>

/**
 * sleep for `sec' seconds, without relying on the wall clock of time(2)
 * or gettimeofday(2).
 *
 * under ideal conditions is accurate to one microsecond. To get nanosecond
 * accuracy, replace sleep()/usleep() with something with higher resolution
 * like nanosleep() or ppoll().
 */
void
true_sleep(int sec)
{
        struct timespec ts_start;
        struct timespec ts_end;

        clock_gettime(CLOCK_MONOTONIC, &ts_start);

        ts_end = ts_start;
        ts_end.tv_sec += sec;

        for(;;) {
                struct timespec ts_current;
                struct timespec ts_remaining;

                clock_gettime(CLOCK_MONOTONIC, &ts_current);

                ts_remaining.tv_sec = ts_end.tv_sec - ts_current.tv_sec;
                ts_remaining.tv_nsec = ts_end.tv_nsec - ts_current.tv_nsec;
                while (ts_remaining.tv_nsec > 1000000000) {
                        ts_remaining.tv_sec++;
                        ts_remaining.tv_nsec -= 1000000000;
                }
                while (ts_remaining.tv_nsec < 0) {
                        ts_remaining.tv_sec--;
                        ts_remaining.tv_nsec += 1000000000;
                }

                if (ts_remaining.tv_sec < 0) {
                        break;
                }

                if (ts_remaining.tv_sec > 0) {
                        sleep(ts_remaining.tv_sec);
                } else {
                        usleep(ts_remaining.tv_nsec / 1000);
                }
        }
}

int
main()
{
        true_sleep(10);
}
```

The same method works if you want to schedule something in the future,
or see how long something took.  I've found that I very rarely
actually need the wall clock time in programs. The only exceptions I
can think of are when it should be store on disk (valid across reboot
or with NFS across server) or when the time (not the time delta)
should be shown to the user.

The case of "sleep" can actually be solved by `clock_nanosleep()`, but
I wanted an example that could illustrate how to measure too.

If `clock_gettime(CLOCK_MONOTONIC, ...)` is not available on your
system, then try to find a monotonic clock that is. Like `gethrtime()`
or `CLOCK_HIGHRES` on Solaris. I have created [portable library for
getting monotonic
time](https://github.com/ThomasHabets/monotonic_clock).

## The guilty ones

### libpcap

The `pcap_pkthdr` struct (the "received packet" struct) contains a
`struct timeval ts` that ruins our ability to measure the time it
takes for the reply you get for some query you sent. [They tell
me](http://www.mail-archive.com/tcpdump-workers@lists.tcpdump.org/msg05261.html)
the kernel supplies the timestamp, so it's not really libpcaps fault.

Calling `clock_gettime()` when libpcap gives you a packet has turned out
to be useless, as the time difference between packet reception and the
delivery to your program is too long and unstable.  You're stuck with
this wall-clock time until you fix all the kernels in the world and
break binary compatibility with old libpcap programs.

### ping

Try running a ping and setting the time in the past. Ping will freeze
waiting until it thinks it's time for the next packet. Tried with
iputils ping for Linux. A brief survey of the source code of other
OpenSource pings show this:

* [FreebSD](http://www.freebsd.org/cgi/cvsweb.cgi/src/sbin/ping/ping.c?rev=1.113):
  Same as Linux
* [NetBSD](http://cvsweb.netbsd.org/bsdweb.cgi/src/sbin/ping/ping.c?rev=1.90&content-type=text/x-cvsweb-markup&only_with_tag=MAIN):
  Much code in common with FreeBSD. This too looks the same.
* [Mac OSX](http://www.opensource.apple.com/source/network_cmds/network_cmds-329.2/ping.tproj/ping.c):
  Same heritage, same fault
* [OpenBSD](http://www.openbsd.org/cgi-bin/cvsweb/src/sbin/ping/ping.c?rev=1.88):
  Seems OK because they (surprise surprise) ignore the C standard and do the
  work in a SIGALRM handler.
* [Solaris](http://src.opensolaris.org/source/xref/onnv/onnv-gate/usr/src/cmd/cmd-inet/usr.sbin/ping/ping.c#sigalrm_handler):
  Same as OpenBSD, except they don't support fractional second intervals

Note that I haven't actually tested to confirm these (except
Linux). I've just quickly scanned through the source code.

It seems that the only people who got the ping send scheduler right in
this regard did it at the expense of not following the C standard, and
nobody got the RTT calculation right. Solaris actually used a
monotonic clock (`gethrtime()`) in other parts of the code, but not for
RTT calculation.


I have sent [a patch](http://www.spinics.net/lists/netdev/msg139987.html)
to fix this on Linux ping. It has not yet been applied to upstream.

### Oracle database

If time was set backwards then Oracle would *reboot* the
machine. [Really](http://database.in2p3.fr/10203_buglist.htm). (bug ID
seems to be 5015469)

When a leap second is inserted into the official time, such as
2008-12-31 23:59:**60**, all the other clocks are suddenly fast,
and therefore adjust themselves backwards. On newyears day 2009 many
people woke up to their Oracle servers having rebooted. Not simply
shut down the oracle process, but actually rebooted the server.

### Cloudflare DNS

Due to using Go `time.Time()` (in other words `gettimeofday()`)
[Cloudflare measured negative periods at the end of 2016 leap second
and
crashed](https://blog.cloudflare.com/how-and-why-the-leap-second-affected-cloudflare-dns/).

This is about as bad as Oracle's bug, and would have been triggered by
any NTP glitch on their end.

### F5

F5 BigIP load balancers seem to cut all active connections when time
is set backwards. So if you use two NTP servers that don't have the
same time, all your connections will be cut when your load balancer
flips back and forth between the two upstream times.

### Me

At least arping and gtping didn't handle this properly and could in
some cases (not always) act like Linux ping. I have fixed both of them
and it'll be in the next version. I had put off fixing them because I
wanted a solution that solved packet timings as well as packet
scheduling, but at least with arping that doesn't seem possible due to
the libpcap issue mentioned above.

GTPing should now have this solved perfectly, and ARPing should only
show incorrect times for replies when the wall clock changes or
drifts, but the scheduler should still send one packet per interval.

### Everyone else?
I'd be surprised to see *any* program handling this correctly. Please
let me know if you find one.

## Exception

If a wall-clock time is all you can get (such as from libpcap), then
you're gonna have to use that. But you don't have to like it. And
avoid wall time where at all possible.

## Unrelated note

When I turn on the GPS I have in my car after it's been off for too
long it asks me where I am and what time and date it is. Why would a
GPS possibly want to ask me those things? Telling *me* where I
am and what time it is is *what it was made to do*.

### Update

As a couple of people have pointed out there is a "right" answer to
this.  It's not a problem for newer GPS units, but [there it
is](https://secure.wikimedia.org/wikipedia/en/wiki/GPS_signals#Almanac).

## Links

* [Doug Coleman on Monotonic timers](http://code-factor.blogspot.com/2009/11/monotonic-timers.html)
* [Portable library for getting monotonic time](https://github.com/ThomasHabets/monotonic_clock)
* [My feelings about GPSs](http://www.smbc-comics.com/index.php?db=comics&id=2035#comic)
* [Monotonic time in Python](http://code.google.com/p/anacrolix/source/browse/projects/pimu/monotime.py)
