---
layout: post
title:  "Yubikey for SSH after the Infineon disaster"
date:   2017-10-22 00:00:00 +0000
categories: security
---
Because of the [Infineon Disaster of
2017](https://www.yubico.com/keycheck/) lots of TPM and Yubikey keys
have to be regenerated.

I have [previously
blogged](/2016/01/Yubikey-4-for-SSH-with-physical-presence-proof.html)
about how to create these keys inside the yubikey, so here's just the
short version of how to redo it by generating the key in software and
importing it into the yubikey.

When it appears to stall, that's when it's waiting for a touch.

```shell
# When it asks for PIN, the default PIN is 123456, default PUK 12345678.
openssl genrsa -out key.pem 2048
openssl rsa -in key.pem -outform PEM -pubout -out public.pem
yubico-piv-tool -s 9a -a import-key  --touch-policy=always -i key.pem
yubico-piv-tool -a verify-pin -a selfsign-certificate -s 9a -S '/CN=my SSH key/' -i public.pem -o cert.pem
yubico-piv-tool -a import-certificate -s 9a -i cert.pem
rm key.pem public.pem cert.pem
ssh-keygen -D /usr/lib/x86_64-linux-gnu/opensc-pkcs11.so -e
yubico-piv-tool -a change-pin
yubico-piv-tool -a change-puk

# Optional if you want to turn off Yubikey OTP (recommended for Nano)
ykpersonalize -m1
```

Delete all mentions of previous key. It's good to have a disaster plan
ahead of time if keys need to be replaced, but if you don't have one:

1. Inventory all bad keys. Make sure you have their fingerprints.
2. Inventory all places this key could be installed.
3. Generate new keys.
4. Distribute new keys. (in this case, add to all relevant `~/.ssh/authorized_keys`)
5. Remove all old keys.
6. Grep for the keys found in step 1.
7. Try to log in with old key.

You could do 4 and 5 in one go, replacing key XXXXX with YYYYY (pick
something large enough from the key to be unique) with something like:

```shell
OLD=XXXXXX
NEW=YYYYYY
NEW_URL=https://www.example.com/ssh-key.pub
for host in $(cat hosts); do
  echo -------------
  echo $host
  ssh $host "
set -e
cd .ssh
(grep -q $OLD authorized_keys && echo FIXING: old key there || echo OK: old key not there)
sed -i '/$OLD/d' authorized_keys
(grep -q $NEW authorized_keys && echo OK: new key already there || curl -s $NEW_URL >> authorized_keys)
" || echo "FAILED: could not log in"
done
```

Be prepared to touch the yubikey a lot.

[PS](https://sourceforge.net/p/trousers/mailman/trousers-users/thread/CA%2BkHd%2BdiwaDG0Oj20pioejk62yZhqD-EZ_Uhp7zBSS4WTgesWg%40mail.gmail.com/#msg36085699)
