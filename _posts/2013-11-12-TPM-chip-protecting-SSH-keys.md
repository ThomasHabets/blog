---
layout: post
title:  "TPM chip protecting SSH keys"
date:   2013-11-12 00:00:00 +0000
categories: security, hsm, tpm, unix
---
## STOP! There is a better way.

I've written [a post that explains a simpler and more secure
way](/2013/11/TPM-chip-protecting-SSH-keys---properly.html).

### Update 2

I have something I think will be better up my sleeve for using the TPM
chip with SSH. Stay tuned. In the mean time, the below works.

Finally, I found out how to use a TPM chip to protect SSH keys.
Thanks to [Perry Lorier](http://www.lorier.net/docs/tpm).  I'm just
going to note down those same steps, but with my notes.

I've written about hardware protecting crypto keys and increasing SSH
security before:

* [GPG and SSH with Yubikey NEO](/2013/02/GPG-and-SSH-with-Yubikey-NEO)
* [Benchmarking TPM backed SSL](/2012/02/Benchmarking-TPM-backed-SSL)
* [TPM backed SSL](/2012/02/TPM-backed-SSL)
* [SSH certificates](/2011/07/OpenSSH-certificates)

but this is what I've always been after. <strike>With this solution
the SSH key <b>cannot</b> be stolen. If someone uses this SSH key that
means that the machine with the TPM chip is involved right now. Right
now it's not turned off, or disconnected from the network.</strike>

### Update

You need to delete `/var/lib/opencryptoki/tpm/your-username/*.pem`,
because otherwise your keys will be migratable. I'm looking into how
to either never generating these files, or making them unusable by
having the TPM chip reject them. Update to come.

<blargh:body/>

When I run this again on a completely blank system I'll add more exact
outputs.

### 1. Install dependencies

```
$ apt-get install trousers tpm-tools
```

Make sure tcsd is running and only listening on localhost.
```
$ sudo netstat -nap | grep :30003.*LISTEN
  tcp    0      0 127.0.0.1:30003     0.0.0.0:*    LISTEN   3103/tcsd
```

### 2. Verify TPM chip

Make sure `tpm_version` and `tpm_selftest` don't give errors.

```
$ tpm_version
  TPM 1.2 Version Info:
  Chip Version:        1.2.4.1
  Spec Level:          2
  Errata Revision:     2
  TPM Vendor ID:       INTC
  Vendor Specific data: 00040001 0003040e
  TPM Version:         01010000
  Manufacturer Info:   494e5443
$ tpm_selftest
  TPM Test Results: 00000000
```

### 3. Initialise the TPM chip

```
sudo tpm_takeownership
```

If you've already taken ownership, but set an SRK password, then run
`sudo tpm_changeownerauth -s -r`. Not all tools support
SRK passwords, so you have to remove it, or in other words change it
to the "well known password" that is 20 zero bytes (I'm not making
that up).

If it says `Tspi_TPM_TakeOwnership failed` then you may have to use
`tpm_clear` to reset the chip to factory state and try again. This may
involve cold reboots, enabling the TPM chip in the BIOS, and other
joys.

Run:

```
sudo pkcs11_startup; sudo service opencryptoki restart
```

### 4. Add users to TPM groups

Add all users who will be using the TPM chip to the 'tss' and 'pkcs11' groups.
Don't forget to log out and in again, or run <quote>su $(whoami)</quote>.

### 5. As every user, initialize the user's TPM PKCS#11 data store</h1>

```
$ tpmtoken_init
```

If you get `Bus Error (core dumped)` then check for, and delete, any
`/var/lib/opencryptoki/tpm/your-user-name-here/.stmapfile` file laying
around.

### 6. Generate an RSA key pair

```
$ pkcs11-tool --module=/usr/lib/opencryptoki/libopencryptoki.so.0 \
    --login --keypairgen -d 01 \
    -a "$(whoami)@$(hostname --fqdn) key" \
    --key-type rsa:2048
[...]
```

### 7. Try some pkcs11-tool commands

```
$ pkcs11-tool --module=/usr/lib/opencryptoki/libopencryptoki.so.0 -O
Using slot 0 with a present token (0x0)
Public Key Object; RSA 2048 bits
  label:      XXXX@XXXX
  ID:         XX
  Usage:      encrypt, verify, wrap
$ pkcs11-tool --module /usr/lib/opencryptoki/libopencryptoki.so.0 -O --login
Using slot 0 with a present token (0x0)
Logging in to "IBM PKCS#11 TPM Token".
Please enter User PIN:
Private Key Object; RSA
  label:      XXXX@XXXX
  ID:         XX
  Usage:      decrypt, sign, unwrap
warning: PKCS11 function C_GetAttributeValue(ALWAYS_AUTHENTICATE) failed: rv = CKR_ATTRIBUTE_TYPE_INVALID (0x12)
[Thomas note: ignore this warning]
Public Key Object; RSA 2048 bits
  label:      XXXX@XXXX
  ID:         XX
  Usage:      encrypt, verify, wrap
```

### 8. Set up simple SSH

Extract the public part of the key in SSH format:

```
$ ssh-keygen -D /usr/lib/opencryptoki/libopencryptoki.so.0
ssh-rsa AAAAB3NzaHjn[...]uiimW
```

Put it in an `~/.ssh/authorized_keys` or something.

```
$ ssh -I /usr/lib/opencryptoki/libopencryptoki.so.0 thomas@shell.example.com
Enter PIN for 'IBM PKCS#11 TPM Token':
You have new mail.
Last login: Wed Nov 13 22:14:11 2013 from XXXX.XXXX.com
thomas@shell$
```

Add this to your `~/.ssh/config`:
```
Host *
        PKCS11Provider /usr/lib/opencryptoki/libopencryptoki.so.0
```

Or add it to your `ssh-agent`:

```
$ ssh-add -s /usr/lib/opencryptoki/libopencryptoki.so.0
Enter passphrase for PKCS#11:
Card added: /usr/lib/opencryptoki/libopencryptoki.so.0
$ ssh-add -l
2048 xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx /usr/lib/opencryptoki/libopencryptoki.so.0 (RSA)
```

### 9. If you want, set up SSH certificates

Unlike when setting up [Yubikey NEO-protected
SSH keys](/2013/02/GPG-and-SSH-with-Yubikey-NEO.html), this method
works with [SSH certificates](/2011/07/OpenSSH-certificates)</a>. It
shouldn't be too much different from without TPM chips, but I haven't
done it yet, myself.

## Random notes

* Don't set an SRK password. Some tools don't specifying it (like
  `tpmtoken_init`), and only work with the default all-null SRK
  password.
* If you get a "No EK" error anywhere along the lines, try `sudo
  tpm_createek`
* The default "security officer" password is "87654321".
* `ssh-add -D` does not disconnect completely from the pkcs11 provider (the TPM chip), use
  `ssh-add -e /usr/lib/opencryptoki/libopencryptoki.so.0`
  if `ssh-add -s /usr/lib/opencryptoki/libopencryptoki.so.0` gives errors
* You can use the TPM chip with Chrome. See [Lorier's
  documentation](http://www.lorier.net/docs/tpm) for details.
* Another useful tool: `/usr/sbin/pkcsconf -t`
