---
layout: post
title:  "Erlang BPG daemon"
date:   2008-07-27 00:00:00 +0000
categories: cisco, bgp, erlang, coding, network, bugs
---

I'm writing a [BGP](http://en.wikipedia.org/wiki/BGP)
[daemon](http://en.wikipedia.org/wiki/Daemon_%28computer_software%29)
in
[Erlang](http://en.wikipedia.org/wiki/Erlang_%28programming_language%29).
It can connect, parse update packets and announce routes.

<blargh:body/>

I started up an old [Cisco 2620](http://www.routergod.com/elizabethhurley/)
router and sent route announcement to it until it cried:

```
%SYS-2-MALLOCFAIL: Memory allocation of 65536 bytes failed from 0x8046F3C8,
Pool: Processor  Free: 79840  Cause: Memory fragmentation
Alternate Pool: None  Free: 0  Cause: No Alternate pool

-Process= "BGP Router", ipl= 0, pid= 84
-Traceback= 804733A4 804754C8 8046F3CC 80851CDC 8081C7D8 80832848 80832F3C 8
%BGP-5-ADJCHANGE: neighbor 172.16.x.x Down No memory
```

Muhahahaha!

The program is [here](http://github.com/ThomasHabets/eggpd):
```shell
git clone git://github.com/ThomasHabets/eggpd.git
```

## Update later that night

I flooded the 2620 again for a few minutes and then disconnected the
peer. It stopped responding. Well almost. It answers to ping (17 %
packet loss), and my existing telnet session seems to be working
somewhat, although there is a delay of about 10 minutes between
keystroke and something actually happening. The serial console is no
better. A new telnet session I set up session only has a delay of a
couple of seconds though.


I did get a "show process cpu history":

```
    3333333333333333333333333333333333333333333333333333333333
    4444443333344444666664444444444555555555544444666665555577
 100
  90
  80
  70
  60
  50
  40
  30 *******         ***************          *****     *********
  20 ************************************************************
  10 ************************************************************
     0....5....1....1....2....2....3....3....4....4....5....5....
               0    5    0    5    0    5    0    5    0    5
```
But the cpu is not in use :-):
```
CPU utilization for five seconds: 0%/0%; one minute: 0%; five minutes: 2%
PID Runtime(ms)   Invoked      uSecs   5Sec   1Min   5Min TTY Process
86        6860       568      12077  0.87%  0.10%  0.06%   0 BGP Scanner
80         128       105       1219  0.07%  0.09%  0.02%  67 Virtual Exec
 3         780      1716        454  0.00%  0.00%  0.00%   0 OSPF Hello
 4        5336       865       6168  0.00%  0.06%  0.05%   0 Check heaps
 5           0         6          0  0.00%  0.00%  0.00%   0 Pool Manager
 2          12      1705          7  0.00%  0.00%  0.00%   0 Load Meter
```

Enough for tonight.
