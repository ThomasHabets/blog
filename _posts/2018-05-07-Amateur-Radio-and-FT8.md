---
layout: post
title:  "Amateur Radio and FT8"
date:   2018-05-07 00:00:00 +0000
---

My interest in SDR got me into [Amateur
Radio](https://en.wikipedia.org/wiki/Amateur_radio). One reason was
that so that I could transmit on
non-[ISM](https://en.wikipedia.org/wiki/ISM_band) bands and with more
power. Turns out the [2.3GHz band
available](https://www.ofcom.org.uk/__data/assets/pdf_file/0027/62991/amateur-terms.pdf)
to Amateur Radio operators is much quieter than the 2.4GHz band where
WiFi, bluetooth, microwave ovens, drones, cordless phones and
everything else lives. Shocker, I know.

Amateur radio doesn't just have voice and morse code, there's also
[digital modes](https://www.youtube.com/watch?v=HQIG_vMGe1A).

A popular mode is
[FT8](https://en.wikipedia.org/wiki/WSJT_(amateur_radio_software)#FT8). It's
only used to exchange signal reports, so there's no chatting. It's in
fact often practically unattended.

It's a good way to check the quality of your radio setup, and the
radio propagation properties that depend on how grumpy the ionosphere
is at the moment.

If you transmit, even if you nobody replies, you'll be able to see on
[PSKReporter](https://www.pskreporter.info/pskmap) who heard you,
which is useful.

Because propagation should be pretty much symmetric, receiving a
strong signal should mean that two-way communication is possible with
the station. Though FT8 is a slow mode that will get through where
others won't, so a weak FT8 signal means that any voice communication
is very unlikely to get through.

Unfortunately unlike
[WSPR](https://en.wikipedia.org/wiki/WSPR_(amateur_radio_software)#The_WSPR_Protocol)
the standard FT8 protocol doesn't include transitter power. So you
don't know if the reason you can hear a remote station is that they've
cranked up way beyond
[QRP](https://en.wikipedia.org/wiki/QRP_operation). The only way to
correlate transmitter power with signal report is if you transmit (and
thus know your transmitted power) and someone replies with a signal
report.

I set up a listening station with a [Raspberry Pi
3](https://www.raspberrypi.org/products/raspberry-pi-3-model-b/), a
[SignaLink USB](http://www.tigertronics.com/slusbmain.htm), and an
[Elecraft KX2](http://www.elecraft.com/KX2/kx2.htm). I tried using a
[Raspberry Pi Zero
W](https://www.raspberrypi.org/products/raspberry-pi-zero-w/), but
connecting two USB devices plus a USB hub caused spontaneous reboots
due to power drain. I could use a USB hub with its own power source,
but the Zero CPU is so slow that you have to set it to do a Fast
Decode, meaning it'll be less sensitive to weak signals. Also I
already had a Raspberry Pi 3 doing other things.

The antenna is an [AlexLoop](http://www.alexloop.com/) [magnetic loop
antenna](https://en.wikipedia.org/wiki/Loop_antenna), so it requires
tuning to the frequency in use. That's no problem since I'm not tuning
around.

The antenna is just leaning against a window inside a flat, so it's
amazing how well it works. It even heard a few stations in South America!

## Steps

1. Dial an FT8 frequency. In my case 14.074MHz.
2. Tune the antenna either by ear or with the help of [this
   tool](https://github.com/ThomasHabets/radiostuff/blob/master/alextune/alextune_cli.py)
3. Start wsjtx, and set it to report to 127.0.0.1:2237
4. Build and run
   [wxlog](https://github.com/ThomasHabets/radiostuff/blob/master/wxlog/cmd/wxlog/wxlog.go),
   logging to disk.
5. Create fancy output like this map using [the mapper
   tool](https://github.com/ThomasHabets/radiostuff/blob/master/wxlog/cmd/mapper/mapper.go)

<iframe height="400px" width="100%" src="/static/2018-05-ft8.html"></iframe>

![Radio setup](/static/2018-05-radio-setup.jpg)
![Radio setup](/static/2018-05-alexloop.jpg)
[![Solar weather](http://www.hamqsl.com/solar101vhf.php)](http://www.hamqsl.com/solar.html)

## Random Notes

* "[ISM] applications (of radio frequency energy): Operation of equipment
or appliances designed to generate and *use locally* radio frequency
energy for industrial, scientific, medical, domestic or similar
purposes" — ITU Radio Regulations Article 1.15. (my emphasis)
* [VOACAP propagation prediction](http://www.voacap.com/)
