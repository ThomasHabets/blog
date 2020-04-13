---
layout: post
title:  "WPA2 and Infineon"
date:   2017-10-27 00:00:00 +0000
categories: security, tpm
---
The [recent bug in WPA2](https://www.krackattacks.com/) has a worst
case outcome that is the same as using a wifi without a password:
People can sniff, maybe inject… it's not great but you connect to open
wifi at Starbucks anyway, and you're fine with that because you visit
sites with HTTPS and SSH. Eventually your client will get a fix too,
so the whole thing is pretty "meh".

But there's a reason I call it "WPA2 bug" and I call the recent issue
with Infineon key generation ["the Infineon
disaster"](https://keychest.net/roca). It's much bigger.  It seems
like [the whole of Estonia needs to re-issue ID
cards](https://arstechnica.com/information-technology/2017/10/crypto-failure-cripples-millions-of-high-security-keys-750k-estonian-ids/),
and several years worth of PC-, smartcard-, Yubikey, and other
production have been generating bad keys. And these keys will stick
around.

From now until forever when you generate, use, or accept RSA keys you
have to check for these weak keys. I assume OpenSSH will if it hasn't
already.

But then what? It's not like servers can just reject these keys, or
it'll lock people out. And it's not clear that an adversary even has
your public key for SSH. And you can't crack the key if you don't have
the public half. Maybe a warning, and then in a year start rejecting
the keys?

And then you have to trust that every other implementation does the
same.

But then you have all the clients and servers that just never get
updated or audited…

So this is a disaster. It's worse than the [Debian randomness
bug](https://www.schneier.com/blog/archives/2008/05/random_number_b.html).

## Previous blog posts on this issue

* [Is my TPM affected by the Infineon disaster](/2017/10/Is-my-TPM-affected-by-the-Infineon-disaster.html)
* [Yubikey for SSH after the Infineon disaster](/2017/10/Yubikey-for-SSH-after-the-infineon-disaster.html)
