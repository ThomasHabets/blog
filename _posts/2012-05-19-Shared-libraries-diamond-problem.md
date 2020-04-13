---
layout: post
title:  "Shared libraries diamond problem"
date:   2012-05-19 00:00:00 +0000
categories: unix, coding
---
If you split up code into different libraries you can get a diamond
dependency problem. That is you have two parts of your code that
depend on different incompatible versions of the same library.

![Diamond problem](https://blog.habets.se/static/2012-05-19_diamond.png)

Normally you shouldn't get in this situation. Only someone who hates
their users makes a non backwards compatible change to a library
ABI. You don't hate your users, do you?

<blargh:body/>

## Disclaimer

I thought I'd dive into this problem as a weekend project.  Don't rely
on this article as a source of truth, but please correct me where I'm
wrong. I'm not an expert in creating shared libraries, and it's much
harder that it would first appear. The existence of
`libtool` proves that.

Example project described can be found
[here](https://github.com/ThomasHabets/diamond_linking_example).

## Multiple versions of the same library

The lovely land of modern Unix will allow you to have multiple
versions of the same library installed at the same time. That's not
the problem. The problem is that when you load the libraries all the
symbols are resolved inside the same namespace. There can't be two
versions in use of the same function with the same name, even if they
are in different libraries (well, it won't work the way you want it
to). You can't choose which one to see from different code.  (see
breadth first search description [this article about ld.so GNU
linker/loader](http://guru.multimedia.cx/ld-so-gnu-linkerloader/) for
details).

## The scenario

In this scenario there are three separate libraries:

* `libd1` - Calls functions in `libd2` and `libbase` version 1.
  File name is simply `libd1.so`.
* `libd2` - Calls functions in `libd1` and `libbase` version 2.
  File name is simply `libd2.so`.
  (cross dependency between `libd1` and `libd2`)
* `libbase` - This is the library that made non backwards compatible
  changes between version 1 and 2.  Files are `libbase.so.1.0` and
  `libbase.so.2.0`, with traditional symlinks from
  `libbase.so.[12]`. The important bit here is that the two
  versions are to be considered incompatible and must both be usable
  in the same process at the same time.

And the executable `p` which links to `libd1` and `libd2`.

What we want to achieve is to have `libd1` and `libd2` be able to call
functions in `libbase`, but to have them call different versions. Both
`libbase.so.1` and `libbase.so.2` should be loaded and active (have
their functions callable).


## What normally happens

When you link an executable with `-lfoo` the linker finds `libfoo.so`
and verifies that it (along with default libraries) contain all the
symbols that are currently unresolved. Linking shared objects
([DSO](http://en.wikipedia.org/wiki/Dynamic_Shared_Object), `.so`
files) is similar, except [there's no requirement that all symbols are
resolved](http://blog.flameeyes.eu/2008/11/relationship-between-as-needed-and-no-undefined-part-1-what-do-they-do). If
an unresolved symbol exists in more than one library then only one is
actually used.  You can't therefore link two overlapping
[ABI](http://en.wikipedia.org/wiki/Application_binary_interface)s,
even indirectly via an intermediate dependency. Well, you can, but are
you comfortable with one of them being "hidden"? (which one is not
important for this article)

Both versions of the library can therefore be loaded, but if they
overlap then one will hide the other (in the overlap).

## How to solve it

The hiding of one of the symbols in a name clash is done by the
dynamic linker (`ld.so`) at load time (run time). Since symbols are
referenced by name the only way to differentiate the two names is to
force them to have different names.

This can be done in different ways; manually, or automatically. Both
append some text to every symbol you want to differentiate.

### Automatic (with `--default-symver`)

```
$ gcc -fPIC -Wall -pedantic   -c -o base1.o base1.c
$ gcc -shared \
		-Wl,--default-symver \
		-Wl,-soname,libbase.so.1 \
		-o libbase.so.1.0 base1.o
$ nm libbase.so.1.0
[...] 00000000000006f0 T base_print     <--- same name as without the special args
[...] 0000000000000000 A libbase.so.1   <--- this is new with --default-symver
[...]
```

A small change. Certainly doesn't *appear* to refer to a new name. You
can also inspect with `objdump -T`, but the magic happens when you
link something to it.

Let's compile and link one of the libraries that uses `libbase.so`:

```
$ ldconfig -N -f ld.so.conf
$ ln -fs libbase.so.1 libbase.so  # library to link with
$ gcc -fPIC -Wall -pedantic   -c -o d1.o d1.c
$ gcc -Wl,-rpath=. -L. \
		-Wl,--default-symver \
		-Wl,-soname,libd1.so \
		-shared -o libd1.so d1.o -lbase
$ nm d1.o
[...]            U base_print
[...]            U d2_print
[...]
$ nm libd1.so
[...]            U base_print@@libbase.so.1
[...]            U d2_print
[...]
$ ldd libd1.so
[...]      libbase.so.1 => ./libbase.so.1
[...]
```

Interesting. The unresolved symbol *base_print* was changed in the
linking step, but *d2_print* was not.  This is because the version
info was put into `libbase.so` (symlinked to
`libbase.so.1.0`). `libd2.so` didn't yet exist, so it can't have
version info attached. If you want version info for `libd1` and
`libd2` referencing each other then you'll first have to create
versions of the libraries that don't depend on each other but do have
version info.  It's probably possible to bootstrap this manually, but
I haven't looked into it.

Also note that `libd1.so` knows that it's depending on `libbase.so.1`
(not plain `libbase.so`). This is the name given with the `-soname`
option when linking `libbase.so`. So there's even more magic going on
than I led on. And it's a good reason for having that option.

`libd2.so` is compiled similarly, except against version 2 of
`libbase.so`.  The program `p` is then linked to both `libd1.so` and
`libd2.so`, which in turn pulls in both versions of `libbase.so`:

```
$ cc -Wl,-rpath=. -o p p.o -L. -Wl,-rpath=. -ld1 -ld2
$ ldd p
	linux-vdso.so.1 =>  (0x00007ffff41f8000)
	libd1.so => ./libd1.so (0x00007fe08b788000)
	libd2.so => ./libd2.so (0x00007fe08b586000)
	libc.so.6 => /lib/libc.so.6 (0x00007fe08b1e5000)
	libbase.so.1 => ./libbase.so.1 (0x00007fe08afe3000)
	libbase.so.2 => ./libbase.so.2 (0x00007fe08ade1000)
	/lib64/ld-linux-x86-64.so.2 (0x00007fe08b98c000)
$ nm p | grep libd
                 U d1@@libd1.so
                 U d2@@libd2.so
$ ./p
base version 2> init
base version 1> init
d1> init
d2> init
d1()
 d2_print()
  base version 2> d1        <--- libd1 -> libd2 -> libbase version 2
d2()
 d1_print()
  base version 1> d2        <--- libd2 -> libd1 -> libbase version 1
d2> fini
d1> fini
base version 1> fini
base version 2> fini
```

Note that both base versions are loaded, and that `d1()` calls
`d<b>2</b>_print()` and vice versa.  Diamond problem solved. Yay!

### Manual with `--version-script`

Instead of `--default-syms` one can use `--version-script=base1.map`
and create the map file.

```
BASE1 {
      global: base_print;
      local: *;
};

### Manual from within the code

```
asm(".symver base_print_foo,base_print@@BASE1");
```

to create `base_print@@BASE1` from `base_print_foo`. This may still
need a map file, but it will override it.

## Notes

* `@@` in a name means "this version and the default". A single `@`
  means just "this version".


## Summary

… yet Unix still has much less DLL hell than Windows.

I aimed to provide an accessible view into shared libraries by solving
a specific problem. For more in-depth information from people who know
more about it than me see the links below. I've barely scratched the
surface.

The compile time linker (`ld`) and the dynamic linker (`ld.so`) do a
lot of magic. More than you'd expect if you haven't thought about it
before.

## Links

* [Example project](https://github.com/ThomasHabets/diamond_linking_example)
* [How To Write Shared
  Libraries](http://www.akkadia.org/drepper/dsohowto.pdf), by Ulrich
  Drepper
* [Program Library HOWTO - 3. Shared
  Libraries](http://tldp.org/HOWTO/Program-Library-HOWTO/shared-libraries.html)
* [ld.so GNU
  linker/loader](http://guru.multimedia.cx/ld-so-gnu-linkerloader/)
* [Gold readiness obstacle #1: Berkeley
  DB](http://blog.flameeyes.eu/2011/06/gold-readiness-obstacle-1-berkeley-db). Also
  see other linker related posts on that blog.
* [It's not all gold that shines — Why underlinking is a bad
  thing](http://blog.flameeyes.eu/2010/11/it-s-not-all-gold-that-shines-why-underlinking-is-a-bad-thing). Nice
  illustrations of the problem.
* [Autotools Mythbuster - Chapter 3. Building All Kinds of Libraries —
  libtool](http://www.flameeyes.eu/autotools-mythbuster/libtool/index.html)
* [Why there are shared object files and a bunch of
  symlinks](http://blog.flameeyes.eu/2009/10/a-shared-library-by-any-other-name)
* [Binutils ld manual - 3.9 VERSION
  Command](http://sourceware.org/binutils/docs/ld/VERSION.html)
