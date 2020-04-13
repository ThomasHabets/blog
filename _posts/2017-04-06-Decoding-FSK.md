---
layout: post
title:  "Decoding FSK"
date:   2017-04-06 00:00:00 +0000
categories: gnuradio, radio
---
Something I've been playing with lately is software defined radio with
GNURadio. I'm not good at it yet, but I've managed to decode the
signals from a couple of things.

This is my step-by-step for how I decoded data from a boiler
thermostat. I'm not saying it's the best way, or even a good way. But
it's what got me there.

# 0. Find the frequency

Often this is written on the device itself. Other times it's in the
manual. If not, then more research is needed, such as by trying to
find the manufacturer on [fcc.gov](https://www.fcc.gov/) or similar.

In this case it was easy. The manual said "868 MHz", which is in the
[SRD860
band](https://en.wikipedia.org/wiki/Short_Range_Devices#SRD860).

# 1. Capture some data

When I poked at the controls of the thermostat, saying "please make
the room 25 degrees", the thermostat must send this data to the
boiler. I could hear the boiler start up and shut down, so there must be
something sent between me pressing the buttons and I heard the results.

I started by centering around 868.5 Mhz with 1Msps. The minimum for
the RTL-SDR is 900ksps, so even if you wanted to see less than 1MHz
you need to capture more first, and then downsample later.

A waterfall showed action around 868.288 MHz, that when slowed down
became obvious 2FSK.
![2FSK](/static/2017-04-fsk-data.png)

I started a new capture at 868.288Mhz at 1Msps of both "boiler goes
on" and "boiler goes off", and saved to file.

![01-capture.grc flowgraph](/static/2017-04-fsk-01-capture.png)

[01-capture.grc](https://raw.githubusercontent.com/ThomasHabets/radiostuff/master/boiler/01-capture.grc)

# 2. Cut away everything before and after the burst

Tweak "skip" and "save" variables (given in seconds) to get a smaller
file that can be played with without needing to wait. Keep a bit of
buffer on both sides though.

![02-cut.grc flowgraph](/static/2017-04-fsk-02-cut.png)

[02-cut.grc](https://raw.githubusercontent.com/ThomasHabets/radiostuff/master/boiler/02-cut.grc)

# 3. Filter the signal

An easy way to clean up the signal is to squelsh away the noise, and
then band pass only the regions where there should be signal.

This is very likely not the best way to get the best range, but it
does make it easy to work with the signal visually. And decoding a
strong signal can be a first step to later tweaking to be able to
receive weaker signals.

All inputs to a Frequency Sink must have the same sample rate, so
compensate for the decimation by repeating the signal.

Because the signal coming out of the band pass filter is not still the
original sample rate, it'll create lots of aliasing in the graph.
That's fine. We'll be working with the decimated sample rate anyway.

![03-filter.grc flowgraph](/static/2017-04-fsk-03-filter.png)

![Filtered data](/static/2017-04-fsk-data-03-filter.png)

[03-filter.grc](https://raw.githubusercontent.com/ThomasHabets/radiostuff/master/boiler/03-filter.grc)

# 4. Quadrature demod

Quadrature demod is a magic box that turns water into wine, and 2FSK
into floats. The output is essentially ">0 means the higher frequency
was active, <0 means the lower frequency was active", and the value shows
how much more active that frequency was.

![04-quad.grc flowgraph](/static/2017-04-fsk-04-quad.png)

![Demodulated data](/static/2017-04-fsk-data-04-quad.png)

[04-quad.grc](https://raw.githubusercontent.com/ThomasHabets/radiostuff/master/boiler/04-quad.grc)

# 5. Moving average

What came out of quadrature demod was a square wave. The input to
clock recovery needs to have peaks, or it won't be able to center a
bit around that peak. If the peak is flat then it won't be able to
adjust closer to the center of that peak.

A moving average will do this nicely. The number of samples to average
is the width, in samples, of a peak.

The output is now a very nice and obvious bit pattern.

![05-moving.grc flowgraph](/static/2017-04-fsk-05-moving.png)

![Moving average](/static/2017-04-fsk-data-05-moving-average.png)

[05-moving.grc](https://raw.githubusercontent.com/ThomasHabets/radiostuff/master/boiler/05-moving.grc)

# 6. Clock recovery

Clock recovery takes a stream of data and picks out the "bits", giving
one output sample per bit. This is much better explained in the
[Guided tutorial PSK
demodulation](https://wiki.gnuradio.org/index.php/Guided_Tutorial_PSK_Demodulation#7.6._Recovering_Timing).

These output bits don't actually look that good. I found that I get
reliable output in the end, but clock recovery is clearly the weak
part of my project.

![06-clock-recovery.grc flowgraph](/static/2017-04-fsk-06-clock-recovery.png)

![Recovered bits](/static/2017-04-fsk-data-06-clock-recovery.png)

[06-clock-recovery.grc](https://raw.githubusercontent.com/ThomasHabets/radiostuff/master/boiler/06-clock-recovery.grc)

# 7. Packets, assemble!

We now have a stream of bits, surrounded on both sides by
zeroes. Turns out there's no good standard block to turn this into
packets. There's "Tagged Stream to PDU", but it wants the packet
length.

So I had to write my own block. Because this block will be running at
the bit rate of 2400sps and not the original sample rate of 1Msps or
even the post-filter sample rate of 200ksps, I thought it would be
fine to write it in Python. I have another block decoder for OOK
designed to run at higher sample rates, and there the performance
benefits of using C++ really mattered.

The block treats >0 as "one", <0 as "zero", and 0 as "end of
packet". At end of packets it tries to find the packet preamble, and
if found will emit a PDU.

As expected, the packet for "on" and the packet for "off" are static,
and they differ by one bit.

![07-sink.grc flowgraph](/static/2017-04-fsk-07-sink.png)

![PDU](/static/2017-04-fsk-data-07-sink.png?tmp=tmp2)

[07-sink.grc](https://raw.githubusercontent.com/ThomasHabets/radiostuff/master/boiler/07-sink.grc)

[packet decoder](https://github.com/ThomasHabets/radiostuff/blob/master/gr-habets/python/pn_decode_identity_b.py)

# 8. Ship it!

This is the same as step 7, except capturing data live. The flow graph
is simple and fast enough to run on a [Raspberry
Pi](https://en.wikipedia.org/wiki/Raspberry_Pi) 3.

![08-live.grc flowgraph](/static/2017-04-fsk-08-live.png)

[08-live.grc](https://raw.githubusercontent.com/ThomasHabets/radiostuff/master/boiler/08-live.grc)

# 9. Data over time

After setting this up to log indefinitely I saw that the thermostat
sends a command to the boiler once every 10 minutes in addition to
when I triggered it with buttons. Presumably if the thermostat dies the
boiler will automatically shut down after missed commands, so these
transmissions every 10 minutes serve as keep-alive.

![Boiler status over time](/static/2017-04-fsk-boiler.png)
