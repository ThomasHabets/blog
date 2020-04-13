---
layout: post
title:  "Be careful with hashmaps"
date:   2012-02-07 00:00:00 +0000
categories: security, coding
---

As you remember from long ago hashes are `O(1)` best case,
but can be `O(n)` if you get hash collisions. And if you're
adding `n` new entries that means `O(n^2)`.

I thought I'd take a look at the hash_set/hash_map GNU C++ extension.

<blargh:body/>

In `/usr/include/c++/4.4.3/backward/hash_fun.h`:

```c
  inline size_t
  __stl_hash_string(const char* __s)
  {
    unsigned long __h = 0;
    for ( ; *__s; ++__s)
      __h = 5 * __h + *__s;
    return size_t(__h);
  }
```

Test program that loads some strings:

```c
#include<time.h>
#include<iostream>
#include<hash_set>

double
getclock()
{
  struct timespec ts;
  clock_gettime(CLOCK_MONOTONIC, &ts);
  return ts.tv_sec + ts.tv_nsec / 1e9;
}

_GLIBCXX_BEGIN_NAMESPACE(__gnu_cxx)
template<> struct hash< ::std::string> {
  size_t operator()(const ::std::string& x) const {
    return hash<const char*>()(x.c_str());
  }
};
_GLIBCXX_END_NAMESPACE

int
main()
{
  __gnu_cxx::hash_set<std::string> the_set;
  double start = getclock();

  while (std::cin.good()) {
    std::string line;
    getline(std::cin, line);

    the_set.insert(line);
  }
  std::cout << "Size: " << the_set.size() << std::endl
            << "Time: " << getclock()-start << std::endl;
}
```

Running the loader with different inputs:

```
$ ./generateCollisions 5 > coll-5
$ ./generateCollisions 6 > coll-6
$ wc -l coll-5 coll-6
  13826 coll-5
 149696 coll-6
 163522 total
$ seq -f "%06.0f" 13826 > num-5
$ seq -f "%06.0f" 149696 > num-6
$ ./load < num-5
Size: 13827
Time: 0.0148379
$ ./load < num-6
Size: 149697
Time: 0.135555
$ ./load < coll-5
Size: 13827
Time: 1.44663
$ ./load < coll-6
Size: 149697
Time: 212.009
```

That's going from 0.14 seconds to over 3 and a half minutes.

## Collision generator

Left as an exercise to the reader. My code is too ugly to release.

## Summary

Nothing new, just a friendly reminder to treat input data as
untrusted. Think of all the places where you use a hash map. How many
of the keys come straight from untrusted sources? (user names, photo
tags, JSON or XML data that at some point is shoved into suitable data
structures, etc...)

## Links

* [28C3 Effective Denial of Service attacks against web application
  platforms](http://events.ccc.de/congress/2011/Fahrplan/events/4680.en.html)
