---
layout: post
title:  "Spanning tree limits"
date:   2009-06-28 00:00:00 +0000
categories: cisco, spanning-tree, network
---

I'm compiling a list of spanning tree and VLAN limits on different switches.
This is what I've come up with so far. I don't have an authoritative source for
these, but in many cases this is hard to get from specs.

**If you go over these limits, bad things will happen!**
(broadcast storms, VLANs disappearing, cats and dogs living
together. That sort of thing)

<blargh:body/>

An "STP instance" is "a tree" in a spanning tree. So this only applies
to PVST/PVST+ and similar.  MST has a way lower limit (like 16), but
you shouldn't need more than a couple. But you know that if you're
using MST. So in most cases I would say this is the limit of the
number of VLANs you can have since if you have 50+ VLANs then you're
probably running some form of spanning tree.


Switch                                       | Max STP Instances     | Max number of VLANs
-------------------------------------------- | --------------------- | -------------------
Cisco 2900XL                                 | 64                    | 64
Cisco 2950/2955                              | 64                    | 64
Cisco 2950G-xx-EI                            | ?                     | 250
Cisco 2950C-24                               | ?                     | 250
Cisco 2960                                   | 128                   | ?
Cisco 2960 w/ LAN Lite sw                    | 64                    | 64
Cisco ME2400                                 | 128                   | ?
Cisco ME3400                                 | 128                   | ?
Cisco 3500 XL                                | ?                     | 250
Cisco 3550                                   | 128                   | 1024
Cisco 3560                                   | 128                   | 1024
Cisco 3750                                   | 128                   | 1005
Cisco 3020/3040 blade switch                 | 128                   | 1005
Cisco ONS 15454 SDH/15454/15327 ML-series    | 255                   | ?
Cisco 4500 SupV                              | 3000 logical ports    | ?
Cisco 6500/7600                              | See below             | 1023?
Nexus 7k                                     | See below             | 4096 per VDC, 16384 per system
Extreme Summit                               | 64?                   | ?
Extreme Blackdiamond                         | 64?                   | ?
HP 1800-8G                                   | ?                     | 64*
HP 2500                                      | ?                     | 64*
HP 2600 (2626,2650,etc..)                    | ?                     | 253*
HP 10Gb Ethernet BL-c Switch                 | 32                    | 1000
ProLiant BL p-Class GbE2 Interconnect Switch | 16                    | ?
Nortel Application Switches                  | 16                    | ?
IBM BladeCenter                              | 64                    | ?
FastIron X series                            | 254                   | ?
Fastiron WS series                           | 253                   | 4096
JunOS 9.0                                    | 4094                  | ?
Alcatel OmniSwitch 6600                      | 253                   | ?

\* From official documentation

### Cisco 6500/7600

The 6500/7600 is a bit special in many ways, so it's no surprise that
it's different here too. The 6500/7600 has a per-chassi limit of
10'000 "active logical ports" and a per line card limit of 1'800
"virtual ports" (more with MST).

#### Active logical ports (10'000 per chassi with PVST+, 50'000 with MST)

An active logical port is simply one for every VLAN on all ports
combined.  A trunk port carrying 100 VLANs is 100 logical ports, and a
switchport mode access port is 1.  46 trunk ports carrying 120 VLANs
plus 2 non-trunk ports therefore means 46*120+2=5'522 logical
ports. Well within the 10'000 limit.

##### show spanning-tree summary total

```
Router#show spanning-tree summary total
Switch is in rapid-pvst mode
Root bridge for: [...]
EtherChannel misconfig guard is enabled
Extended system ID           is disabled
Portfast Default             is disabled
PortFast BPDU Guard Default  is disabled
Portfast BPDU Filter Default is disabled
Loopguard Default            is disabled
UplinkFast                   is disabled
BackboneFast                 is disabled
Pathcost method used         is short

Name                   Blocking Listening Learning Forwarding STP Active
---------------------- -------- --------- -------- ---------- ----------
116 vlans                    0         0        0        189        189
```
(189 active logical ports in this example)

12.2(33)SXI with Sup720 and later upgrade this limit to 100'000 for MST
and 12'000/15'000 for RPVST+/PVST+.

#### Virtual ports (1'800 per line card with PVST+, 6'000 with MST)

Virtual ports are calculated much like logical ports, with two differences:

1. Virtual ports are calculated per line card, not per chassi
2. Virtual ports count for each interface part of a port-channel

So while you can have the 46 trunks (with 120 VLANs) + 2 accessports
in one chassi, you can't have them on the same line card. You can't
have 12 portchannel trunkports with 4 ports each either, because
that's `12*4*120=5'760` virtual ports. With MST that's ok, but you are
closing in on the 6'000 limit.

##### show vlan virtual-port slot X

```
Router#show vlan virtual-port slot 3
Slot 3
Port        Virtual-ports
-------------------------
Te3/1               1
Te3/2               116
Te3/3               2
Total virtual ports:119
```
(119 virtual ports on line card 3)


In Release 12.2(33)SXI1 and later releases, the virtual port limit
does not apply to WS-X67xx and WS-X65xx switching modules.

#### Summary of 6500/7600

If you have many trunks, especially many trunks on the same line card,
check to make sure that you're not hitting these two distinct limits.
You may have to move trunks around in order to keep down the number of
virtual ports per line card.


### Nexus 7k with NX-OS 5.x
Max VLANs: 4096 per VDC, 16,384 VLAN ports per system<br/>
Logical ports per system: 16,000 Rapid PVST+, 90,000 MST

### Sources

* [Cisco Service Delivery Center Infrastructure 2.1 Design
  Guide](http://www.cisco.com/en/US/solutions/ns340/ns394/ns50/net_design_guidance0900aecd806fe4bb.pdf)
* [Data center networking - Architechture and design
  guidelines](http://www.netyourlife.net/forum/attachments/NW07_BRKDCT-2701.pdf)
* [Release Notes for Cisco IOS Release 12.2(33)SXH and Later
  Releases](http://www.cisco.com/en/US/docs/switches/lan/catalyst6500/ios/12.2SX/release/notes/ol_14271.html#wp26366)

### More?

If you have more information, please let me know and I will update
this post.