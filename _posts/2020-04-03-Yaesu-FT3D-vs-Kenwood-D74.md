---
layout: post
title:  "Yaesu FT3D vs Kenwood D74"
date:   2020-04-03 00:00:00 +0000
categories: radio
---

I've had a Kenwood TH-D74 for almost two years now, and was curious to
get a sense of what the competition is like. Seems like everyone's
recommending the Yaesu FT3D. So I got one, and I think I've played
around with it enough now to have an informed opinion.

Summarizing the feeling of them, while I have my complaints about the
usability of the D74, the FT3D is like a time machine back to the 90s
in how well the interface is though through.

I'm sneaking in some mentions of the AnyTone 878UV too. But I've not
used it enough to have a solid opinion yet.

## Programming

With the FT3D upgrading the firmware is a two step process, where you
have to flip a little hidden switch first to "up", to upgrade one
firmware, then to "down", to upgrade the other. And then flip it back
to "middle" for normal mode.

The FT3D programming software costs $25 and comes with a special
cable, but the software also seems downloadable from their
website. The USB cable seems to require a special driver. I guess
that's what you're paying for. At least you can download the software
and put the data on the SD card. But even then the way you do it is to
press "Save", and browse around the SD card looking for the `BACKUP`
file, and overwrite that.

The D74 has none of this nonsense.

The software for neither radio is great. But the FT3D is the one that
had the biggest gotcha: You can cut and paste, but if you cut more
than one channel, and paste it somewhere else, then by default only
the first channel is pasted. The others are lost, so you'll have to
key them in again.

The most annoying bug in the D74 programming software is that if you
copy-paste a channel with 12.5kHz offset into a slot that has 5kHz
stepping, then it'll round that off, pasting the wrong frequency.

Programming directly on the FT3D is frustrating. The repeater offset
is in one menu (`CONFIG`), tone in another (`SIGNALING`), and both
require long-pressing `DISP` to bring up the menu. Programming
directly on the D74 is a breeze.

## Strangely specific HW for features

The FT3D camera feature seems like a good idea, until you realize that
(as far as I can see) it can only be used with the external
mic/camera, not just any camera. I've also tried putting a picture on
the SD card, but I've been unable to send it. I press the `Upload`
option to start browsing for pictures, but it does nothing. I'm
guessing it is because the picture is the wrong format, or in the
wrong place, or something like that. But it doesn't seem documented,
and no error message.

The only compatible camera to FT3D being the optional mic is as silly
as with the D74 where you can only take a screenshot if you buy the
external mic with the take-screenshot button.

## Menus

The menu system is pretty much the same quality between the FT3D and
D74. In other words not great. D74 has a strange division between
D-Star features and "everything else". Almost as if two different
departments implemented them, and then they just slapped them
together.

The FT3D has some strange menus too. For example would you expect TX
power under `CONFIG` or `OPTION`? Nope, it's under a special menu with
an on-screen button labelled "F MW". How about GPS logging? That's
under `CONFIG`. Ok, makes sense. Right next to turning the GPS on and
off? Nope, that one's under `APRS`. At least the C4FM and FM modes are
not divided into two menu systems.

## Buttons

D74 wins out on efficient operation, having many more physical
buttons. It's a design choice, sure. But does the FT3D really need a
dedicated Wires-X button, a band button, and G/M button? Or could one
of those could have been a "menu" button so that the menu could be
activated without a long press?

The FT3D side buttons are much nicer though. The D74 occasionally gets
accidental PTT presses from me when I handle it clipped to my
belt. I've not had that with the FT3D. The belt clip on the FT3D is
better too. The key lock feature (also a side button) is much, much
better on the FT3D. A simple click. On D74 it's a two-button click
that's hard to do with gloves or with the protective case on.

## Entering text

On the Yaesu typing a message is frustrating. Replying to a message
means manually deleting the old message, because your reply is an edit
what you reply to. That's just wrong.

And selecting a letter only sometimes progresses you to the next
position. Normally after pressing "abc" three times and waiting you'll
get a "c", with the cursor moved to the next spot. But not with the
FT3D. You often have to press right arrow to advance. But you can't do
that to add a space. You have to press "space", then right arrow. But…
why?

## Ports & attachments

FT3D uses mini-USB instead of D74's micro-USB. Meh. They both have
advantages.

The FT3D did not work with any of my 8GB SD cards. I had to switch to
a 32GB one, which is a waste.

Seems you can't charge and operate the FT3D. Plugging in while it's on
reboots into a "running off of AC" mode. Ok, I guess that's fine. But
if you're in that mode and turn it off again, it goes into "no
battery" mode, not into charging mode. So you have to unplug and
replug the charger after that.

Charging issues can be a big deal. My Elecraft KX2 battery charger
lights up green if the battery is connected (no matter what state of
charge the battery is in), but you forget to actually plug it into the
wall. If you leave it for too long the charger will actually
completely drain the battery, which is the opposite of what you
wanted. If AC is not connected it then the LED should be off. I
reported this to Elecraft and they replied that they agree this isn't
great, but that's how the charger they're selling is.

Not fun to come out to the park only to find that the battery you
thought you left charging overnight is flat.

## APRS

The best band to use for APRS as a second VFO is A on D74, B on
Yaesu. I prefer it to be B.

D74 has built in KISS TNC. Seems much easier as you only have to
connect a USB cable to send/receive packets, as opposed to connecting
analog TX/RX and PTT, and set up a software TNC.

Operating APRS, in addition to typing, is much nicer with quick access
to functions via the extra buttons on the D74. E.g. raising the radio
high above your head and beaconing out a couple of times is easier
with it.

## Manual

The Yaesu manual is full of typos. Including one screenshot that shows
their own trademark, WIRES-X, as "WIRSE-X".

It's not as bad in this regard as the AnyTone 878UV manual, which in
addition to typos also has the problem of being extremely minimal in
what it covers.

## Sound quality

After having listened a bunch to D-Star on D74, DMR on AnyTone 878,
and C4FM on the FT3D, I think they're about the same. D-Star seems to
be more dependent on the implementation, where some people sound like
robots and others sound great. I'll make a separate blog post on the
different digital systems at some point.

I know some people complain about the lack of volume from the FT3D,
but it's fine.

The AnyTone 878UV is famously loud. And yeah, it's really loud if you
turn it up.

## RF Performance

Due to the pandemic I've not been able to compare much in the
field. And I can't reach any repeater from inside my flat.

I did some indoor tests though for reception. I set my [USRP
B200][b200] to transmit a solid FM tone, and went into another room to
pick up the signal with various radio configurations.

It's very close, but it sounded like the FT3D was slightly better at
picking up the tone. I'm not sure if this is because the speaker on
the D74 seems to have more base, and the base noise might have drowned
it out a bit. The general sound profile reproduction is different
enough that my untrained ears can't be sure. So call it mostly a tie.

They were both much better than the AnyTone 878UV, and my Beofengs. In
fact I think the AnyTone was probably worst of all.

I tested both on 2M and 70cm, and swapped around antennas between the
stock ones and a Diamond SRH940.

Again, I wouldn't call these exhaustive or even objective
tests. Ideally they should at least be done with headphones to remove
the speaker from the equation.

I checked RF harmonics on VHF using a 200MHz/1Gsps oscilloscope
(Hantek DSO4202P), and as expected saw no noticeable harmonics on
FT3D, D74, or the AnyTone. The Baofengs were a different story, so I
could confirm that the measurement method works.

## Headphones

If you want to plug in normal headphones then unfortunately both of
these radios make you build your own cable. The connector for
mic/speaker is a combination one that also has PTT, so if you just
plug them in you'll start transmitting nonstop.

I've not yet built a cable for the FT3D, because at least for now I'm
happy with the FT3D bluetooth support for headphones. The D74
bluetooth doesn't work at all with my Bose QC35s, so there I have to
use my custom cable.

## Durability

The FT3D feels more sturdy. But on the other hand my D74 has had a
couple of big bangs, including dropping 2 meters landing on a big
rock, and has survived great with only a couple of scratches.

For any HT I recommend [these paracord carabiners][paracord], to
reduce the amount of droppage.

## So which one should you buy?

Buy the one you whose digital system you want access to. If your local
repeaters are C4FM, get the FT3D. If you're in D-Star land, get the
D74.

For analog, I'd say the D74 is much nicer. Quick to program. APRS much
nicer to operate both for position and messaging.

[b200]: https://www.ettus.com/all-products/ub200-kit/
[paracord]: https://www.amazon.co.uk/gp/product/B07J3ZRPJK/
