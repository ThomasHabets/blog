---
layout: post
title:  "Yubikey 4 for SSH with physical presence proof"
date:   2016-01-28 00:00:00 +0000
categories: security
---
This is another post in the series of how to protect SSH keys
with hardware, making them impossible to steal.

This means that you know that your piece of hardware (e.g. Yubikey or
TPM inside your laptop) was actively involved in the transaction, and
not, say, turned off and disconnected from the Internet at the time
(like in a safe or on an airplane).

What's new this time is that we can now have a physical presence test
on every use of the key. That means that even if someone hacks your
workstation completely and installs a keylogger to get your PIN,
unless they also break into your home they can't use the key **even
while the machine is on and connected**.  Evil hackers in another
country are out of luck.

<blargh:body/>

## Intro

Most of this is a repeat of official docs (see references).

If it looks like a command is hanging, check to see if the Yubikey is
flashing. If it is, then touch it.

The touch feature is optional. If you don't want a key to require it,
you can chose to generate a key that doesn't.

## Install yubico-c, ykpersonalization, and yubico-piv-tool (only needed for setup, not use)

Actually opensc is needed for use. I just wanted to stress that no
need to compile and install third party stuff on every machine this
will be used on.

```shell
sudo apt-get install help2man gengetopt libtool autoconf automake opensc asciidoc libxml2-utils libusb-dev libssl-dev libpcsclite-dev pcscd
git clone https://github.com/yubico/yubico-c
cd yubico-c
autoreconf -i
./configure --prefix=$HOME/opt/yubico
make
make install
cd ..

git clone https://github.com/yubico/yubikey-personalization
cd yubikey-personalization
autoreconf -i
./configure --prefix=$HOME/opt/yubico
make
make install
cd ..

git clone https://github.com/yubico/yubico-piv-tool
cd yubico-piv-tool
autoreconf -i
./configure --prefix=$HOME/opt/yubico
make
make install
cd ..
```

## Turn on CCID only mode

```
ykpersonalize -m1
```

Don't worry about the scary warning. The NEO tool can set it back the
way it was. Unplug and plug the Yubikey.

You should now see the Yubikey as a smartcard reader:

```
opensc-tool --list-readers
# Detected readers (pcsc)
Nr.  Card  Features  Name
0    Yes             Yubico Yubikey 4 CCID 00 00
```

If you get "no smart card readers found", open
`/etc/libccid_Info.plist`, and add the vendor (should be 0x1050),
product (0x0407 or near there) and "Yubico Yubikey 4 Something" as the
first entry in `ifdVendorID`, `ifdProductID` and `ifdFriendlyName`
arrays respectively. The actual vendor and product codes you can see
by running `lsusb`. Then restart `pcscd` and try again.

## Change the PIN and the PUK.

They default to 123456 and 12345678 respectively.

The PIN will be asked for by the user, and the PUK is used in case the
user locked themselves out by failing to provide the right PIN too
many times.  Three times by default.

Wikipedia has [more on PUK](https://en.wikipedia.org/wiki/Personal_unblocking_code).

```
yubico-piv-tool -a change-pin
yubico-piv-tool -a change-puk
```

If you lose your PIN and PUK you can reset the Yubikey by first
spending all your PIN/PUK attempts, and then running

```yubico-piv-tool -a reset```

You may want to set the management key too. See [this
matrix](https://developers.yubico.com/PIV/Introduction/Admin_access.html)
for details about what PIN is used for what. In short, if you are a
hobbyist then I'd say you don't need to set the management key. If you
are the security department for your organization and you're handing
out these Yubikeys, then you probably do. You don't want your users to
change the number of PIN retries they're allowed, for example.

## Generate a key

The second command here requires a touch. Check for the Yubikey blinking. The
first command is not waiting for touch. It just takes a while to generate
a 2048 bit RSA key.

```shell
yubico-piv-tool -a generate --touch-policy=always -s 9a -o public.pem
yubico-piv-tool -a verify-pin -a selfsign-certificate -s 9a -S '/CN=my SSH key/' -i public.pem -o cert.pem
```

Inspect the certificate with `openssl x509 -text -in cert.pem`.

Touch policy "always" means that every time the key is used it
requires a touch.

The key generation command also takes a `--pin-policy` that can be set
to "once".  I'm not sure what that means. I would have guessed that
only once per power-up, but when testing I get asked every time, even
if I set it to "never".

## Import certificate onto Yubikey

```
yubico-piv-tool -a import-certificate -s 9a -i cert.pem
```

The two generated PEM files can now be discarded.

## Use PKCS#11 to get the public key in SSH format

```
ssh-keygen -D /usr/lib/x86_64-linux-gnu/opensc-pkcs11.so -e
ssh-rsa AAAA...
```

## Use the SSH key

```
ssh -I /usr/lib/x86_64-linux-gnu/opensc-pkcs11.so foo@bar.com
Enter PIN:    (and then touch Yubikey when it flashes)

```

or

```
ssh-add -s /usr/lib/x86_64-linux-gnu/opensc-pkcs11.so
Enter PIN:

ssh foo@bar.com
(touch Yubikey when it flashes)
```

## Other commands

```
yubico-piv-tool -a read-cert -s 9a | openssl x509 -text
```

## Notes
* The Yubikey 4 does support elliptic curves, but they don't seem to
  be compatible with what OpenSSH supports. We're stuck with RSA2048
  for now.

## References

* [Official Yubico docs that give most of this
  info](https://developers.yubico.com/yubico-piv-tool/SSH_with_PIV_and_PKCS11.html)
* [PIN, PUK, and management keys](https://developers.yubico.com/yubikey-piv-manager/PIN_and_Management_Key.html)
* [Using a Yubikey 4 as a
  CA](https://dennis.silvrback.com/openssl-ca-with-yubikey-neo). Really
  cool. Also
  [here](https://developers.yubico.com/yubico-piv-tool/Certificate_Authority.html).
* [Using a Yubikey 4 as an SSH
  CA](https://blog.josefsson.org/2015/06/16/ssh-host-certificates-with-yubikey-neo/). Also
  cool. (it says NEO but Yubikey 4 non-NEO should work too. With v4
  NEO only adds NFC which we don't need here)