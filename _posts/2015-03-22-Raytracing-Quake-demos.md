---
layout: post
title:  "Raytracing Quake demos"
date:   2015-03-22 00:00:00 +0000
categories: coding
---
I decided to combine these two problems into one solution:

* Modern CPUs are idle way too much of the time. Why have all this
  computational power if we don't use it?
* I have these funny old Quake demos that there's no good way to
  convert to something playable.

My solution is to convert Quake .dem files to .pov files and render
them with [POV-Ray][povray].

[povray]: http://www.povray.org/

Update: New better screenshot:

[![Quake scene rendered in POV-Ray][newshot]][newshot]

<blargh:body/>

[![Quake scene rendered in POV-Ray][shot1]][shot1]
Quake scene rendered in POV-Ray. Two more [here][shot2] and [here][shot3].

Quake is closing in on 20 years old now, and it's starting to get
annoying to make it even work. Yes, it's opensource, and there are a
couple of forks. But they've also always been annoying to get
working. Hell, even GLQuake in Steam won't start for me. (yes, I know
this is a bad reason, but I'm doing this for fun)

Many of the tools and resources are hard to find. I couldn't find
ReMaic, and only found lmpc thanks to FreeBSD having made it a
package. Converting demos to an ASCII format using lmpc helped in
confirming that my file parsing was correct.

The steps needed to render a demo:

1. Extract .mdl files to .pov and .png (skin) files.
2. Extract .bsp files to .pov and .png (textures) files.
3. Turn the .dem file into one .pov file per frame, including the above as needed.
4. Render all the pov files.

It's interesting to look up these old specs from many generations ago,
because I encountered:

* People were shit at writing specs and tutorials back in the 90s. I'd
  guess collaboration works better now, and that's why become much
  better. Remember that the Quake community predates Wikipedia by 5
  *years*.
* Oooh, here's a newer up-to-date doc. It's a forum post from 2009!
  Only half the links are 404s.

[![Side-by-side][sidebyside]][sidebyside]
Side-by-side. The one with the weapon is the real Quake.

<iframe width="560" height="315" src="https://www.youtube.com/embed/jzcevsd5SGE" frameborder="0" allowfullscreen></iframe>

This video has been severely crippled by YouTube transcoding, so you
can download the original video [here][videotorrent]. More crippled
videos showing the progress on [my youtube channel][youtube].

## PAK

* Thanks for making this a trivial format.

## MDL

* Why use unsigned coordinates that are then translated? Strange.

Update: From John Carmack's .plan file from 1997-07-07:

> As anyone who has ever disected it knows, Quake’s triangle model format
> is a mess. Any time during Quake’s development that I had to go back and
> work with it, I allways walked over to Michael and said ”Ohmygod I hate
> our model format!’. I didn’t have time to change it, though. After quake’s
> release, I WANTED to change it, especially when I was doing glquake, but
> we were then the proud owners of a legacy data situation.

## BSP

* Interesting that texture coordinates are not stored with vertices
  and interpolated after projection, but instead the vertices are
  projected onto the polygon plane. I haven't done 3D coding in a very
  long time, but I don't remember doing it that way.
* Thanks for not making me turn the brushes into polygons myself.
* Why are some models .mdl and some .bsp? Sure, I get that a door
  belongs in the same BSP file, but why are health boxes BSP files and
  weapons are mdl files? Is it because of the lightmaps I'm not using?
* I'm not using the actual [BSP][bsp] parts of the .bsp files, and
  it's nice that I don't have to.

## DEM

* This is essentially a journal of events. Had this been .AVI files
  like newer games we would not be able to move the camera, increase
  resolution, and add special effects. In short, this project only
  works because Quake demo files are in this format.

## Future work

* Take models from other projects and use them instead of the
  original.
* Create [Oculus](https://www.oculus.com)/[Google
  Cardboard](https://www.google.com/get/cardboard/) videos.
* Fix all [outstanding
  issues](https://github.com/ThomasHabets/qpov/issues)

[Source code at github](https://github.com/ThomasHabets/qpov)


[shot1]: https://blog.habets.se/static/2015-03-e1m1-0738.png
[shot2]: https://blog.habets.se/static/2015-03-e1m1-0545.png
[shot3]: https://blog.habets.se/static/2015-03-e1m7-0602.png
[sidebyside]: https://blog.habets.se/static/2015-03-side-by-side.png
[newshot]: https://blog.habets.se/static/2015-03-27-e1m1-2c2b74e-0102.png
[videotorrent]: https://blog.habets.se/static/2015-03-qdqr-recam-e1-v1.avi.torrent
[youtube]: https://www.youtube.com/channel/UCfy8wSKzizcxPvTZDrfHKjA
[bsp]: https://en.wikipedia.org/wiki/Binary_space_partitioning
