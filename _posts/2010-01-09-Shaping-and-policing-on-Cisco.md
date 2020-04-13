---
layout: post
title:  "Shaping and policing on Cisco"
date:   2010-01-09 00:00:00 +0000
categories: cisco, network, qos
---
This post is about policing and shaping on Cisco routers and
switches. This is a very big topic so don't expect this post to cover
everything. What I'm attempting to to is cover some things that I
found aren't explained very well by books or the Internets, while
still being readable for someone who hasn't read all the other stuff.

With QoS stuff there are always small differences in practice between
the hardware implementations but I won't go into that here.

### Buckets

In both policers and shapers traffic that "conforms" is traffic that
will be allowed through.  It will be allowed to go out to the
interface (or in to it, if configured for incoming traffic) if there
are as many tokens in the Bc bucket as there are bytes in the packet.

If there are enough tokens then those tokens are removed from the
bucket and the packet is allowed through immediately. If there aren't
enough tokens in the bucket then the packet is not transmitted and the
amount of tokens in the bucket is not changed.  The bucket is being
refilled by a mechanism I will describe later, so that a packet that
is not allowed at time X may be allowed at later time.

Similarly there is a Be bucket for having excessive traffic. This can
be "a bit more" that you allow go get through.

The bucket is not a queue. It does not contain packets or any other
data. A bucket is just a counter of how many tokens it has right now,
up to the maximum. So when we say that tokens are added and removed
from the bucket, what we really mean is that the token counter is
increased or decreased.

### Policer

Whenever a policer needs to check the bucket (meaning when a packet
arrives on an interface or is about to be sent out) it first refills
the bucket. The bucket is refilled with N tokens, where N is `time
since last packet * the configured rate`. Any extra tokens that can't
fit into the Bc bucket is spilled into the Be bucket.  So basically it
goes "has it been a long enough time since the last packet was sent?",
and if there has been, it allows it to go through. If there aren't
enough tokens, the packet is dropped.  It doesn't wait until there are
enough tokens, it's just dropped.

At least that's the theory. It's a tiny bit more complicated than that
when you start going down to the hardware level and the resolution
of the timer, but it will do.

Because the packet is either immediately sent or immediately dropped
it will not by itself smoothen the bandwidth graph. It relies on [TCP
back-off](http://en.wikipedia.org/wiki/TCP_congestion_avoidance_algorithm)
to do that.  This is the main difference between a policer and a
shaper. See [these
graphs](http://www.cisco.com/en/US/tech/tk543/tk545/technologies_tech_note09186a00800a3a25.shtml#policingvsshaping)
for a visual explanation.

Do not be confused by the IOS command reference for "police cir" that
uses the term Tc and Tp to name the buckets (*T*okenBucket *C*IR and
*T*okenBucket *P*IR). It's *not* the same as the time period Tc used
in shaping.

The recommended bucket size (Bc) is 1.5 times the configured rate,
meaning what the policer will allow sustained for 1.5 seconds. For a
policer Bc is specified in bytes. For a 1Mbps policer this would be
1'000'000*1.5/8=187'500 bytes.

If you have a Bc that is too low -- so low that basically one packet
will empty it -- a significant percentage of your packets will be
dropped. TCP does not like this.

Since the bucket is not periodically refilled, but refilled
continuously when needed this means that with the recommended bucket
size (of 1.5 seconds worth of data) if there are no packets to process
for 1.5 seconds then the bucket will become full. The Be bucket may
not be full yet though.  It does *not* mean that if you spend
the whole bucket there will be silence for the rest of the 1.5
seconds.

Traffic that is being policed either conforms, exceeds, or is
violating. If there are enough tokens in the Bc bucket then the
traffic conforms. If it doesn't conform but there are enough tokens in
the Be bucket then it's exceeding. If there aren't enough tokens
anywhere it's violating. You can do whatever you want with this. You
*can* choose to allow only violating traffic, and drop the
rest. But unless you want to have a port-knocking thing where you
can't use a service unless you are simultaneously flooding it, I don't
see the point.

What you actually do is allow conforming traffic, drop violating
traffic, and the exceeding traffic is re-marked somehow (e.g. DSCP,
MPLS EXP, Frame relay DE). If there is congestion somewhere else in
the network then that marking can be used to drop the right traffic at
the congestion point, and not the good traffic. You can also choose to
drop or transmit the exceeding traffic immediately, meaning the
policer will only say "yes" or "no" to a packet, and not "sort of". It
depends on what you want to do.

What you *don't* want to do is create reordering. So don't set
DSCP EF (or MPLS EXP 5 or similar) on conforming traffic and
best-effort on exceeding. You want the rest of the network to keep the
ordering of the packets, but you may want to allow for different drop
probabilities.

#### police ... pir

When you specify PIR on a policer that means you have two different
rates. That's two different streams of tokens being added to your
buckets. The Bc bucket is filled at the rate of your CIR, just like
before. But the Be bucket is no longer filled by the spillover from
Bc. It has its own dedicated re-filler that refills at the rate of
PIR.

What happens when a packet tries to get past one of these two-rate
policer is that Bc is first checked. If there are enough tokens in Bc
the packet conforms and the right amount of tokens are removed from Bc
*and* from Be. If there aren't enough tokens in Bc then Be is
checked similarly.

Sounds a bit complicated but what it ends up accomplishing is that you
can set one rate, the CIR, which you will try to make sure gets to its
destination, and another (higher) rate, the PIR, which you can try to
deliver, but if you can't then no big deal. You'd use a dual rate
policer for example if you want to sell a service where you guarantee
1Mbps, but will allow for up to 50Mbps. You'll have to enforce the
guarantee by other methods not mentioned in this post (a policer does
not guarantee, it only limits), but at least you can mark the packets
at your network edge using the policer.

#### Policing examples
```
interface Gi1/10
  rate-limit output 64000 12000 24000
```

Rate limit outgoing traffic to 64kbps, Bc (bucket size in bytes) is 1.5 seconds worth, meaning
12000 bytes, and 24000 bytes for the Be bucket.

```
ip access-list extended ACL-HTTP
  permit tcp any any eq http
class-map HTTP
  match ip access-list ACL-HTTP
policy-map FOO
  class HTTP
    police 64000 12000 24000 conform-action set-dscp-transmit af11 transmit exceed-action set-dscp-transmit af13 violate-action drop
int Gi1/10
  service-policy input FOO
```

Traffic coming in to Gi1/10 is dropped if it's more than 64kbps, but
allow for some bursting. The bursting (exceeding) data is marked with
a higher drop probability (AF13) than the conforming traffic.
Long-term data throughput is 64kbps since that's the rate at which the
Bc bucket will be refilled.  The Be bucket will only be refilled by
spillover from the Bc bucket.

So do you want excess bursting? And if so, how much? Good question.
[Cisco recommends Be to be twice that of
Bc](http://www.cisco.com/en/US/docs/ios/12_2/qos/configuration/guide/qcfpolsh.html#wp1000977).


Note that your IOS version may change what's written in the
configuration so that it says "police cir".  Don't worry, it's all the
same. As long as there's no "pir" in there, because then it will be a
two-rate policer.

This is a single-rate three-color policer. Single rate since there is
only one flow of tokens to the buckets (the spillover flow from one
bucket to the other doesn't count) and three-color since data is
divided into three groups (conform, exceed and violate).

### Shaper

A shaper is slightly different. The first and most obvious difference
is that a shaper will not drop a packet that does not conform. The
packets will be put in the queue until they conform. There are queue
management methods that say what happens to packets waiting in a
queue, and some things to think about with queue depth and what
happens when the queue is full, but that's not the topic of this post.

With a shaper the bucket is *not* refilled continuously. The
bucket gets Bc number of bits (shaper Bc is measured in bits, not
bytes) at even intervals. So literally a bucketful of bits at even
intervals. How often? Well.. it obviously gets CIR number of bits into
its bucket every second.  And I just said that it gets it Bc bits at a
time. So there are CIR/Bc of these intervals in a second, and we call
this interval Tc. Tc can be between 4 and 125ms (1/8th of a
second). You *cannot* have a Bc that is so big that your Tc is
bigger than 125ms. If you try, it will change what you do into
something that fits into this. And you wouldn't want to. So don't try
to set Bc to 1.5 seconds worth of CIR in a shaper because it will not
work.

See, if you have a super-big Bc (and therefore a Tc bigger than
125ms), if you spend your bucket at the start of the Tc, the line will
be silent for the rest of the Tc time period. That spells bad news for
any voice data. If you have a gigabit interface that you have shaped
down to 64kbps and a Bc of 8000 bits (meaning a Tc of
8000/64000=125ms) you can send 64000bits in 64us. This means that the
line will be silent for the remaining 124.9ms. That's a long time to
not get any data.  That's probably noticable for even ssh
sessions. You don't get any new tokens except when a new Tc interval
starts.

You may ask why someone would use a gigabit interface if they're going
to shape to 64kbps. Well, maybe a customer went over their bandwidth
limit and are currently being throttled. Or maybe there are are 10'000
customers on the same line that are being individually shaped.

Ok, so you don't want a super-big Tc. How about a small one, what
would that do? If you set Bc so that Tc is 10ms, that means that no
matter how wasteful you are with your bucket at the beginning of the
Tc it's not that big of a deal. You just have to wait until the next
period starts and you'll have a whole new bucketful to use to send
packets. Hopefully you have your queue management set up so that any
new important traffic (such as voice data) gets preferential
treatement in the queue and won't be tail dropped if the queue is
full.

The only reason not to set Bc too low (and therefore a short Tc) is
because it takes more CPU to fill the bucket more often.

At the start of a new Tc the Bc bucket will be full. It was after all
just refilled with Bc number of tokens. Any tokens that spill out of a
full Bc bucket end up in the Be bucket. The Be bucket is not directly
refilled, but only gets the overflow from the Bc bucket.

#### Shape peak

When using "shape peak" instead of "shape average" the Be bucket is
refilled with Be number of tokens at every Tc. It's just like defining
a PIR with a policer.  The total number of tokens added to both
buckets are therefore Bc+Be, meaning that Bc+Be number of bytes can be
sent every Tc. "shape peak 64000 8000 8000" will therefore have a Tc
of 8'000/64'000=125ms, and fill in 8'000+8'000 bits in that time. That
means that every second (8000+8000)*8=128'000 bits can be sent (or in
this case twice the CIR) this second and every second forever. So you
set Bc in order to define your Tc, and then Be will change your speed.

#### Shaping examples
```
interface Te4/1
  traffic-shape rate 100000000 12500000
```

Use the "general traffic shaping" command interface to limit outgoing
bandwidth to 100Mbps. Remember that a shaper can never be applied to
incoming traffic, only outgoing.

```
class-map EXP4
  match mpls experimental 4
policy-map BAR
  class EXP4
    shape average 1000000 10000
interface Te4/1
  service-policy output BAR
```

Shape MPLS EXP4-marked traffic to 1Mbps, with a bucket size of 10'000
*bits* (1'250 bytes). If you don't know MPLS then let's say
"http traffic" and use the class-map from the policing example. If a
packet wants to be sent and there aren't enough tokens in the bucket,
then the packet has to wait in a queue until the token bucket is
refilled at the start of the next Tc. The Tc is Bc/CIR =
10'000/1'000'000 = 10ms.

## Some QoS topics not covered

* Bandwidth guarantees - Policers and shapers only limit, they never guarantee a minimum
* Hardware queues - If you know what 7q1p8t means without blinking then you should have no problem with this
* WRED - When queue starts to fill up, kick out the least important traffic, and do it fairly

## References

* [Policing and Shaping Overview](http://www.cisco.com/en/US/docs/ios/12_2/qos/configuration/guide/qcfpolsh.html)
* [Cisco QOS Exam Certification Guide (IP Telephony Self-Study) (2nd Edition)](http://www.amazon.com/gp/product/1587201240?ie=UTF8&tag=habetsppse-20&linkCode=as2&camp=1789&creative=9325&creativeASIN=1587201240)
* [Comparing Traffic Policing and Traffic Shaping for Bandwidth Limiting](http://www.cisco.com/en/US/tech/tk543/tk545/technologies_tech_note09186a00800a3a25.shtml)
* [IOS Command reference for "police"](http://www.cisco.com/en/US/docs/ios/qos/command/reference/qos_n1.html#wp1046487)
* [IOS Command reference for "police ... pir"](http://www.cisco.com/en/US/docs/ios/qos/command/reference/qos_n1.html#wp1047550)
* [IOS Command reference for "shape"](http://www.cisco.com/en/US/docs/ios/qos/command/reference/qos_s1.html#wp1060033)
* [Understanding QoS Policing and Marking on the Catalyst 3550](http://www.cisco.com/en/US/products/hw/switches/ps646/products_tech_note09186a00800feff5.shtml#parameters)
* [QOS Policing and Marking with Catalyst 4000/4500 IOS-Based Supervisor Engines](http://www.cisco.com/en/US/products/hw/switches/ps663/products_tech_note09186a00800946e9.shtml#topic1)
* [QoS Policing on Catalyst 6500/6000 Series Switches](http://www.cisco.com/en/US/products/hw/switches/ps700/products_tech_note09186a00801c8c4b.shtml#calcul)
