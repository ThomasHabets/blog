---
layout: post
title:  "TPM chip protecting SSH keys - properly"
date:   2013-11-26 00:00:00 +0000
categories: security, hsm, tpm, unix
---

Not long after getting my TPM chip to protect SSH keys in [a recent
blog post][prev], it started to become obvious that OpenCryptoKi was
not the best solution. It's large, complicated, and, frankly,
insecure. I dug in to see if I could fix it, but there was too much I
wanted to fix, and too many features I didn't need.

So I wrote my own. It's smaller, simpler, and more secure. This post
is about this new solution.

[prev]: /2013/11/TPM-chip-protecting-SSH-keys.html

<blargh:body/>

## Why not Opencryptoki?


* It generates at least some keys in software. As I've explained
  earlier, [I want to generate the keys in hardware][prev2].

[prev2]: /2013/11/Should-I-generate-my-keys-in-software-or-hardware.html

* It generates migratable keys. This is hardcoded, and some people
  obviously want migratable keys (for backup purposes). So a fix would
  have to involve supporting both.

* Opencryptoki has no way to send such parameters from the command
  line key generator to the PKCS11 library. So not only would I have
  to implement the *setting*, but the whole *settings subsystem*.

* The code is big, because it supports a lot of features. Features I
  don't need or want. They get in the way of me as a user, and of me
  fixing the other issues.

* The code is of pretty poor quality. I encountered configuration
  problems causing segfaults, and that **many** (if not most) errors
  (like permission errors) give the error message "Incorrect PIN",
  because system calls are not checked for success.  I can't trust
  code where a function that is meant to lock a file using
  `open()+flock()` tries to `flock()` file descriptor 2^32-1, because
  `open()` was not checked for success.  (of course, `flock()` was not
  checked for success either, so it just continued happily without
  having locked anything!)

## So what should the replacement be able to do?

* Generate 2048bit RSA non-migratable keys
* Use these keys to sign data (this is how SSH keys work)
* Interface with the PKCS11 API

## How to use it

Once installed:

```
$ mkdir ~/.simple-tpm-pk11
$ stpm-keygen -o ~/.simple-tpm-pk11/my.key
[...]
$ echo key my.key > ~/.simple-tpm-pk11/config
$ echo -e "\nHost *\n    PKCS11Provider /usr/local/lib/libsimple-tpm-pk11.so" >> ~/.ssh/config
$ ssh-keygen -D /usr/local/lib/libsimple-tpm-pk11.so | ssh shell.example.com tee -a .ssh/authorized_keys
$ ssh shell.example.com    # Unless you have an ssh-agent with other keys, this will use the hardware-protected key.
```

That's simple enough, isn't it? No harder than generating a software
key with `ssh-keygen`.

## How to install it

Also easy. The code itself is a simple `./configure && make && make
install` (first `./bootstrap.sh` if you take the code from GIT
directly).

Initialising the TPM chip is the step that *may* give you
trouble, but should be simple to solve with at most a reboot or two in
case you need to reset the TPM, to reclaim ownership.

You only need to do one thing: Take ownership. Ideally you only have
to run `tpm_takeownership -z` and give it an "owner password", but you
may get errors like:

* It asks for the old owner password. Solution: reset the TPM chip
* Actually, any other error: reset the TPM chip.
* Resetting TPM chip with `tpm_clear` fails: Power down (fully), then reset the chip from BIOS.

I've put some more TPM troubleshooting info in
[TPM-TROUBLESHOOTING][tshoot], but it's pretty much just the above.

[tshoot]: https://github.com/ThomasHabets/simple-tpm-pk11/blob/master/TPM-TROUBLESHOOTING

## The code

[github.com/ThomasHabets/simple-tpm-pk11](https://github.com/ThomasHabets/simple-tpm-pk11)

```
git clone <a href="">https://github.com/ThomasHabets/simple-tpm-pk11.git</a>
```

I'll see if I can get a Debian Developer to help me get it into
Debian.

## Links

* [github.com/ThomasHabets/simple-tpm-pk11](https://github.com/ThomasHabets/simple-tpm-pk11)
* [Chaps](http://www.chromium.org/developers/design-documents/chaps-technical-design),
  a bigger, more ambitious project for PKCS11 and TPMs coming out of
  ChromeOS.
