---
layout: post
title:  "GPG and SSH with Yubikey NEO"
date:   2013-02-27 00:00:00 +0000
categories: security, unix, hsm
---
I'm a big fan of hardware tokens for access. The three basic
technologies where you have public key crypto are SSH, GPG and
SSL. Here I will show how to use a Yubikey NEO to protect GPG and SSH
keys so that they cannot be stolen or copied. (well, they can be
physically stolen, of course).

<blargh:body/>

Let's hope pkcs11 support is coming, so that SSH support improves and
SSL keys can also be protected.

Parts of this howto are all but copied from [YubiKey NEO and
OpenPGP](http://www.yubico.com/2012/12/yubikey-neo-openpgp/). I
complete it with some details and the SSH parts.

## GPG

GPG normally keeps your private key encrypted using your password. If
your keyring is stolen someone can brute force your password and from
there decrypt all your files. If someone steals your keyring you
should revoke the key as soon as possible, but assuming this
revokation gets to all interested parties this will only protect new
messages from being encrypted to this key. Old encrypted files could
be decrypted by the attacker. Signatures are a bit better off. Sure,
you have to re-sign everything and redistributed the signatures, but
not nearly as bad.

### 1. Install some dependencies

```shell
sudo aptitude install gnupg gnupg-agent gpgsm
```

### 2. Install Yubikey personalizer

Compile and install [the Yubico library](http://github.com/Yubico/yubico-c)
and [the Yubikey personalization tool](http://github.com/Yubico/yubikey-personalization).

### 3. Switch Yubikey to HID/CCID (smartcard) mode

```
$ ykpersonalize -m82
Firmware version 3.0.1 Touch level 1536 Unconfigured

The USB mode will be set to: 0x82

Commit? (y/n) [n]: y
```

### 4. Set up USB device permissions

While the Yubikey in normal keyboard mode will work without thinking
about permissions, when used as a smartcard your user needs to have
read/write access to the device. You have three options.

1. Set device owner or permissions manually: `chmod 666 /dev/bus/usb/xxx/yyy`
2. Set owner or permissions via udev in `/etc/udev/rules.d/99-yubikeys.rules`:
   `SUBSYSTEMS=="usb", ATTRS{idVendor}=="1050", ATTRS{idProduct}=="0111", OWNER="thomas"`
3. Be in whatever group defaults to owning the device on your system

### 5. Create GPG key pair

```
$ gpg --card-edit

Application ID ...: D2760001240102000000000000010000
Version ..........: 2.0
Manufacturer .....: test card
Serial number ....: 00000001
Name of cardholder: [not set]
Language prefs ...: [not set]
Sex ..............: unspecified
URL of public key : [not set]
Login data .......: [not set]
Signature PIN ....: forced
Key attributes ...: 2048R 2048R 2048R
Max. PIN lengths .: 127 127 127
PIN retry counter : 3 3 3
Signature counter : 0
Signature key ....: [none]
Encryption key....: [none]
Authentication key: [none]
General key info..: [none]

gpg/card> admin
Admin commands are allowed

gpg/card> generate

Please note that the factory settings of the PINs are
   PIN = `123456'     Admin PIN = `12345678'
You should change them using the command --change-pin

[enter 12345678 and 123456 when asked for admin PIN and PIN]

[fill in standard GPG key info]
```

GPG using the newly created key should now work. It shouldn't even
look special, except it will ask you for the PIN when needed, and
won't work when the Yubikey NEO is not connected.

## SSH

Turns out gpg-agent can act as an ssh-agent too. The reason for doing
this is so that you can use your GPG key as an SSH key. It doesn't
appear to support SSH certificates though, so I'm not ready to use it
as my default one.

### 1. Get public key in SSH format

```shell
$ gpg-agent --enable-ssh-support --daemon ssh-add -l
2048 xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx cardno:000000000001 (RSA)
$ gpg-agent --enable-ssh-support --daemon ssh-add -L
ssh-add AAAA[...] cardno:000000000001
```

Install this public key in ~/.ssh/authorized_keys of the remote machine.

### 2. Create SSH wrapper script for using gpg-agent

```shell
#!/bin/sh
exec gpg-agent --enable-ssh-support --daemon ssh "$@"
```

You will be asked for your PIN code. Make sure you have a good PIN
code, or no PIN code. Having the default of 123456 is intellectually
dishonest.

Using the key with SSH like this does not require setting up gnupg, or
a keyring in ~/.gnupg or anything like that. Just install the required
prerequisites, fix device permissions, and run the wrapper script.

## Links
* [Yubico blog describing setting up GPG with the NEO](http://www.yubico.com/2012/12/yubikey-neo-openpgp/)
