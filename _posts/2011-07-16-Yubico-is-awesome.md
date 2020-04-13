---
layout: post
title:  "Yubico is awesome"
date:   2011-07-16 00:00:00 +0000
categories: security, coding, unix, hsm
---
[Yubico](http://www.yubico.com) and their products are awesome.

That pretty much sums up this blog post but I'm going to go on
anyway. If you're thinking of introducing two-factor authentication to
your company, or you're using something that's fundamentally broken
(like RSA SecureID) you simply must at least take Yubikeys into
consideration.

<blargh:body/>

When I say that SecureID (and others) are fundamentally broken what I
mean is that when (not if, as recent history has shown) RSA (the
company) is broken into **YOUR** security is now compromised. When I
first used SecureID and found out that you as a customer aren't in
control of your own keys my first thought was "well that's just
stupid". Why are you giving the keys to the kingdom to someone else?

Enter Yubikeys. They just beat SecureID in every way (almost). Benefits:

* Open specification.
* You can set your own keys (secrets) and don't have to show them to a third party who can lose them.
* They're cheap. 25 USD for one (yes you can buy just one if you want)
  and cheaper in bulk, of course. No server license.
* No server license. (this bears repeating). Yes there are products
  you can buy to get features and such, but with minimal coding you can actually get this
  up and running on your website / server logins for free!
* Looong OTP tokens. If you don't have some account locking feature on your servers
  you can brute-force 6 digits fairly quickly. OpenSSH by default allows 10
  unauthenticated sessions with one attempt per second. You can script that
  to log in in less than a day.

Cons:

* No clock in the device. While plugged in the token it generates will
  be a function of how long it's been powered up this session, but it
  doesn't have a battery-powered clock that you can sync with the
  server.

* No display on the device. Well, you wouldn't want to key in a really
  long token anyway, but if you can't insert USB into the terminal or
  want to use it to log in somewhere with your phone then you're
  screwed. I bet Yubico are working on some
  [NFC](http://en.wikipedia.org/wiki/Near_field_communication) to fix
  that though. (the RFID parts of some Yubikeys are something separate
  that I'm not including here)

Maybe to fix that last point someone should make a handheld device
that you can plug your Yubikey into where all it can do is display
what's typed.

## So what can you do with a Yubikey?

The Yubikey has two slots, and you can do different things with the two slots.

### Simple OTP generation

When you press the button it'll generate a token that is "typed" (the
Yubikey will appear to be a USB keyboard to the computer) that's a
function of:

* The secret key (obviously)
* The time since this session started
* Number of tokens generated this session
* Number of sessions since device was programmed
* Key ID (user settable), so you know which secret key to use do decode the token.
* Some other less interesting fields. This list is intentionally not complete.

A "session" is "when it's plugged in". This means you can always tell
an earlier token from a more recent one (if you know the secret
key). The data is encrypted (not HMACed) so that the verifier (the
server) can read the fields and see that it's not an old token. But
this is where the lack of a clock kicks in. You can generate a token
and then wait a year before you use it. If (and only if) no newer
token has been used, that token is still valid.

This waiting is not possible when using challenge-response mode (see below).

### Symantec VIP

If you buy one for personal use I'd recommend buying the VIP key. It's
the same price as the normal one but it comes pre-programmed in slot 1
with something you can use to log into your paypal account (once you
associate the key with your account).

You can still use slot 2 for something else.

### Static password

Meh. I haven't had the need for this. It's the equivalent of a long
password that you've written down, except the convenience that you
don't have to type. If someone has physical access they can copy the
password just like a written-down one.

### HOTP

Generate standard HOTP, in case you're already using those you can use
a Yubikey to generate them instead of whatever device you're currently
using.

### Challenge-response mode

If you want to make sure that the Yubikey is plugged into a computer
when the authentication is taking place then challenge-response is for
you. Since keyboards are one-way devices this means that the "the
Yubikey is just a keyboard, no software required" breaks down. I
suppose the OS could flash the caps lock lamp to send data to a
keyboard without extra functions, but the point is that would also
require software that is Yubikey-aware on the client. The other modes
do not require this. They work with everything that understands USB
keyboards.

So what you need on your client is a program that can take the
challenge from the server, send it to the Yubikey and then send the
reply back to the server.  If you are an online game developer this
would just be something you put into your game. As long as the users
have their Yubikey plugged into their machine they can log in and
play.

I've created some scripts to use this for unix authentication that
I'll be releasing in a week or two. You SSH to some server, the server
says "Yubikey challenge: XXX[...]: ", you copy that challenge (just
select it) and press a key combination that starts this script. The
script takes the challenge from the clipboard, gets the reply from the
Yubikey and "types" it. Challenge-responses aren't "typed" by the
Yubikey so I'm doing that in the script. And presto, you get
challenge-response Yubikey authentication with SSH and every other
application without having to code it into your client.

## [YubiHSM](http://www.yubico.com/YubiHSM)

This is a different product. It's for servers, not clients. It will
protect you against your whole password database being stolen if you
have a break-in. For many people losing their users passwords is worse
than losing the data. Think of sites like
[Twitter](http://www.twitter.com),
[StackOverflow](http://www.stackoverflow.com), and other public-data
websites. Do they care if someone steals their whole database? Of
course they do, but if they at least don't lose their passwords then
when the system is fixed and backdoors removed (a whole topic in
itself) they're done. If they lose everyones password then not only do
they have to ask all their users to change their password, but also
that they must stop using that password everywhere else they may have
used it. You're not supposed to reuse passwords, but the reality is
that people do.

By the way, I don't care if you hash your passwords with unique salt
for everyone. If you lose that database then you've lost the users'
passwords.

YubiHSM is a USB-attached device that doesn't emulate a keyboard. It
has several functions (including the ability to do the logic of a
Yubikey authentication server) but to me the most interesting is
protecting the password database.

In short, YubiHSM can give you an interface where you can use just two operations:

* Set password. This will not store anything on the YubiHSM but will
  give you back a blob that only the YubiHSM can decrypt.

* Check password. You supply a password and a blob and the YubiHSM
  says "yes" or "no".  It does not give you the password.</li>

So the only way to crack the password file once stolen (short of
breaking AES) is to try password after password with the "check
password" function until you hit the right one. Since you have to send
all these check commands to the YubiHSM it doesn't scale.  The
attacker can't simply buy 100 Amazon EC2 machines to attack you. And
when you notice that someone broke in to your server you can just
detach the YubiHSM and even that attack vector is gone.

Using [yhsmpam](https://github.com/ThomasHabets/yhsmpam) I've used
this to secure a unix machine. Think of it as moving from storing
hashes in `/etc/passwd` to storing them in `/etc/shadow`, but this time
moving from `/etc/shadow` to YubiHSM.

Unfortunately YubiHSM isn't for sale yet. Oooh! I just checked [the
website](http://www.yubico.com/YubiHSM) and it's going on sale on 18
August 2011.  At 500 USD it's more expensive than the Yubikey, but
then again you only need it for your authentication server, not for
every user. 500 USD is NOT a lot for this kind of hardware. Before
YubiHSM you'd have to cough up 15k+ USD to get this. PRE-ORDER NOW!
Run, do not walk, to [their online store](https://store.yubico.com/).

## Complaints

* No clock in the Yubikey
* Hard to use Yubikey with phone
* While all "normal" keyboard layouts work fine (including German),
  Dvorak will not work well with Yubikeys by default. Well, with my
  ChromeOS laptop it did work by default, but still.

## Links

* [Yubico](http://www.yubico.com)
* [pam_externalpass](https://github.com/ThomasHabets/pam_externalpass) - PAM module I use to do more fancy auth.
* [YHSMPAM](https://github.com/ThomasHabets/yhsmpam) - Backend for keeping UNIX passwords in YubiHSM
* [YOracle](https://github.com/ThomasHabets/yoracle) - My own yubikey validator server.
