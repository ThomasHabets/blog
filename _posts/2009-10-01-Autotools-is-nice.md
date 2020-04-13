---
layout: post
title:  "Autotools is nice"
date:   2009-10-01 00:00:00 +0000
categories: autotools, coding, unix
---
I was recently asked why
[autotools](http://www.gnu.org/software/autoconf/) was so good. I
thought I might as well post what I answered.

<blargh:body/>

## Small differences

There are always some small differences between OSs. For example if
`uint64_t` exists or if it's called `u_int64_t`. Instead of doing an
`#ifdef __linux__` with lots of garbage and another block of `#ifdef
__OpenBSD__` you can solve the problem right. Otherwise you'll end up
with duplicated sections of defines and other things like:

```c
#if __FreeBSD__
# define foo bar
# define OStype joonix
#elif defined __OpenBSD__
# define foo bar
# define OStype joonix
#elif defined __linux__
# define foo BAZ
# define OStype joonix
#else
# error "Unknown OS, please add your OS here and define the things that the other OSs do above"
#endif
```

## Supported interfaces

Even if an OS doesn't support some API (such as `sendfile()` or
`openpty()`) today, it may do so in a year.  It would be a shame if
your program doesn't start using it without you changing your
`#ifdef`s.

Or worse, you could have fixed it by making your own
`sendfile()`-"emulator" for OSs that don't have one natively today,
and when they get it your program will no longer compile. It's much
better if you have autotools check if `sendfile()` exists instead of
assuming that it doesn't just because "uname -s" is "SunOS".

## Non- and pre-standard

Some non-standard things exist in several flavors. On Solaris
`getpwnam_r()` takes 4 parameters, while POSIX (and therefore many
other implementations) says 5. The error handling is a bit different
too. Instead of having a list of which OSs have the draft version and
which have the POSIX version you can have autotools check which one it
is. Then it'll work on a new OS that you haven't even heard of.

## Installation scripts

You no longer have to worry about installations scripts if you use
autotools.  You don't have to care where manpages go on this OS, or
where the end user wants their binaries installed (`/usr`,
`/usr/local`, `/home/me/opt`, `/opt/myprog`, ...). Oh, and `make
uninstall`?  How many people bother with writing that one manually?

Why not be nice to the end-user so that they can install your program
just like they do every other one:

1. Compile from a read-only source tree
2. add their non-standard library paths
3. install under `/opt`

with a simple:

```shell
.../configure --prefix=/opt/myprog LDFLAGS="-L/opt/mylibs -R/opt/mylibs"
make
make install
```

## Build environment

Finding the compiler (gcc, cc, CC, C++, c++, g++, ...), and know what
options it wants becomes automatic.  Dependencies are generated
automatically. Just make a Makefile.am with 3 lines and the rest is
generated. And all this without depending on a particular flavor of
`make` such as GNU Make.

The user gets proper error messages if dependencies aren't met. You'll
get fewer emails saying it doesn't compile because of unresolved
symbols or failed includes. The configure script will simply say "you
don't have libpcap".  Most people will understand that a lot better
than two screenfulls of C error messages.

## In conclusion

Autotools isn't as big and ugly as it seems, and solves many real problems. The only issue I have with it is that it puts
a bunch of garbage in the project root. My opinion is that only the configure script should be there, and the rest
should be in some subdirectory.

## Links

* [Autoconf home](http://www.gnu.org/software/autoconf/)
* [Wikipedia article on autotools](http://en.wikipedia.org/wiki/GNU_build_system)
