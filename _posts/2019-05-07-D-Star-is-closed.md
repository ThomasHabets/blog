---
layout: post
title:  "D-Star is a closed system"
Date:   2019-05-07 00:00:00 +0000
categories: radio, sdr
---

What is the point of amateur radio? To learn about radio, propagation,
and the electromagnetic spectrum in general. To understand how it
works, and maybe even build or modify your own equipment. The license,
after all, is the only legal way to use the electromagnetic spectrum
at interesting power levels.

In order to learn we must be able to inspect; To tinker, or at the
very least have access to a specification we can build from.

Some amateur radio operators seem to complain that people don't build
their own radios anymore. That they just buy a box and antenna and are
now consumers. This is not what I'm talking about here. First, you
know in principle how your radio works. And you *could* build one that
could replace it. Would it be as good as a modern fancy rig? Of course
not. It wouldn't be as good, but you could build one, and you could
use it just as well as the bought one.

And if you learn enough, and tweak enough with the rig and antenna
system, you could build something better for your particular
environment.

When I first learned that
[D-Star](https://en.wikipedia.org/wiki/D-STAR) used a proprietary
voice codec I couldn't understand the point of D-Star at all. Some
black box you just buy and are a passive consumer? What's the point?
Why even bother with a hobby of sharing and learning, if there's a big
wall saying "this far, no further!", that you are not permitted to
create your own radio for. Or permitted to understand.

If it's just "buy this consumer device and use it, but don't learn"
then why am I not just using skype, or whatsapp, if it's just about
making free phone calls?

I would like to learn and create in all aspects of radio. One of these
is [Software Defined Radio
(SDR)](https://en.wikipedia.org/wiki/Software-defined_radio), which
this proprietary technology prevents me from using to explore D-Star
in a meaningful way.

I'm hopeful that this will change, that proprietary technologies like
the D-Star voice codec go away, now that SDR is starting to be
introduced to amateur radio tests. I hope that'll bring the digital
knowledge and culture of open source together with the radio knowledge
of amateur radio, to create the best of both worlds. As-is D-Star
voice codec is a dead end. It can't lead to new things like
[JT65](https://en.wikipedia.org/wiki/JT65) led to
[FT8](https://en.wikipedia.org/wiki/FT8), and FT8 to
[JS8Call](http://js8call.com/), or other inventions.

It's just there, static, opaque, and for the main purpose of amateur
radio: useless.

If SDR on amateur radio tests brings open source people to amateur
radio, then maybe it can bring openness of technology to the amateur
radio community. (yes, it's weird to me that openness of technology
needs to be brought to, of all things, the xamateur radio community)

[Some](http://www.roblocher.com/whitepapers/dstar.html) call codec
openness "ideological purity of dubious usefulness". In my opinion
the closed codec is what makes D-Star of dubious usefulness. It's a
dead end.

Then there's the registration system. If you ever had to start using
D-Star and didn't live near a D-Star enabled repeater then you know
how annying this could be. In theory you should just be able to
register, but in practice registrations not at "home" seem to be
ignored or denied.

It seems like the
[AMBE](https://en.wikipedia.org/wiki/Multi-Band_Excitation) patent has
expired now, but until there's an implementation of codec (not just
decoder) that's not all that helpful.

I have hopes for [Codec2](https://en.wikipedia.org/wiki/Codec_2) and
[FreeDV](https://freedv.org), but there's a whole legacy proprietary
repeater and reflector system that needs to be dismantled, not to
mention all the handsets that have to be exchanged since none of them
currently support FreeDV, and likely never will get a firmware update
to support them.

What amateur radio really needs is open source digital radios. And it
shouldn't be that unrealistic. Surely it's not that expensive or hard
if only opensource people can combine their skills and let affordable
SDRs be the unifying banner under which a new better amateur radio
world is built.

I'm doing my part, learning enough of the hardware parts to combine a
Raspberry Pi, a USB SDR, a RF Power amplifier, and some other parts to
create an open and more importantly debuggable and software-extendable
radio.
