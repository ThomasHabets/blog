---
layout: post
title:  "Don't forget to restart all your OpenSSL binaries"
date:   2014-04-20 00:00:00 +0000
categories: security
---
The wonder of UNIX is that you can delete running binaries and loaded
shared libraries. The drawback is that you get no warning that you're
still actually running old versions. E.g. old
[heartbleed](http://www.heartbleed.com)-vulnerable OpenSSL.

Server binaries are often not forgotten by upgrade scripts, but client
binaries almost certainly are. Did you restart your irssi? PostgreSQL
client? OpenVPN **client**?

Find processes running with deleted OpenSSL libraries:

```shell
$ sudo lsof | grep DEL.*libssl
apache   17179      root  DEL       REG        8,1               24756 /usr/lib/x86_64-linux-gnu/libssl.so.1.0.0
```

<blargh:body/>

Or if you're extra paranoid, and want to make sure everything is using
the right OpenSSL version:

```bash
#!/bin/sh
set -e
LIB="/usr/lib/x86_64-linux-gnu/libssl.so.1.0.0"
if [ ! "$1" = "" ]; then
   LIB="$1"
fi
INODE="$(ls -i "$LIB" | awk '{print $1}')"
lsof | grep libssl.so | grep -v "$INODE"
```

## A few points

* Run this as root in case lsof otherwise wouldn't be able to get at
  the data (e.g. if you run grsec)
* This assumes all libssl is on one filesystem, since it only checks
  inode number
* The easiest solution is of course to restart the whole machine, but
  there's really no reason to if you don't want to
