---
layout: post
title:  "How to boot an encrypted system safely"
date:   2015-03-27 00:00:00 +0000
categories: security, tpm
---
These are my notes on how to set up a system securely, in a way that
would prevent attackers from being capable of performing an ["evil
maid attack"](http://en.wikipedia.org/wiki/Rootkit#Bootkits).

<blargh:body/>

## The threat model

You have a Linux server that you want to protect against data theft
and other backdoors. The attacker can get physical access to your
hardware, for example by having access to the server room that houses
your rack.

Your attacker is funded, but not super well funded. This will not
protect you against intelligence agencies.

The attacker can buy a new server that looks just like the one you
have. You will not be able to tell the difference from physical
inspection.

You want to know that it's safe to log in to your server after a
suspicious power outage or reboot.

This solution assumes that once the system is booted and you log in,
you have access to the secret data. In other words, this is not a
protection for gaming consoles or kiosks.

## Overview of the solution

First of all, full disk encryption using dm-crypt. Obviously. (other
FDE also acceptable, of course)

Walking up to the server and typing the passphrase every reboot is not
only tedious (the server may not be in a convenient location), but
also unsecure, since you don't know if the server has been replaced
since you last saw it. It may look the same, and provide the same boot
text, but the password is sent off to the attacker when you type it.

The solution is instead to log in with SSH in a very small
mini-system, such as an initrd image. The server authenticates to the
client using the server key, so you know that the server hasn't been
replaced. After logging in remotely you'll unlock the real root
filesystem and continue the boot process.

The security of the server now relies on the secrecy of the server
key, so how do we keep that secret?

TPM chip. Only store the SSH server key in an encrypted blob that's
"sealed" with the state of the system. The only way the TPM chip will
unseal this data is if the system boots exactly the initrd you want it
to boot. If the attacker boots their hacker-USB-stick or a modified
version of your initrd, then while they can *read* your initrd, that
inird contains no secrets. And they can't convince the TPM chip to
give up the SSH server key in that state.

If the system fails to unseal the SSH server key, then a different key
(not a secret key) should be used. That way SSH still runs, and when
you see the wrong key when you connect you'll know that something's
wrong. If you don't do this, then you may not realise that the server
has been compromised when it just doesn't respond on port 22.

### This is not ["Secure Boot"](http://en.wikipedia.org/wiki/Unified_Extensible_Firmware_Interface#Secure_boot)

This will not prevent someone from popping in a live CD and booting up
their own system, or switching out your hard drive for something
completely different. It doesn't prevent the system from booting
"unsigned code". It only prevents this other code from accessing your
sealed secrets (the SSH server key). And if they modify your initrd,
then that also counts as being another system, and the TPM will refuse
to unseal.

Think of the SSH server key as having been encrypted with the key
"tpm_internal_secret + the values of the PCR registers you sealed
against". You won't know or control what code is running, but you will
know that only when the right code is running will the TPM unseal the
secrets.

### Slight sidetrack on TPM chips

Don't believe any FUD you hear about TPM chips. Yeah, yeah, they *can*
be used by evil people to lock you out of your own machine. In
*theory*. But they can also be used by you to lock other people out of
your machine. Also, if the PC manufacturers wanted to sell you devices
that only run Windows, then they will do that whether or not
TrustedGRUB exists.

The iPad locks you out anyway. Chromebooks and Android devices don't
lock you out (though I'm not an Android expert), but you'll see a
warning if you don't run a signed build. If not under the name "TPM
chip" then under some other name. The GRUB maintainers are luddites
for refusing to incorporate TPM code, and they are making security
worse for everyone by doing this. Why are they trying to make the
world a worse place? I dunno, ask them.

### Why not just boot the whole system using the TPM secret, instead of just the initrd?

That requires more trust in the TPM. If you *know* that your server
has been stolen then you know not to enter the secret passphrase ever
again, and the most anyone can get out of the server itself even if
they compromise the TPM chip is the SSH server key, which you by now
no longer trust.

### What if there's a backdoor in the BIOS or TPM chip?

Then you lose, assuming that you have not figured out that because the
machine has been down for X time, it's probably compromised. Don't
enter the password (the *real* secret) if you think this has happened.

### What if the attacker can read RAM of a running machine (firewire, JTAG, glitch, freeze-spray, etc…), or similar?

Same thing. Except even worse since they can do this when the real
root is unlocked, thus getting at the actual secrets without having to
trick you into entering your password.

### Clarification on the chain of trust

The TPM chip has append-only registers, and if some data is sealed
with some given state for these registers, then it will unseal that
data only when the system is in that same state (when the PCR
registers have the save values).

1. The BIOS reads the boot sector from disk, updates a Platform
   Configuration Register (PCR), and jumps to the boot sector
   code. There is no signature check. It only notes down "this is what
   I booted" for future reference.
2. The boot sector reads GRUB, and updates a register the same
   way. (this is probably two steps, actually, since GRUB has two
   stages)
3. GRUB reads the kernel and initrd, and updates a register again.
4. The systems boots. The registers are now set to the correct state
   for unsealing the SSH key.
5. The SSH server key is unsealed and SSHD is started.
6. The system is now in a state it can only be in if it's running
   exactly what you want. (barring previously mentioned attacks)

## How to set it up

You need a server with a TPM chip, and TrustedGRUB. TrustedGRUB is not
awesome to compile, so I made some notes.

### Make sure your TPM chip works

Out of scope of this article, but running `tpm_version` should work if
you've set this up. See [my previous articles on TPM](/search/tpm) for
more info.

### Install dependencies

```shell
$ sudo apt-get install gcc-4.7-multilib
```

Your kernel must have 32bit emulation built in
(CONFIG_IA32_EMULATION=y).

### Build TrustedGRUB

```shell
$ wget http://sourceforge.net/projects/trustedgrub/files/TrustedGRUB-1.1.5/TrustedGRUB-1.1.5.tar.gz/download
$ mv download TrustedGRUB-1.1.5.tar.gz
$ tar xfz TrustedGRUB-1.1.5.tar.gz
$ cd TrustedGRUB-1.1.5
$ ./build_tgrub.sh
$ cd TrustedGRUB-1.1.5
$ ./configure --prefix=/opt/trusted-grub --host=i386-unknown-linux-gnu CFLAGS=-m32
$ make
```

### Install TrustedGRUB as your bootloader

Make sure you have a rescue USB stick or something if this breaks.

```shell
$ sudo make install
$ sudo mv /boot/grub{,.old}
$ sudo mkdir /boot/grub
$ sudo cp ../default /boot/grub/
$ sudo cp stage1/stage1 /boot/grub/
$ sudo cp stage2/stage2 /boot/grub/
$ sudo ./grub/grub
> root (hd0,0)
> setup (hd0)
> ^D

$ sudo reboot
grub> kernel /vmlinuz...
grub> initrd /initrd...
grub> boot
```

You should now be in a system with PCR registers set by every step of
the boot. Verify this by checking the PCR-14 register, which GRUB
should have set according to your kernel and initrd.

```
$ cat /sys/class/misc/tpm0/device/pcrs | grep PCR-14
PCR-14: 10 98 F4 54 2F A3 4D 31 6A B8 C1 D9 F6 94 0F C4 30 91 38 57

$ ./util/verify_pcr NULL /boot/vmlinuz-3.2.0-4-amd64 /boot/initrd.img-3.2.0-4-amd64
*******************************************************************************
* Result for PCR: 10 98 f4 54 2f a3 4d 31 6a b8 c1 d9 f6 94 0f c4 30 91 38 57 *
*******************************************************************************
```

Verify that the output is the same.

Now you can try sealing the data against the values in this PCR:

```
$ cat > secret.txt
my TPM is my passport, verify me
^D
$ tpm_sealdata -z -p 14 -i secret.txt > secret.tpm
$ rm secret.txt
```

Note that this is *not* secure yet. By sealing against PCR-14 you're
only verifying that whatever bootloader loaded your kernel, it's
*claiming* that your kernel and initrd are the right ones. You have
not sealed it against what *bootloader* was used to boot. An attacker
could have replaced TrustedGRUB with something that sets the PCR
register to one thing, and actually loads something else.

So now you take your SSH server key, seal it with `tpm_sealdata`, and
write scripts to unseal it at boot. Make a backup of the SSH key,
because any time you update your initrd or kernel the PCR values will
change, and you will therefore not be able to unseal the key. This
also means that you can't store the sealed key in the initrd, since
adding the sealed key would change the initrd. It has to be stored on
`/boot` or something. You should probably have the boot script in
initrd look at a directory like `/boot/ssh_keys/` and try every file
in there until one succeeds.

The first time you reboot with a new kernel (or new grub, or initrd,
or BIOS), the SSH key will be wrong. After rebooting, unlock anyway
(yes, this could be an avenue of attack) and re-seal the right
key. Reboot and verify that you get the right SSH signature.

### So what PCR registers should I seal against?

At least all of these:

* PCR-00 — BIOS
* PCR-02 — Option code (I'm not sure what this means)
* PCR-04 — MBR & GRUB stage1
* PCR-08 — GRUB stage1
* PCR-09 — GRUB stage2
* PCR-12 — Kernel args (so attacker can't do e.g. init=/bin/sh)
* PCR-14 — Kernel and initrd

And optionally (I'm not sure):

* PCR-01 — Platform configuration. (did someone mess with the BIOS settings?)
* PCR-03 — Option config and data.
* PCR-13 — Any other files you want to check with the `checkfile` option, see below.

### What else?

You can create /boot/grub/menu.lst:

```
timeout 30
default 0
title Linux debian kernel
root (hd0,0)
kernel /vmlinuz-3.2.0-4-amd64
initrd /initrd.img-3.2.0-4-amd64
checkfile /grub/tpm-checkfile.txt

create /boot/grub/tpm-checkfile.txt:
c14593c4c6bed940e3fce48c6bee8c7e128b2593 (hd0,0)/vmlinuz-3.2.0-4-amd64
4234234234324243e3fce48c6bee8c7e128b2593 (hd0,0)/some-other-file.txt
8a88d240b50fd27de0c51988da92a7e2dac3fc34 (hd0,0)/initrd.img-3.2.0-4-amd64
```

## That's great for servers. What about laptops/workstations?

The problem to solve here is that the laptop/workstation has to
authenticate to you, the human. You can't use SSH because you're a
human, and SSH is only on the laptop you're trying to get in to.

The important bit to remember here is that there's no way you can
win. An attacker can replace your laptop with one that looks just like
it, and does a perfect man-in-the-middle where it just relays
everything you see and type on to the real laptop that's in the
attacker's lab. You won't notice that there's a 10 millisecond lag
between you pressing keys and results popping up.

But short of that attack, there is something you can do.

### "Tell me something I know"

One solution is for you the human to type in a challenge to the
laptop. Not "what is the third letter of our shared secret?", since an
attacker can have asked all of these questions of the real system, and
knows the answer to all of them. The question itself should not be
guessable. I'll leave it to you to figure something out.

### Challenge-response

You type in anything. Anything, really. Preferably unique, but has to
be unique for the day, at least. The laptop/workstation responds with
a QR code, that you scan with your phone. The message in the QR code
is the challenge, plus the current timestamp, signed with a key that's
only available when the TPM was able to unseal it. If you see the same
message on your phone, and the timestamp looks right, then it should
be safe to type in your full disk encryption password.

## Implementation

I have not implemented the mini-system with the server key, nor the
smartphone app that would receive QR codes. At least the former is
pretty simple, and both are left as exercises for the reader.

## Links

* [TPM on Wikipedia](http://en.wikipedia.org/wiki/Trusted_Platform_Module)
* [TrustedGRUB](http://sourceforge.net/projects/trustedgrub/)
* [An attack on TPM chips][sparks] (still, with TPM is better than without TPM)
* [TPM fundamentals][fund], see especially slide 19
* [More TPM info and exercises][blatt]. Page 6 has the PCR registers
  enumerated.

[sparks]: http://www.cs.dartmouth.edu/~pkilab/sparks/
[blatt]: https://www.trust.informatik.tu-darmstadt.de/fileadmin/user_upload/Group_TRUST/Exercises/Blatt02_SS11.pdf
[fund]: http://www.cs.unh.edu/~it666/reading_list/Hardware/tpm_fundamentals.pdf
