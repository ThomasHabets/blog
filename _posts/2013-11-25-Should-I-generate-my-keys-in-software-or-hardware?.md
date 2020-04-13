---
layout: post
title:  "Should I generate my keys in software or hardware?"
date:   2013-11-25 00:00:00 +0000
categories: security, tpm, hsm
---

A [Hardware Security Module][hsm] (HSM) is any hardware that you can
use for crypto operations without revealing the crypto keys.
Specifically I'm referring to the [Yubikey NEO][neo] and [TPM
chips][tpm], but it should apply to other kinds of special hardware
that does crypto operations. I'll refer to this hardware as the
"device" as the general term, below.

[hsm]: http://en.wikipedia.org/wiki/Hardware_security_module
[neo]: http://www.yubico.com/products/yubikey-hardware/yubikey-neo/
[tpm]: http://en.wikipedia.org/wiki/Trusted_Platform_Module

<blargh:body/>

## Some background

When describing the Yubikey NEO I'm specifically referring to its
public key crypto features that I've previously blogged about, that
enable [using Yubikey NEO for GPG and SSH][blog-neo], not its OTP
generating features.

[blog-neo]: /2013/02/GPG-and-SSH-with-Yubikey-NEO.html

To generate keys for these devices you have two options. Either you
tell the device to generate a key using a built in [random number
generator][rng], or generate the key yourself and "import" it to the
device. In either case you end up with some handle to the key, so that
you command the device to do a crypto operation using the key with a
given handle.

[rng]: http://en.wikipedia.org/wiki/Random_number_generation

This "handle" is often the key itself, but encrypted with a key that
has never existed outside the device, and never will. For TPMs they
are encrypted (wrapped) with the SRK key. The SRK is always generated
inside the TPM chip.

TPM chips and Yubikey NEO both allow for importing and internal
generation of keys. As does [YubiHSM][yubihsm], which is a device that
provides some other crypto primitives more geared at the server side.

[yubihsm]: http://www.yubico.com/products/yubihsm/

Internal key generation for normal Yubikey OTP mode doesn't any sense,
since the security model with these OTPs are a shared secret between
the Yubikey and the authentication server. They key can't be extracted
after being imported, but it has to exist outside the Yubikey too. So
it by definition has to exist in at least two places, and at least
temporarily has to exist in RAM.

## So, which is it? Generate on device or import a key?

If the answer hadn't been "it depends", then this blog post would have
been much shorter. They both have pros and cons.

### Arguments for generating on the device

* The key has never been in RAM. Even if your computer was already
  hacked when you programmed the device, the keys are safe and don't
  have to be recalled.


* The key has never been on disk. There is no chance that part of the
  key generator was swapped out to disk while it had sensitive data in
  RAM. I list this point separately to stress that as soon as the key
  has ever existed on disk, it should be treated as being
  copied. While [Gutmann][gutmann] hasn't been relevant for many years
  for modern hard drives, and a single overwrite on a spinning disk is
  probably safe against even the best adversaries, it's getting harder
  and harder to *actually* overwrite anything.  With newer filesystems
  with [journals][jfs] and [copy-on-write][cow] you can't overwrite
  data through the file system anymore. And even if you succeed on the
  file system layer [sectors may be remapped][bad] on spinning platter
  disks, and [wear leveling][wear] makes it pretty much impossible to
  overwrite all data on [SSDs][ssd].  It's easier, safer, and possibly
  cheaper (due to write cycle limits), to just destroy the drive and
  buy a new one.

* Cold boot attacks are prevented. If you generate on the CPU and in
  RAM someone with physical access could powercycle the machine and
  read out the contents of the memory. This is an unlikely attack,
  I'll admit.

[gutmann]: http://en.wikipedia.org/wiki/Gutmann_method
[jfs]: http://en.wikipedia.org/wiki/Journaling_file_system
[cow]: http://en.wikipedia.org/wiki/ZFS#Copy-on-write_transactional_model
[bad]: http://en.wikipedia.org/wiki/Bad_sector
[wear]: http://en.wikipedia.org/wiki/Wear_leveling
[ssd]: http://en.wikipedia.org/wiki/Solid-state_drive


### Arguments for generating on CPU and importing into device

* Keys can be backed up before importing. You'll note that this is
  pretty much an attack against yourself.  You can GPG the key to an
  encrypted file that can only be decrypted by the private key you
  store in your physically guarded safe. This point doesn't matter if
  your use case makes it cheap and easy to just regenerate the keys.

* The big benefit is that the random number generator is under your
  control. The entropy for generating the key can be taken from the
  device, [RDRAND in your CPU][rdrand], timings between keyboard
  pressings, network packets arriving, etc.. Since you can use (and
  [/dev/random][random] uses) many different sources, any one of them
  being bad is not a catastrophy. A hardware device can only use
  itself, and a deliberate or accidental flaw is much more serious.

[rdrand]: http://en.wikipedia.org/wiki/RdRand
[random]: http://en.wikipedia.org/wiki//dev/random

## Key handles

Like I mentioned earlier no matter how you generate your individual
keys with a TPM chip, they are encrypted with the SRK key, and the
"handles" are opaque blobs encrypted with this key.  If the random
number generator in the device is flawed, backdoored, or otherwise
compromised, then an attacker can exploit this to decrypt your blobs,
and thus get to your keys. If the TPM chip random number generator is
bad then your key blobs can be broken. But it's not a complete
break. As long as the keys themselves are of good quality then the
attack only works if you have access to the blobs. You are still in a
better situation than if you just had standard
`~/.ssh/id_rsa` files.

## My recommendation

Short answer: generate the key on the device.

Motivation: I respect differing opinions (and have laid out arguments
against my recommendation above), and may change my mind in the
future. The reason I recommend generating the key on the device is
that this is the only way in which you can say "this key has never
existed, and will never exist, outside the device" (barring you doing
something stupid like generate the key as a migratable key, something
that's possible with TPM chips at least, and is even **default and
the only possible** with opencryptoki).

Bear in mind:

* Do not generate migratable keys. Jeez!
* Feed some random data to the hardware before generating the
  key. E.g. `Tspi_TPM_StirRandom()`

## My alternative recommendation

Neither way is bad, really. So if you prefer to generate the key
outside the device, I recommend:

* If possible, do not generate migratable keys. (not possible with TPM 1.2, but will be with TPM 2.0)
* Using `/dev/random` directly, not `/dev/urandom` or any homegrown thing.
* Generate the key only after the machine has been up for a while, and has had a chance to gather entropy.
* Never store the key on disk, even temporarily. Use `/dev/shm` if your key generator has to use files.
* Generate the key and import into the device from the same program, don't pass it along to an importer.
* **Overwrite** the key in memory when you're done importing it into the device. Keep in RAM for as short a time as possible
* Don't generate keys in a long-running daemon. Let the OS clean up after key generator.

Comments, suggestions, corrections and opinions welcome.
