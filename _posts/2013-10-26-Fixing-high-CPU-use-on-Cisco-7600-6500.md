---
layout: post
title:  "Fixing high CPU use on Cisco 7600/6500"
date:   2013-10-26 00:00:00 +0000
categories: cisco, network
---
<strike>Recently</strike> some time ago (this blog post has also been
lying in draft for a while) someone came to me with a problem they had
with a Cisco 7600.  It felt sluggish and `show proc cpu` showed that
the weak CPU was very loaded.

This is how I fixed it.

<blargh:body/>

`show proc cpu history` showed that the CPU use had been high for quite a while,
and too far back to check against any config changes. The CPU use of the router
was not being logged outside of what this command can show.

`show proc cpu sorted` showed that almost all the CPU time was spent in interrupt mode.
This is shown after the slash in the first row of the output. 15% in this example:

```cisco
Router# show proc cpu sorted
CPU utilization for five seconds: 18%/15%; one minute: 31%; five minutes: 42%
PID Runtime(ms)   Invoked      uSecs   5Sec   1Min   5Min TTY Process
198   124625752 909637916        137  0.87%  0.94%  0.94%   0 IP Input
[...]
```

Interrupt mode CPU time is (a bit simplified and restricted to the
topic at hand) used when the router has to react to some user
traffic. Now why would the 7600 use the CPU for the forward plane?
It's a hardware-based platform, isn't it? Yes and no. The "normal"
traffic path is handled in hardware, but if there's anything
nonobvious that it has to do then it's "punted" to the CPU and handled
there.

Ok, so packets are being sent to the CPU because there's something
special about them. What?  You can sniff the RP and send it using
ERSPAN to some UNIX box, and run tshark/wireshark there.  But in some
cases there is no UNIX box (or other sniffer recipient) than can peel
off the ERSPAN header and look inside, and you have no machine more
directly attached so that you can run SPAN or RSPAN.

Enter `debug netdr capture rx`. It starts a sniff of punted packets
and puts it into a small buffer. When the buffer is full it stops
sniffing. If you're punting a lot of packets this buffer will of
course fill fast.  Then run `show netdr captured-packets` to see the
packets in the buffer. It's safe to do on a live system.

When looking at the packets I saw no reason for them to be punted. It
was normal IPv4 packets, TTL wasn't 0, it wasn't directed to the
router itself, a route existed in the routing table for it,
etc.. However, all of the packets were destined to addresses within
the same /24. And sure enough, when tracerouting to the address it was
obviously a routing loop.

I fixed the routing loop, and the CPU use dropped by ~10%. I then did
a new sniff and found more routing loops that had been misconfigured
at the same time. Eventually the interrupt CPU went down to 10%, which
was normal for the features and traffic patterns in use. But the total
CPU load was still at over 90%.

`show proc cpu sorted` showed a whole bunch of "Virtual Exec"
processes eating most of it. `show users` revealed that there were
multiple logins by user "rancid".
[RANCID](http://www.shrubbery.net/rancid/) is a program that logs in
now and then and runs a few commands to save configuration
changes. Apparently these never had time to finish under the high
load, and having 10 of these logged in at the same time caused quite a
bit of load in itself, so I kicked them out with `clear user vty X`.

The CPU went back to normal, and everyone lived happily ever after.

## Side nodes

* I use the term "router" here loosely, since we all know [the big
  secret behind the Cisco 7600](/2009/10/Holy-ip-packet-Batman.html).

* We couldn't turn off `ip unreachables` or even rate-limit the
  punting (mls rate-limit or COPP) because (long story short) that
  breaks stuff for us. Normally you can, though. But if you're using
  it as a "fix" then you may just be fixing the symptoms, not the
  problem. Had we done it here we would have lowered the CPU use, but
  the routing loop would still be there.

## Links

* [Catalyst 6500/6000 Switch High CPU Utilization](http://www.cisco.com/en/US/products/hw/switches/ps708/products_tech_note09186a00804916e0.shtml)
* [Troubleshooting high CPU under interrupts on 7600 and 6500 boxes using "debug netdr" tool](https://supportforums.cisco.com/docs/DOC-14086)
* [6500-RP-Inband-SPAN](http://www.pingjeffgreene.com/networkers-corner-2/troubleshooting-tools/6500-rp-inband-span/)
* [6500 SPAN the RP](http://cisco.cluepon.net/index.php/6500_SPAN_the_RP)
