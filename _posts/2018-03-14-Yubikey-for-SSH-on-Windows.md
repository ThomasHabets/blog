---
layout: post
title:  "Yubikey for SSH on Windows"
date:   2018-03-14 00:00:00 +0000
---
Short post this time.

If you [on Linux set up your Yubikey in smartcard
mode](/2017/10/Yubikey-for-SSH-after-the-infineon-disaster.html) then
you can use that Yubikey without any setup at all on Windows.

Just open
[PuttyWincrypt](https://sourceforge.net/projects/puttywincrypt/), put
in the host to log in to, and under `Connection > SSH > Auth` set
`Private key file for authentication` to `cert://*`, then click
`Open`.

It'll ask for the PIN, you'll have to touch the Yubikey when it's
blinking, and you're in.
