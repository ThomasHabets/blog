---
layout: post
title:  "tlssh - a replacement for SSH"
date:   2010-08-05 00:00:00 +0000
categories: security, unix, coding, network
---
I've started writing a replacement for SSH.

Why? Because SSH has some drawbacks that sometimes annoy me. I also
wanted an authentication scheme that's more similar to SSL/TLS than
what SSH does.

With tlssh you don't specify username or password, you simply connect
to the server using a client-side certificate to log in as the user
specified in the certificate. No interaction until you reach the shell
prompt on the server.

<blargh:body/>

Of course you can log in using a public key with SSH, but it's only a
public/private key pair, there's none of the
[PKI](https://secure.wikimedia.org/wikipedia/en/wiki/Public_key_infrastructure)
that SSL has.

Specifically, what I was missing in SSH was:

* Expiring keys, both login-keys and server certificates
* [CRL](https://secure.wikimedia.org/wikipedia/en/wiki/Certificate_revocation_list)s.
  (Certificate Revocation Lists) - wouldn't it be nice to just revoke the
  all certificates that were on a compromised machine and they'll suddenly be unusable
  everywhere? (I will add [OCSP](https://secure.wikimedia.org/wikipedia/en/wiki/OCSP) too. Same
  thing but more "online")
* Pureness. Not all these channels and port forwarding features that complicate
  everything (and adds bugs).
* TCP MD5. I doubt SSH will ever get this. (temporarily disabled in tlssh)
* CA-signed server certificate. Use Verisign-signed certificates (if you trust them) and
  you'll have none of that "confirm server fingerprint" stuff.
* Will get some client-side features that I've missed in SSH. Like "take a
  file from the local filesystem as send it as if I typed it", to avoid having
  to scp 5 times because you have to transfer a file hop-by-hop. The OpenSSH folks
  rejected my patch for this.

It's built on [OpenSSL](http://www.openssl.org), so as long as there
aren't any bugs in the X.509 parsing in OpenSSL I should be
fine. Unfortunately X.509 is a horrible mess of a format so this is
not impossible. Activating TCP MD5 before SSL negotiation should
lessen the risk, but still.

To log in to a server you create a certificate with CommonName
bob.users.example.com, and get it signed by the CA the server
trusts. The server will split this CommonName into the user part and
the domain part. The domain part must match what the server is
expecting. If everything is fine (and the certificate is not in the
CRL, and the CRL is not too old), you are presented with a shell as
the user mentioned in the user part of the certificate.

To log in as a different user you have to create a second certificate.

Another reason I'm writing tlssh is to learn OpenSSL. The OpenSSL API
is horrible, as it turned out.

It's also fun to code system level stuff, creating terminals and such.
You learn that [OpenBSD](http://www.openbsd.org/) doesn't seem to care
about [POSIX](https://secure.wikimedia.org/wikipedia/en/wiki/POSIX) or
other standards.  When some library call is acting funny you can often
google your way to some top OpenBSD-developer saying "who cares about
POSIX? That was a stupid question" when someone notices the
non-compliance. They still don't have `wordexp()` for example.

## Drawbacks

* Not as portable as [OpenSSH](http://www.openssh.org/). Currently
  works on Linux, OpenBSD and Solaris.
* Not as audited (I wholeheartedly invite more eyes, and code too)
* Because it needs a CA to sign certificates, it's not initially as
  plug-and-play as SSH.
* Like I said X.509 is horrible. Hopefully OpenSSL parses it
  perfectly, but you never know.

## Resources

* [tlssh on Github](http://github.com/ThomasHabets/tlssh)
* `git clone git://github.com/ThomasHabets/tlssh.git`
