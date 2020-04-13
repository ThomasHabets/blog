---
layout: post
title:  "Building pov-ray on raspberry pi"
date:   2015-11-28 00:00:00 +0000
categories: unix
---
This is just notes in case I need to do this again. It's for my
[QPov](https://github.com/ThomasHabets/qpov) project.

```shell
sudo apt-get install autoconf libboost-all-dev libjpeg-dev libtiff-dev libpng-dev
git clone https://github.com/POV-Ray/povray.git
cd povray
git checkout --track -b 3.7-stable origin/3.7-stable
cd unix
./prebuild.sh
cd ..
./configure --prefix=$HOME/opt/povray COMPILED_BY="My_Name on RPi"
make
make install
```

<blargh:body/>
