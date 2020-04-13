---
layout: post
title:  "Optimizing TCP slow start"
date:   2011-10-15 00:00:00 +0000
categories: unix, network
---

The short version of the problem and solution I will describe is that
while TCP gets up to speed fairly fast, and "fast enough" for many
uses, it doesn't accelerate fast enough for short-lived connections
such as web page requests. If I have 10Mbps connection and the server
has 10Mbps to spare, why doesn't a 17kB web page transfer at 10Mbps
from first to last byte? (that is, when excluding TCP handshake, HTTP
request and server side page rendering)

This is pretty Linux-focused, but I'll add pointers for other OSs if I see them.

<blargh:body/>

## Short version

This will get a bit basic for some people, so here's the short version. Make sure you measure
the effect of changing these settings. Don't just increase them and think "more is better".

On receiver side (requires kernel version 2.6.33 or newer (and a
fairly new iproute package. iproute2-ss100519 works). Use your default
route instead of "x.x.x.x"):
```
ip route change default via x.x.x.x initrwnd 20
```

On sender side:
```
ip route change default via x.x.x.x initcwnd 20
```

To tweak both send and receive:
```
ip route change default via x.x.x.x initcwnd 20 initrwnd 20
```

## The path to enlightenment

In short, the number of bytes in flight in TCP is the lowest of the
senders congestion window (cwnd) and the receiver window size. The
window size is the receiver announcing how much it's ready to receive,
and the sender will therefore not send any more than that. The cwnd is
the sender trying to avoid causing congestion. (since TCP is two-way
both sides have both, but think of it as one-way for now)

The window size is announced in every segment (TCP packets are called
"segments") and is the receivers method of throttling. The cwnd is not
sent across the network, but is a local sender-side throttling only.

Both of these default to "a few" multiples of the maximum size
segments (MSS).  The MSS is announced in the SYN and SYN|ACK packets
and are adjusted so that a TCP segment fits in the path MTU
(hopefully). Typical initial window size and cwnd is on the order of
4kB.  Linux has an initial cwnd of 10*MSS nowadays, but that doesn't
help if the receiver window is smaller that that.  Both window size
and cwnd will change as the connection progresses. How and why is a
huge topic in itself. I'm focusing here on a specific problem of
initial size and TCP slow start.

The problem I was having was that when I downloaded
[http://blog.habets.se](http://blog.habets.se) over a ~50ms RTT
connection these values don't go up fast enough. During the ~300ms
transaction (including everything) the sender stalls about 4-6 times
waiting for the receiver to give the go-ahead. (I only have
approximate numbers since the RTT between the servers I was testing
was a bit unstable. Virtual servers and all that).  The time between
first and last byte was about 170ms. Really? ~50ms RTT and 17kB in
170ms? That's not good.

Ideally there should be two round trips involved. One where the client
has sent SYN and is waiting for SYN|ACK, and the other when the client
has sent the request and is waiting for the results. If this were a
long-running connection (with [HTTP
keep-alive](http://en.wikipedia.org/wiki/HTTP_persistent_connection)
for example) this wouldn't be a problem, but since I'm looking at the
first request in a new TCP connection it is.

### Increase receiver window size

Since I couldn't find it in `sysctl` or `/sys` I looked at the source.
`net/ipv4/tcp_output.c` has a function called
`tcp_select_initial_window()`.  The last parameter is `__u32
init_rcv_win`. Well, that was easy. Because I'm lazy I just compiled
the kernel hardcoding it to 10 (it's in multiples of MSS).  I started
a lab virtual machine and sure enough the initial window is now a lot
bigger.  Still not seeing a reduction in round trip waits though, and
it's as slow as before.  At least now it's not the receivers
fault. The window has lots of space left but the sender is quiet.

What is this `dst_metric(dst, RTAX_INITRWND)` that it was before I
changed it to hardcoded 10 though? `include/linux/rtnetlink.h` which
defines `RTAX_INITRWND` looks like mostly routing related stuff. Aha!
Sure enough:

```
user@hostname$ ip route help
[...]
OPTIONS := FLAGS [ mtu NUMBER ] [ advmss NUMBER ]
       [ rtt TIME ] [ rttvar TIME ] [reordering NUMBER ]
       [ window NUMBER] [ cwnd NUMBER ] [ initcwnd NUMBER ]
       [ ssthresh NUMBER ] [ realms REALM ] [ src ADDRESS ]
       [ rto_min TIME ] [ hoplimit NUMBER ] [ initrwnd NUMBER ]
[...]
```

Setting these things per route table entry? Yeah that does make
sense. I set values as seen under "Short version" above and a HTTP
request is now just two round trips (three if you count closing the
connection, but the web page is already downloaded at that point so
I'm not counting it), and single-digit milliseconds from first to last
byte. A 96% reduction (26% if you include the connection setup & HTTP
request). (very inexact numbers, I just ran the test once. It's
late. For details on how cwnd affects latency see [Google's paper on
it](http://code.google.com/speed/articles/tcp_initcwnd_paper.pdf).


## Misc

* As far as I can see window size and cwnd can not be set per-socket
  by `setsockopt()` or similar. If they could this would cause people
  to write evil applications that don't play well with the rest of the
  Internet.
* Current cwnd, window size and other data can be seen with
  `getsockopt(..., TCP_INFO, ...)`
* [An Argument for Increasing TCP’s Initial Congestion
  Window](http://code.google.com/speed/articles/tcp_initcwnd_paper.pdf)
* [Google and Microsoft Cheat on Slow-Start. Should
  You?](http://web.archive.org/web/20101229212858/http://blog.benstrong.com/2010/11/google-and-microsoft-cheat-on-slow.html)
* [Linux kernel
  patch](http://web.archive.org/web/20130116151814/http://www.amailbox.org/mailarchive/linux-netdev/2010/5/26/6278007)
  for adding `setsockopt()` for changing cwnd. Not needed. It was
  rejected for a reason.

## Links

* Draft to [increase TCP's initial
  window](http://tools.ietf.org/html/draft-hkchu-tcpm-initcwnd-01) by
  default to 10 * MSS. This has been implemented in Linux.
* [Increasing the TCP Initial Congestion Window on Windows 2008 Server
  R2](http://www.andysnotebook.com/2011/11/increasing-the-tcp-initial-congestion-window-on-windows-2008-server-r2.html)
