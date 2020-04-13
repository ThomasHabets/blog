---
layout: post
title:  "TPM-backed SSL"
date:   2012-02-03 00:00:00 +0000
categories: security, network, coding, tpm, hsm
---
This is a short howto on setting up TPM-backed SSL. This means that
the secret key belonging to an SSL cert is protected by the TPM and
cannot be copied off of the machine or otherwise inspected.

Meaning even if you get hacked the attackers cannot impersonate you,
if you manage to kick them off or just shut down the server. The
secret key is safe. It has never been outside the TPM and never will
be.

This can be used for both client and server certs.

<blargh:body/>

## Prerequisites

* A TPM chip. Duh. May need to be turned on in the BIOS. Could be
  called "security chip" or something.  If you don't have a TPM chip
  but still want to follow along (maybe add TPM support to some
  program) then you can install a TPM emulator. See links at the end
  on how to install a TPM emulator.
* A working CA that will sign your CSR. I will assume you're
  running your own CA, but you can send the CSR to someone else
  to sign if you want cert creating step.
* Installed "stuff":
  ```
  $ aptitude install tpm-tools libengine-tpm-openssl
  ```

## Initialize TPM

* Make sure you can communicate with the TPM chip:

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
  ```

* Clear the chip:

  ```
  $ tpm_clear --force
  $ tpm_setenable --enable --force
  $ tpm_setactive --active
  ```

These steps may require reboots. They will probably tell you if that's
the case.

* Take ownership and create SRK:

  ```
  $ tpm_takeownership -u -y
  Enter SRK password: [just press enter]
  Confirm password: [just press enter]
  ```

Yes really, empty password. This password protects TPM operations, so
worst case is that someone with shell access can put some load on your
TPM chip.  They can't use it to crack keys or anything. This is not a
password that protects your secrets, they're already secure. You may
want to supply an owner password. If so, leave out the `-y` option.

## Create SSL certificate

* Use script from libengine-tpm-openssl to create key:

  ```
  create_tpm_key foo.key
  ```

* Create CSR for key:

  ```
  openssl req -keyform engine -engine tpm -key foo.key -new -out foo.csr
  ```
  
* Sign the CSR with your CA:

  ```
  openssl x509 -req -days 365 -in foo.csr -CA ca.crt -CAkey ca.key -CAserial serial -out foo.crt
  ```

## Test it

On the server:

```
$ openssl s_server -accept 12345 -cert /path/to/server.crt -key /path/to/server.key -CAfile CA/ca.crt -Verify 1
```

On the client

```
$ openssl s_client -keyform engine -engine tpm -connect server-name-here:12345 -cert foo.crt -key foo.key
```

## Use in your code

Instead of using `SSL_CTX_load_verify_locations()`, use
`ENGINE_*()` and `SSL_CTX_use_PrivateKey()`

Without TPM:

```c
void loadpriv(SSL_CTX* ctx, const char* file)
{
  SSL_CTX_use_PrivateKey_file(ctx, file, SSL_FILETYPE_PEM);
}
```

With TPM:
```c
void loadpriv(SSL_CTX* ctx, const char* file)
{
  ENGINE_load_builtin_engines();
  ENGINE* engine = ENGINE_by_id("tpm");
  ENGINE_init(engine);

  UI_METHOD* ui_method = UI_OpenSSL();
  EVP_PKEY* pkey = ENGINE_load_private_key(engine, file, ui_method, NULL);
  SSL_CTX_use_PrivateKey(ctx, pkey);
}
```

Error handling left as an exercise for the reader.

## Use in the real world

Huh. I haven't actually seen this implemented in any Open Source
software (besides the openssl command line interface) Well, actually
curl and stunnel4 *appear* that they could support it, but it's not
clear
how. [Here](http://comments.gmane.org/gmane.network.stunnel.user/3109)
is someone else wondering how to get stunnel to do it. It's from 2006
with no replies.

The only thing I have that uses the TPM chip is my Chromebook. Client
certs there are protected by it by default.

Please leave comments if you know of any TPM support in Open Source
stuff.

## tlssh

I have added support for [tlssh](http://github.com/ThomasHabets/tlssh)
to use TPM on both the server and client side. Add `-E tpm` on the
client side, and have something like this on the server side config
(or only on one side. There's no requirement that both sides use TPM):

```
PrivkeyEngine tpm
TpmSrkPassword
PrivkeyPassword secretpasswordhere
```

That last line is just needed if the key has a password. The client
can be configured in the same way to not have to ask for the
passwords.

If `PrivkeyEngine tpm` or `-E tpm` is supplied the secret key will be
assumed to be TPM protected and should be in the form of a `BEGIN TSS
KEY BLOB` section instead of a PEM format `BEGIN RSA PRIVATE KEY`
section.

## Performance

Oh, it's slow. Really slow. Luckily it's just used in the handshake.
I haven't done proper benchmarks, but let's just say you won't be
using it to power your webmail. I may do some benchmarking in a coming
blog post.

### Update: It can do about 1.4 connections per second.

See [Benchmarking TPM backed
SSL](/2012/02/Benchmarking-TPM-backend-SSL.html) for details.

## Misc notes

* The .key file for the TPM-backed cert contains the secret key
  encrypted with something that's in the TPM. It's not usable without
  the exact same TPM chip.

* You can choose to create a key in the normal way and then "convert"
  it to a TPM-backed key.  It's not as secure since you can't say the
  key was never stored outside the TPM chip, but use the `-w` switch
  to `create_tpm_key` if you want to do this.

* OpenSSL is probably the most horrible, disgusting, undocumented crap
  library I've ever seen. Some of this can be blamed on SSL, X509 and
  ASN.1, but far from all.

* Emulated TPM is not completely useless. Since the emulator runs as
  root and the user has no insight into it you can have users be able
  to use private keys that they can't read or copy to other
  machines. (caveat: I don't know if the emulator is actually secure
  in this mode, but it can be made to be)

* My TPM chip doesn't seem to like importing (`create_tpm_key -w
  foo.key`) 4096 bit keys. 2048 was fine though.

## Links

* [Trusted platforms module (TPM), openssl and ecryptfs
  tutorial</a>](http://www.infond.fr/2010/03/trusted-platforms-module-tpm-openssl.html).
  Another nice use of TPM. Also installation instructions for TPM
  emulator
* [Resources from a TPM
  workshop](http://www.cs.tau.ac.il/~orkaplan/TPMWorkshop/downloads/)
* [Use TPM on
  Linux](https://sites.google.com/site/ourcomputernotes/security/use-tpm-on-linux)
