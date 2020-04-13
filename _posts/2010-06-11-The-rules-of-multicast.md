---
layout: post
title:  "The rules of multicast"
date:   2010-06-11 00:00:00 +0000
categories: multicast, cisco, network
---
## The first rule of multicast is you *don't* talk about multicast
Most networks don't do multicast routing, which means most network
guys don't have much experience with it. Sure they know that it
exists, and it's probably used on their layer 2, but they don't do
multicast routing. These "rules" list some things that you should know
when configuring or troubleshooting multicast.

## The second rules of multicast is you do *not* forward packets coming from a non-RPF interface

If a multicast packet is received, and it's not the multicast RPF
interface, it's dropped. The table can be viewed with "show ip
mroute", and it will clearly show what interface is acceptable. Here's
an example of group 239.0.0.1:

![Network map](http://cdn.habets.pp.se/blog.habets.pp.se/static/2010-06-xx_multicast_net.png--0)

```
R1#show ip mroute 239.0.0.1
[...]
(*, 239.0.0.1), 00:00:08/stopped, RP 1.0.0.1, flags: S
  Incoming interface: Null, RPF nbr 0.0.0.0
  Outgoing interface list:
    FastEthernet1/0, Forward/Sparse, 00:00:08/00:03:21

(1.0.0.2, 239.0.0.1), 00:00:01/00:02:58, flags:
  Incoming interface: FastEthernet1/1, RPF nbr 1.1.12.2
  Outgoing interface list:
    FastEthernet1/0, Forward/Sparse, 00:00:01/00:03:28
```

It clearly shows that packets that come from 1.0.0.2 are only accepted
when they come in on interface Fa1/1. Packets with any *other*
source address is accepted by the (*,G) route from any interface. In
both cases the packets will be sent out Fa1/0.

To just show the RPF path to an IP address while not being
multicast-specific, use `show ip rpf`.

```
R1#show ip rpf 1.0.0.2
RPF information for ? (1.0.0.2)
  RPF interface: FastEthernet1/1
  RPF neighbor: ? (1.1.12.2)
  RPF route/mask: 1.0.0.2/32
  RPF type: unicast (ospf 1)
  RPF recursion count: 0
  Doing distance-preferred lookups across tables
```

## Third rule: no `show ip cef`, `no debug ip packet`

You can't go low-level as in unicast and do `show ip cef < destination
address >`.  In order to see what path a forwarded (or locally
originating) multicast packet takes, you have to check `show ip
mroute`. Multicast packets do not show up when doing `debug ip
packet`. The command to use is `debug ip mpacket`, and even then you
must run `no ip mroute-cache` on interfaces where you want to see
packets.

## Fourth rule: Only one RP per group

If you use Auto-RP or PIMv2 BSR this won't be a problem. The protocol
should take care to only create one RP per group. When you define your
RPs statically (`ip pim rp-address < rp-address >`), however, you
run the risk having two unrelated RPs. You can also get this if you
only have one RP address IP, but you announce it from two or more
routers in the network (anycast RP). If you have multiple RPs then
they will have to talk to each other to make sure they all have a
complete list of all senders in the network. Do this by setting up
MSDP between them.

## Rule 5: The unicast routing table is not to be trusted

`show ip route` is not used for multicast routing. Sure, the unicast
topology is a source of information for the multicast one. But if
you're troubleshooting it just might be (i.e.: probably is) because
the process of creating the multicast routing table is not working
properly. Your first source of information is and always should be
`show ip mroute`. You also have `show ip mroute < group-address >
count`, which shows counters for each source and a bit of information
as to why packets (if any) are being dropped, and how many are
forwarded.

## Rule 6: For multicast VPNs, lo0 must have PIM turned on

The MDT speaks using the router id. Just make the router id the same
for LDP, ISIS/OSPF and BGP and nobody will get hurt. lo0 is the simple
choice for router id.

## Rule 7: In order for IGMP snooping to work, you have to define the router port

Describing the problem and possible solutions would make this post way
too big. So I'll let
[Cisco](http://www.cisco.com/en/US/products/hw/switches/ps708/products_tech_note09186a008059a9df.shtml)
do that.

Short version of one of the solutions: Enable PIM on any router facing
a switch, even if you don't expect to actually talk PIM with any other
router on that interface. Also block PIM adjacencies from forming so
that they aren't formed by mistake.

To confirm proper IGMP snooping, run `show mac-address-table
multicast` on the switch.

## Rule 8: Both sender and receiver side need PIM enabled (or not)

[According to
Cisco](http://www.ciscosystems.sc/en/US/docs/ios/12_1/iproute/configuration/guide/1cdmulti.html#wp1001064),
you need to turn on PIM on an interface in order for the router to
listen to IGMP (receiver side) and in order to "perform IP multicast
routing" (which I read as something you need on the sender side). My
testing shows that sometimes you don't need PIM on the sender side
though. But maybe you should enable it just in case. It probably
should be turned on anyway due to rule 7.

But just as with rule 7, make sure that you don't accidentally set up
a PIM adjacency with anyone unexpectedly (this can cause your
multicast to fail, even if the other router isn't misconfigured). If
you aren't using PIM to define the router port (rule 7) you can use
`ip pim passive`. Otherwise you should use `ip pim neighbor-filter`.

## Rule 9: MPLS TE networks need `mpls traffic-eng multicast-intact`

I have no idea why this isn't default, but you have to wave your magic
wand inside your IGP section. `mpls traffic-eng
multicast-intact`. Otherwise you won't have "interoperability between
PIM and MPLS-TE". What that means is that your RPF will be toast and
traffic will be dropped.

Don't turn on PIM on your TE tunnel. It will not work. The short story
is that a TE tunnel is unidirectional, so you won't be able to set up
a PIM adjacency over it. But if you try you will only get your routers
hopes up, but hoping for something that will never happen. You can see
how hopeless it is with the command `show ip rpf < sender-address >`.

## If this is your first multicast network, you *have* to play around

`show ip mroute`, `show ip rpf`, `debug ip mpacket`, `no ip
mroute-cache`. Play with them.  Learn them. Learn them well. You can
know all the unicast you want, but it won't impress multicast one bit.

## Links

* [Multicast Quick-Start Configuration Guide](http://www.cisco.com/en/US/tech/tk828/technologies_tech_note09186a0080094821.shtml)
* [Multicast Does Not Work in the Same VLAN in Catalyst Switches](http://www.cisco.com/en/US/products/hw/switches/ps708/products_tech_note09186a008059a9df.shtml)
* [mpls traffic-eng multicast-intact Command](http://www.ciscosystems.com.ro/en/US/docs/ios/12_0s/feature/guide/mplstemi.html)
* [Enabling PIM on an Interface](http://www.ciscosystems.sc/en/US/docs/ios/12_1/iproute/configuration/guide/1cdmulti.html#wp1001064)
