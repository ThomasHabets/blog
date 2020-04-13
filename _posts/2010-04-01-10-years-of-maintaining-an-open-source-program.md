---
layout: post
title:  "10 years of maintaining an open source program"
date:   2010-04-10 00:00:00 +0000
categories: arping, coding
---
Arping 0.1 was released 10 years ago last month or so. It's since been
included as a package in Debian GNU/Linux, Ubuntu, OpenBSD, FreeBSD
and NetBSD, Gentoo and some other smaller and bigger OSs and
distributions.

It's interesting that not one of these asked or even let me know,
which is kind of fun. I only noticed because I ego-googled. A couple
of German magazines did ask before putting it on their CDs. I told
them that it's GPL so they can do what they want, but thanked them for
letting me know.

[Linux Journal](http://www.habets.pp.se/synscan/images/lj-2000-08-arping.jpg)
could have told me though.

Arping was rewritten for libnet 1.1 as Arping 2.x. I fixed the IRIX
port of libnet 1.1 just so that I could get Arping to work on it.

I get bug reports or feature requests every now and then. Most build
errors are due to someone not having libnet and/or libpcap
installed. The new version (2.09) checks for these dependencies and
present a friendly error message in case they're missing.  If the
build still fails it's nice to just be able to ask the user to send
their config.log instead of having to ask back and forth what OS they
run and so on.

Some feature requests include a patch. I love those.

Not all bug reports or feature requests are sent to me though. I've
found a bit in [Debians bug database](http://bugs.debian.org), but
just by pure luck.

Arping 2.09 has just been released. Changes include:

* Changed build system to autotools
* Beep when there is no reply (-b)
* Handle getting too many replies

## Links

* [Arping on github](http://github.com/ThomasHabets/arping)
* [Arping home page](http://www.habets.pp.se/synscan/programs.php?prog=arping)
* [Arping 2.09 tarball](http://www.habets.pp.se/synscan/files/arping-2.09.tar.gz)
