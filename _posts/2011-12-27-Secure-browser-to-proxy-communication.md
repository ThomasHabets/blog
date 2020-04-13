---
layout: post
title:  "Secure browser-to-proxy communication"
date:   2011-12-27 00:00:00 +0000
categories: security, network
---
When connecting to a possibly hostile network I want to tunnel all
traffic from my browser to some proxy I have set up on the Internet.

The obvious way to do this is with a proxy. The problem with that is
that the traffic from the browser to the proxy is not encrypted. Even
when you browse to secure SSL sites some traffic is being sent in the
clear, such as the host name. That's not so bad, but I want to hide my
HTTP traffic too.

<blargh:body/>

Turns out that at least [Chrome <em>does</em> support using SSL
between the browser and the
proxy](http://www.chromium.org/developers/design-documents/secure-web-proxy),
but you can't configure it directly. You have to use Proxy Auto
Configuration to point to an HTTPS host:port.

Running OpenVPN is out in this case since I want it to work with
everything, including Android and ChromeOS… and Windows (without
installing "stuff"). Not that I've tried it with Windows yet, but it
should work.

For added fun I wanted to authenticate to the proxy using a client
certificate, so that I don't have to worry about remembering or losing
passwords.

Before you set off to do the same thing I should warn you that either
I haven't done it quite right or there is a bug in Chrome. If the
network has a hickup so that the proxy or the .pac file is unavailable
it will fall back to connecting directly. I want it to never fall
back. That's kind of the point.

But all is not in vain. I also set up IPSec with these same
certificates. There will be a follow-up post describing how I set this
up to tunnel securely with both Chromebook and my phone.

This is what I did (caveat: some of this is from memory.  If you find
any errors please let me know):

## 1. Copy easyrsa 2.0 from openvpn sources

This is a set of scripts to manage a CA. We'll be using this
directory/set of scripts both to create a server and client
certificates. But only the client certificates will be signed by our
own CA.

## 2. Edit <code>vars</code> file

I like to change KEY_SIZE to 2048, country and other stuff.  These
will be the defaults when creating certs.

## 3. Init easyrsa

```
./clean-all
```

This is a one-time init. Don't run this script again.

## 4. Build the CA for the client certs

```
./build-ca
```

## 5. Copy CA cert to proxy server

```
scp keys/ca.crt proxy:/etc/proxy-ssl/proxy-ca.crt
```

## 6. Build server key and signing request
```
./build-req proxy.foo.com
```

## 7. Get signed server cert

Send keys/proxy.foo.com.csr to your real CA (e.g. cacert.org or
Verisign).  You'll get back proxy.foo.com.crt. If you do use
cacert.org then make sure that your browser trusts <a
href="http://www.cacert.org">their root</a> by importing it.

## 8. Put proxy.foo.com cert and key on proxy server

```
scp keys/proxy.foo.com.{crt,key} proxy:/etc/proxy-ssl/
```

## 9. Install squid proxy and stunnel on proxy server

On Debian/Ubuntu:
```
apt-get install squid3 stunnel
```

## 10. Configure & start stunnel

    1. set `ENABLE=1` in `/etc/defaults/stunnel.conf`
    2. In `/etc/stunnel/stunnel.conf`

       ```
       cert=/etc/proxy-ssl/proxy.foo.com.crt
       key=/etc/proxy-ssl/proxy.foo.com.key
       verify=2
       CAfile=/etc/proxy-ssl/proxy-ca.crt
       [proxy]
       accept  = 12346
       connect = 3128
       ```

    3. `/etc/init.d/stunnel4 start`

## 11. Create .pac file somewhere on an https url

```javascript
function FindProxyForURL(url, host)
{
      return "HTTPS proxy.foo.com:12346";
}
```

Make sure that the certificate of the https server is one that the
browser will accept.

## 12. Set proxy autoconf to the url to this .pac file

Spanner->Preferences->Under the Bonnet->Change proxy
settings->Automatic Proxy Configuration

Set the URL to where the file is, including "https://".

## 13. Try it now. It should fail with SSL errors

It should fail because proxy doesn't accept your cert (you don't have
a cert in the browser yet). Don't continue if you get some other
error.

## 14. Create client cert signed by your own CA

```
./build-key my-proxy-key
```

Don't set a password.

## 15. Convert the client key+cert to .p12, because that's what Android and Chrome wants

```
openssl pkcs12 -export -in keys/my-proxy-key.crt -inkey keys/my-proxy-key.key -out my-proxy-key.p12
```

It'll ask for a password that will only be used in the next step. No
need to save it for later.

## 16. Import the client certificate into the browser

On your Chrome (or chromebook) go Spanner->Preferences->Under the
Bonnet->Certificate Manager->Your Certificates->Import (or "Import and
Bind to Device").

### 17. Try to browse somewhere. Now it should work

Make sure you're actually using the proxy. Go to
[www.whatismyip.com](http://www.whatismyip.com) or something and make
sure that it sees the IP of the proxy.  It'll probably tell you that
you're using a proxy. If it doesn't work then good luck. :-)

## Problems

Like I said it seems that it falls back to connecting directly, even
though the .pac file doesn't have a fallback mechanism
configured. Stay tuned for the IPSec version.
