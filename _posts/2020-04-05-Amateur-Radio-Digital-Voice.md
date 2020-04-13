---
layout: post
title:  "Amateur radio digital voice"
date:   2020-04-05 00:00:00 +0000
categories: radio
---

It's a mess.

This post is my attempt at a summary of amateur radio digital voice
modes, and what I think of them.

I'm not an expert, so if you have more experience then your opinion is
likely more valid than mine. But hopefully at least I'm getting the
facts right. Please correct me where I'm mistaken.

## Analog and digital voice

In the beginning there was only analog. Traditionally on [HF][hf] you
used [SSB][ssb], and on [VHF][vhf]/[UHF][uhf] you use FM. Analog
works, and while yes there are different modes, radios tend to support
all of them, or at least the common ones (e.g. most VHF/UHF radios
don't support SSB, because most traffic there is FM). Usually [HT][ht]
traffic is VHF/UHF FM, and for SSB while there is LSB and USB, radios
will support both.

But analog isn't perfect. By going digital we can send metadata such
as call signs, positions, and even pictures and files. And for audio
quality digital will get rid of the static of analog noise. Digital
works better for longer distances, uses less spectrum, and retains
voice clarity much longer.

Yes, there's a sharp cliff when digital voice modes can no longer
reach. One second it sounds perfect, the next you can understand
nothing. That's the nature of digital. It works perfectly until it
doesn't work at all. But in the conditions where digital just barely
works, analog is an awful mess of static where you only maybe can hear
anything.

Digital also enables some fancy things I'll describe, such as
repeating across the Internet.

Analog amateur radio has [EchoLink][echolink] for doing similar
things, but both because I've not used it, and because it's not using
digital modes, I won't say more about that in this post.

## Digital landscape

Here's where the mess comes in.

There's four different standards, completely incompatible (but see
below about the OpenSpot3).

[DMR][dmr], [D-Star][dstar], [P25][p25], and
[C4FM/SystemFusion][c4fm].

I've not used P25, so I don't have anything to say about it.
The rest are very alike, but not quite the same.

For simplex (direct radio to radio) they're pretty much exactly the
same. They sound about the same, they work the same (switch from FM to
the digital mode, done), and there are no surprises.

D-Star and SystemFusion were designed heavily protected by patents
(some of which are now expired), trade secrets, and (because of this)
have a heavy tie to the radio manufacturer.

D-Star radios are sold by Kenwood and Icom. C4FM/SystemFusion is sold
by Yaesu.

DMR has more vendors.

All three of these systems, unlike analog amateur radio, require you
to register your callsign on a website, in order to use fully. They'll
work in simplex without it, but e.g. for SystemFusion Yaesu requires
you to register an account with them to get full use of the system,
inputting both your callsign and your radio serial number.

The patents, trade secrets, and login requirements to me go very much
against the spirit of amateur radio. And [I've ranted about that
before][closed].

Digital mode repeaters don't need to decode the voice. They simply
repeat and route the data as-is. This means you can build a repeater
or write a reflector (see below) without being able to decode the
voice, but it still feels wrong.

There are other digital voice modes, such as FreeDV. I wish every
handset would support FreeDV, but not only do you currently need a
computer to do FreeDV (thus it's a different thing from what I'm
describing here), operationally it's also less interesting. FreeDV is
a solution for simplex, or repeaters. For operators it's less of a
"system" that needs explaining. Implementors just need a codec2
implementation and to read the very short [FreeDV spec][freedv-spec],
and that's it.

So that's why I'm staying with DMR, D-Star and SystemFusion in this
blog post.

## DMR

[DMR][dmr] is popular because of its licensing situation with multiple
manufacturers, which drives down prices.

DMR came out of commercial radio, and is a bit strange when used for
amateur radio.

It has features that don't make sense for amateur radio. E.g. a radio
can be sent a "kill code", to be remotely disabled. That makes sense
if your security guard accidentally triggers their radio every two
seconds by the way they walk, and HQ can shut that interference down
centrally. But with amateur radio there is no "centrally". Each
amateur radio operator is their own licensee.

You need to register in order to get a DMR ID, and can't properly even
program your radio without it.

DMR radios are programmed more "closed". The programming software is
meant to be used by an expert to create a set of configurations for
the whole organization to be distributed to all users in departments,
and a config is called a "Code Plug". So think of it as the security
guards getting radios with the "security guard code plug". It doesn't
have to be programmed that way, but this is the use case they've
made natural.

Many DMR radios can't be put in frequency mode. The AnyTone 878UV can,
but funnily it can't show the frequency and channel name at the same
time. You have to go into the menus to switch to showing one or the
other.

So the experience of using a DMR radio is one where the expectation is
that you are just handed a radio, with channels programmed, and you
are to use those channels because that's what your organization is
licensed to do.

So DMR doesn't feel like amateur radio. Which makes sense. It came
from commercial radio, where these choices made sense.

DMR uses limited [TDMA][wiki-tdma]. There are two time slots. And
instead of the PL tones of analog repeaters, it uses "color codes",
numbered 0-15.

DMR repeaters connect to "servers", which belong to a "talk group"
networks. Talk groups exist so that you can use the same repeater for
your security guards as for your lighting crew, without them needing
to hear each other. Pretty neat.

For amateur radio talk groups use a global database (assuming your
repeater is connected to a server in the BrandMeister system. There
are others I think). You can see [the full list of
BrandMeister][bm-groups], but for example:

* Talk group 1 is "the local repeater"
* Talk group 91 is "World-wide", and has lots of activity
* Talk group 2411 is "SM Tactical" (SM for Sweden), whatever that means

You can set up to listen to multiple talk groups in a a "receiver
list", when you're tuned to a repeater. You won't hear other talk
groups when the repeater broadcasts them, unless you hold down the
Monitor button if you have one. You also have a talk group set for
when you push to talk (PTT). The active PTT talk group is implicitly
in the recever list.

The first time you PTT with a new talk group to a repeater, it will
realize that someone (you) is interested in that talk group and will
start "subscribing" to it and broadcast it for your enjoyment.

This PTT system means that there are many MANY
[kerchunkings][kerchunk] on DMR talkgroups, which interferes with
actual conversation.

DMR doesn't transmit much metadata. You're only identified with your
DMR ID (remember to register), and every receiver has to be programmed
with the now ~160000 DMR IDs for your call sign to show up when you
talk to people.

There was no problem registering. Annoying that you have to, but not a
problem. Annoying also that you have to periodically reprogram your
radio to keep the list of ~160000 DMR IDs up to date.

## D-Star

[D-Star][dstar] was designed by the Japan Amateur Radio League, so was
for amateur radio from the beginning. At the time it was apparently
not feasible to actually have an open standard, so the voice codec was
a proprietary patented one, and you had to pay $25 for a chip to be
able to encode/decode it.

There's some open source code out there now, so maybe in the future
more radios will get it. Though I don't see Yaesu adding it, even if
it's free. They want to continue pushing their own closed system.

D-Star merges "servers" and "talk groups" into one thing, and calls it
"reflectors". So a repeater or hotspot is connected to a reflector,
and that is the group that you are chatting with. Much simpler.

It's polite to ask on the repeater if anyone minds if you link the
repeater to another reflector (unlinking whatever reflector it's
currently linked to) before you key that in, but you can do it
directly from your radio. Some repeaters may be locked to a specific
reflector.

D-Star supports sending not only your call sign and name whenever you
talk, but you can also embed your GPS coordinates if you want.

A popular reflector is "30 Charlie" (REF030C). There's a [full list of
official reflectors][dstar-reflectors], but there are other sets of
reflectors too, and you can even run your own.

You need to register to get started. I think otherwise reflectors will
drop your traffic, but I'm not sure. One problem with D-Star is that
you're supposed to register via your local repeater. But if you're on
a hotspot because you don't have any repeaters nearby, then it can be
hard to get registered.

I had my registration rejected because it was not local, but after
complaining to various places eventually my registration went
through. I don't know who pressed what button to fix it, because
people were not exactly good at replying to my emailed requests.

## C4FM/SystemFusion

SystemFusion is very similar to D-Star. Just incompatible. It also
uses reflectors.

SystemFusion seems to have a more advanced system for querying
metadata though. This may be part of what Yaesu calls "WIRES-X". When
you're in range of a repeater you can leave voice, text, or photo
messages on it, retrieve news, and get a list of reflectors. A
handheld radio is not exactly great for browsing things, but it's
there and seems kinda cool.

Other than that, yeah for operators it's D-Star, but not
compatible. Registration was not a problem, unlike with D-Star.

I'm told (thanks reddit) that registering with Yaesu only gives you
the added the benefit of being able to use your radio as a hotspot
(see below for what a hotspot is), connected to your computer. The
other parts should work without registering.

Using a radio as a hotspot has the benefit over other hotspots in that
it can run at much higher power than the milliwatts that normal
hotspots use.

## P25

I may fill in this section when I have first hand experience with
it. For now I have nothing to say.

## Hotspot

If you don't have a repeater near where you live, or you want to surf
around reflectors / talk groups like a madman, then you can get a
little gateway into the talk group / reflector systems.

How it works is that you use your normal radio, but instead of talking
to a repeater you talk to your own little mini-repeater, that is your
gateway between the Internet and radio. I say "repeater" but it can't
be used to repeat between two radios, only between the Internet and
your radio.

You can build a repeater using two hotspots connected to the same
reflector, and running on different frequencies, but hotspots don't
have high power, so this may be of limited use.

There are others, but just get the [OpenSpot3][openspot]. It does all
three systems, and (unlike every other hotspot, including OpenSpot2),
it does cross mode! It also has a built in battery, so with it's wifi
on the internet side, and RF to your radio, it's extremely handy.

With it you can have a DMR radio, and cross mode so that you're
talking to people on a D-Star reflector. Pretty magic!

I have the OpenSpot2, which doesn't have a battery or cross mode, but
even that one is very awesome.

## Comparing digital modes

To me they sound about the same. D-Star seems to have more variability
between implementations, where some sound more robotic.

DMR is weird. I understand it to be the most popular, but it's always
clear that amateur radio was not the primary design choice for it.

D-Star and SystemFusion are both closed systems, in my opinion. But
other than that pretty equal. SystemFusion/WIRES-X has fancy
mailboxes, as described above.

You should use the system that has repeaters nearby, or the same
system your friends use.

[closed]: https://blog.habets.se/2019/05/D-Star-is-closed.html
[hf]: https://en.wikipedia.org/wiki/High_frequency
[ht]: https://en.wikipedia.org/wiki/Walkie-talkie
[ssb]: https://en.wikipedia.org/wiki/Single-sideband_modulation
[wiki-tdma]: https://en.wikipedia.org/wiki/Time-division_multiple_access
[bm-groups]: https://www.pistar.uk/dmr_bm_talkgroups.php
[dstar]: https://en.wikipedia.org/wiki/D-STAR
[kerchunk]: https://www.k0nr.com/wordpress/2012/12/proper-kerchunking/
[openspot]: https://www.sharkrf.com/products/openspot3/learn-more/
[vhf]: https://en.wikipedia.org/wiki/Very_high_frequency
[uhf]: https://en.wikipedia.org/wiki/Ultra_high_frequency
[echolink]: https://en.wikipedia.org/wiki/EchoLink
[dmr]: https://en.wikipedia.org/wiki/Digital_Mobile_Radio
[p25]: https://en.wikipedia.org/wiki/Project_25
[c4fm]: http://systemfusion.yaesu.com/what-is-system-fusion/
[dstar-reflectors]: http://www.dstarinfo.com/reflectors.aspx
[freedv-spec]: https://freedv.org/freedv-specification/
