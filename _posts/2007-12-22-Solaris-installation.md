---
layout: post
title:  "Solaris installation"
date:   2007-12-22 00:00:00 +0000
categories: solaris, unix, bugs
---
In what top scientists are calling "fucking stupid", Solaris can't
handle disks that used to have non-solaris stuff on them without
being wiped first.

I thought only the windows installer borked if the partition table
looked weird, but no! The installer could not see the disk, and I
was dropped into a dtterm where I had to do `dd if=/dev/zero
of=/dev/dsk/c0t0d0 bs=1048576` and reboot.

So... wipe the disk before trying to install Solaris.
