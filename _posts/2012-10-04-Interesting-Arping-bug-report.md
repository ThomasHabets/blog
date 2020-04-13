---
layout: post
title:  "Interesting Arping bug report"
date:   2012-10-04 00:00:00 +0000
categories: unix, coding, network, arping
---
A few months ago I was strolling in the [Debian bug tracking
system](http://bugs.debian.org) and found [a curious
bug](http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=667808) filed
against
[Arping](http://www.habets.pp.se/synscan/programs.php?prog=arping), a
program I maintain.

It said that unlike Arping 2.09, in Arping 2.11 the ARP cache was not
updated after successful reply. I thought that was odd, since there's
no code to touch the ARP cache, neither read nor write. Surely this
behaviour hasn't changed?

<blargh:body/>

I tried to reproduce the behaviour and sure enough, with Arping 2.09
the arp cache is updated, while with 2.11 it's not.

```
$ arp -na | grep 192.168.0.123
$ # --- First try Arping 2.11 ---
$ sudo ./arping-2.11 -c 1 192.168.0.123
ARPING 192.168.0.123
60 bytes from 00:22:33:44:55:66 (192.168.0.123): index=0 time=1.188 msec

--- 192.168.0.123 statistics ---
1 packets transmitted, 1 packets received,   0% unanswered (0 extra)
$ arp -na | grep 192.168.0.123
$ # --- Ok, that didn't change the ARP cache. Now try 2.09 ---
$ sudo ./arping-2.09 -c 1 192.168.0.123
ARPING 192.168.0.123
60 bytes from 00:22:33:44:55:66 (192.168.0.123): index=0 time=794.888 usec

--- 192.168.0.123 statistics ---
1 packets transmitted, 1 packets received,   0% unanswered (0 extra)
$ arp -na | grep 192.168.0.123
? (192.168.0.123) at 00:22:33:44:55:66 [ether] on wlan0
```

How could that be? I suspected that maybe the kernel saw the ARP
reply, and snooped it into the ARP table. But I quickly confirmed that
the packets going over the wire were the same for 2.09 and 2.11 (as
they should be).

So what changed between 2.09 and 2.11?

```
$ git log --pretty=oneline arping-2.09..arping-2.11 | wc -l
43
```

Ugh. Before doing a
[bisection](http://git-scm.com/book/en/Git-Tools-Debugging-with-Git) I
skimmed through the descriptions. Most were comments, compile fixes
and documentation. The only functionality changes were

* Switching to `clock_gettime()` (various patches).
  Read <a href="/2010/09/gettimeofday-should-never-be-used-to-measure-time.html">gettimeofday() should never be used to
  measure time</a> for why.
* [Switching to `select()` from `poll()`](https://github.com/ThomasHabets/arping/commit/b0a754550bb873b4fdb7049bfc394d38bfe3c72b)
* [Adding support to use `getifaddr()` to find the correct output interface](https://github.com/ThomasHabets/arping/commit/a03413aa161cace9733a0a3c3c98420c761484ee)

Well, the first two don't look suspicious, so either it's the
`getifaddrs()` or some minor change that shouldn't have
mattered.

Between Arping 2.09 and 2.10 I changed the interface finding code from
an ugly hack of running `/sbin/ip route get 1.1.1.1` to get the
outgoing interface from the routing table. Since the output of the
various "show me the routing table" commands are different in
different OSs, I had to implement this subprocess (ugly) and parsing
(ugly) several times. The new implementation uses
`getifaddrs()` to traverse the interfaces programmatically.

The old code was still there as a fallback. It would never actually
get used unless there's a Linux system out there that doesn't *have*
`getifaddrs()`. It seems [it was added to glibc 2.3 back in
2002](http://sourceware.org/git/?p=glibc.git;a=commit;h=7f1deee65e0a90d9e6699068b5d63a28d2546e12)
when Arping was two years old. Anyway it was trivial to temporarily
switch interface selection back to the old method. I confirmed that
this was indeed what caused this change of behaviour.

Surely `ip route get` doesn't send an ARP request and
populates the ARP cache when it gets the reply? No. So if `ip
route get 1.1.1.1` doesn't do it, and `arping-2.11
1.1.1.1` doesn't do it, then surely `ip route get 1.1.1.1
; arping-2.11 1.1.1.1` doesn't do it?

Yes, yes it does.

It seems `ip route get 1.1.1.1` followed by `arping-2.11 1.1.1.1`
**will** cause `1.1.1.1` to show up in the ARP cache. And it doesn't
matter if `ip route get` is run as an ordinary user or as root!
(arping of course has to run as root or have `NET_ADMIN` capability).
Only the exact address given to `ip route get` will be "open to be
filled" by the second command, so it seems to be per address, and that
`ip route get` will modify state in the kernel.

```
$ arp -na | grep 192.168.0.123
$ sudo ./arping-2.11 -i wlan0 -q -c 1 192.168.0.123
$ arp -na | grep 192.168.0.123
$ # --- Ok, still no entry in the ARP cache Now try running both commands ---
$ ip route get 192.168.0.123 ; sudo ./arping-2.11 -i wlan0 -q -c 1 192.168.0.123
192.168.0.123 dev wlan0  src 192.168.0.100
    cache  mtu 1500 advmss 1460 hoplimit 64
$ arp -na | grep 192.168.0.123
? (192.168.0.123) at 00:22:33:44:55:66 [ether] on wlan0
```

I closed the bug since it's working as intended.

I have not dived into the kernel source to find the reason for this,
but I may come back and update this post if and when I do.

### Links

* [Arping on github](https://github.com/ThomasHabets/arping)
* [Arping home page](http://www.habets.pp.se/synscan/programs.php?prog=arping)
* [Debian bug 667808: Arping 2.11 not update arp cache entry](http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=667808)
