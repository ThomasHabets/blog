---
layout: post
title:  "Is my TPM affected by the Infineon disaster?"
date:   2017-10-24 00:00:00 +0000
categories: security, tpm
---

I made [a
tool](https://github.com/ThomasHabets/simple-tpm-pk11/blob/master/check-srk/check-srk.cc)
to check if your TPM chip is bad. Well, it extracts the SRK public key
and checks if it's good or bad. If the SRK is bad then you can bet all
other keys are bad too.

This will also detect the case where the firmware has been fixed, but
you have not yet regenerated the key hierarchy on the TPM.

If the SRK is weak then not only are very likely all others keys you
generated in the TPM weak, but also anything generated *outside* the
TPM and imported is crackable, since your blobs are encrypted using
this crackable SRK key.

In other words: After upgrading firmware you need to re-take ownership
of the TPM, which will regenerate the SRK.

Example use:

```
$ g++ -o check-srk -std=gnu++11 check-srk.cc -ltspi -lssl -lcrypto 2>&1 && ./check-srk
Size: 2048
Outputting modulus…
8490234823904890234823904823904890238490238490238490238490[…]893428490823904231
--------------
THE KEY IS WEAK!
```

(use `-s` if you have an SRK PIN)

Thanks to [marcan](https://www.twitter.com/marcan42) for a [much
better checking
script](https://gist.githubusercontent.com/marcan/fc87aa78085c2b6f979aefc73fdc381f/raw/526bc2f2249a2e3f5d4450c7c412e0dbf57b2288/roca_test.py)
than the one provided by original authors.

For more info about the Infineon disaster see [this relevant
paper](https://crocs.fi.muni.cz/public/papers/rsa_ccs17).