---
layout: post
title:  "Colour calibration in Linux"
date:   2014-09-18 00:00:00 +0000
categories: unix
---
This is just a quick note on how to create .icc colour profiles in
Linux.  You need a colour calibrator (piece of hardware) for this to
be useful to you.

```shell
#!/bin/sh
NAME=$1
COLOR=$2
DESC="Some random machine"
QUALITY=h   # or l for low, m for medium
set -e

dispcal -m -H -q $QUALITY -y l -F -t $COLOR -g 2.2 $NAME
targen -v -d 3 -G -e 4 -s 5 -g 17 -f 64 $NAME
dispread -v -H -N -y l -F -k $NAME.cal $NAME
colprof -v -D $DESC -q m -a G -Z p -n c $NAME
dispwin -I $NAME.icc
```
