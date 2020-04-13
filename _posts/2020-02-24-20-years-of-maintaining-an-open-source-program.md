---
layout: post
title:  "20 years of maintaining an open source program"
date:   2020-02-24 00:00:00
---
It's been almost 10 years since my [previous post about
this][prev]. And 20 years since 2000-02-24, which is when arping 0.1
was released. It was a 208 line C file, with a hand made `Makefile`.

As of today when Arping 2.21 is overdue to be released, the code in
`.c` and `.h` files (excluding tests) is 3863 lines, and it uses the
amazing [autotools][autotools] framework for analyzing dependencies.

I've recently had the displeasure of working with `cmake`, which is
just the worst. Why anyone would think `cmake` is even remotely
acceptable I'll never understand.

![CMake sucks](/static/2020-02-cmake.png)

But the Arping story continues. It isn't getting many new major
features. Still, since the last post there's been 205 commits, and 10
releases.

Things like:

* Change from `gettimeofday()` to `clock_gettime()`, when
  available. More info about that in [this blog post][gettimeofday].
* Don't check for `uid=0` and stop. Capabilities can come in other ways
* Change from `poll()` to `select()` to work around bug in MacOS X
* Use nice and modern `getifaddrs()` to resolve interfaces
* Update documentation
* Improve error messages
* Update author email address
* Fix warnings and general code cleanup
* Used coverity to find and fix suspicious code
* Add some more stats to output
* Print 'Timeout' when there's no reply within one interval
* Add ability to send gratuitous ARP
* Add 802.1q VLAN support
* Add more tests, and fuzzing
* Drop priv user (all), capabilities (Linux), `pledge()` & `unveil()`
  (OpenBSD)
* `_BSD_SOURCE->_DEFAULT_SOURCE` as the former is deprecated
* Add payload data to mac ping
* Add support for a dependency's new way while falling back to the old way
  (e.g. Use `pcap_create()` instead of `pcap_open_live()`)
* Various small fixes for corner cases
* Various small fixes to work around bugs in other libraries

For that last one it's so that Arping won't have strict version
dependencies, and still work correctly. It's better to have it just
work, instead of bothering many people just because they haven't (or
can't) upgrade a library.

There are many many users of Arping. If I can spend two hours working
around a bug in some libpcap versions, to save 10 seconds for everyone
who has such a config, then there only needs to be 720 affected people
for that to have saved human effort, and life.

This is a tangent, but I wish more people would think of this
fanout. If a slight perfection saves users just a few seconds, that
can easily be worth a month of work. E.g. say you're planning on
sending out an email to your whole company of 20'000 people, because
about half will need to do something. Let's say it takes 10 seconds
for the other half of users to see the email, click on it, and read
enough to see that they don't need to do anything. That's
`10*10000/3600=28 hours`.

Do you think that if you spent less than 28 hours that you could maybe
find out *exactly* which 10'000 people need to get this email? Can you
spend another full week personalizing the email, so that it takes on
average 10 seconds less to perform the needed action?

And actually, if you spend a full month on it, maybe this is something
you can do without fanning out the work to 10k people?

Anyway, as can be seen from the list above even a tool that's not
changing much needs a bit of update every now and then, to still be good.

Arping 2.21 will deliver:
* Use more modern `pcap` API calls, when available
* Add payload data to mac ping
* `chdir(/)` after `chroot()`
* Misc minor cleanup. 23 commits in total.

[prev]: https://blog.habets.se/2010/04/10-years-of-maintaining-an-open-source-program.html
[gettimeofday]: https://blog.habets.se/2010/09/gettimeofday-should-never-be-used-to-measure-time.html
[autotools]: https://autotools.io/
