---
layout: post
title:  "Compiling C++ statically"
date:   2013-01-13 00:00:00 +0000
categories: coding
---
To properly compile a static C++ binary on Linux you have to supply
`-static`,
`-static-libgcc`,
`-static-libstdc++` when linking.

<blargh:body/>

That's fucked up.

Never EVER think that linking (at link time or runtime) is easy or
obvious.

I link my current pet project with:
```
g++ -Wl,-z,now -Wl,-z,relro -pie -static-libstdc++
```

The binary then seems to work across the systems I currently want to
run it on.  Specifically it makes me able to run the binary compiled
on Debian Testing on a Debian Stable installation.

Skipping that whole dynamic libraries thing is something Go got right.

## Update: some clarification on why you'd want to compile statically

Let's start with the reason for wanting to compile static in the first
place.  While shared libraries are better in some aspects, "save RAM"
is no longer a good reason for always compiling dynamically. There are
reasons why you'd want dynamic linking still, but that aint it. The
savings in RAM for the .text and .rodata sections (and unmodified
.data, I guess) are negligible when compared to RAM footprint of
interesting applications.  There the interesting data is usually
mmap()ed or simply read or generated. Shared libraries won't help you
with that. KSM (Kernel Samepage Merging) will even help in doing
reverse copy-on-write to take back even this loss.

Take /usr/bin/ssh for example.
```
$ ldd $(which ssh) | awk '{print $3}' | sed 1d | grep -v ^$ | xargs du -Dhcs | tail -1
4.6M total
```

Really? You care about saving me 5MB? Sure, multiply by number of
(unique!) running system utilities that's one thing, but I'm not
taliking about those. I'm talking about, say, your SOA backend
application.  Or Quake 9.

No, the big benefit of shared libraries is the fact that you only have
to upgrade in *one* place to have the code upgraded everywhere.

Where static linking wins is where you have control of "all" aspects
of operations.  That is, if there is a new version of openssl to fix a
bug, it's feasible in your environment to recompile. You then also
have the option to roll back, and roll back openssl to only one
application in case there is an incompatibility. This won't, of
course, help with dlopen()ed libraries.

Now back to what the options mean. `-static` is the option to
ostensibly not require (assume existence and compatibility of) shared
libraries on the target system. Turns out it's not that
simple. `-static-libstdc++` is often (I dare almost say "usually")
needed if the libstdc++ versions between build and target systems
differ by a few years on Linux.  Like I said I needed this to compile
my C++11 stuff on Debian Testing (frozen to be stable, IIRC) and
Debian Stable. One binary. Just scp it to the target and run. No
dependencies.

As for libgcc it's mostly for cases where you can't count on access to
*any* libraries (such as what you mentioned, as OS hacking), but isn't
that why you gave `-static` in the first place? :-)

This post doesn't address other aspects of static linking, such as
glibc being static-hostile, a whole topic in itself.  Compiling static
won't make everything "just work" either.
