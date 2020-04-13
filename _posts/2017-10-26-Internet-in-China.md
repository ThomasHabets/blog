---
layout: post
title:  "Internet in China"
date:   2017-10-26 00:00:00 +0000
categories: network
---
In this post I'll describe some experiences I had with the Internet in
China, and what it means for people making websites in the west in
order to reach expats, visitors, and anyone else in China. So this
should be useful information even if you don't care about China as a
market at all.

This blog post may be updated, as I have more thoughts on Internet in
China.

My subjective experience is that "Internet in China" is an
oxymoron. How exactly is there "Internet" without Google, Facebook,
and Twitter? When attaching an Android phone to a WiFi in China it
even says ["Wi-Fi has no Internet access"](/static/2017-10-wifi.png).

OK, that's not entirely serious. Especially since I'm obviously not
aware of what the Chinese language Internet looks like, not speaking
or reading Chinese. [Baidu](https://www.baidu.com/) looks like it
largely provides the services Google does (search, maps, …), but
they're pretty much not translated. The Baidu Map app seems fine, but
is almost useless if you don't speak Chinese. The one thing it's good
for is that unlike Google Maps (if you can even get to it. see below)
it actually shows you a [correct location within
China](https://en.wikipedia.org/wiki/Restrictions_on_geographic_data_in_China).

But more importantly it's not just Google, YouTube, Facebook, Twitter,
Bloomberg, New York Times, and [all the other expected
sites](https://en.wikipedia.org/wiki/Websites_blocked_in_mainland_China)
that are blocked. There's also ALL the websites that assume that
Google works from where you are. And that's a lot.

Two out of the tree Swedish newspapers I tried did not
work. [DN](https://www.dn.se/) and [SvD](https://www.svd.se/) are
*not* blocked, but because they use Google resources they don't
actually work. They start to load, but then you only see a white blank
page. [Aftonbladet](https://www.aftonbladet.se/) did work.

[Picsearch](https://www.picsearch.com/) (a previous employer of mine)
also doesn't load. Because I went to China I didn't bring any access
tokens or laptops, so I couldn't dig too deep to verify for sure, but
I'm pretty sure this is to blame:

```html
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.min.js"></script>
```

The fix here should be quite simple: Just host jQuery yourself. It's
78kB (before gzip). Also the same for external fonts, css, and
images. Yes, I realise I'm saying "don't use CDNs", but on the other
hand it seemed that [Cloudflare](https://www.cloudflare.com/) wasn't
blocked at all, so if you're worried about resource use and latency
then host your CDNable material on a Cloudflare-fronted subdomain.

Really I should also point out that there's no reason to leave out the
schema in this case. Just hardcode `https://` there.

# Recommendation 1: Don't use CDNs

The more services you rely on, the higher the likelyhood that it's
blocked. Maybe one day your friendly CDN will draw the ire of the
Chinese government, or they choose to redirect to a Google-hosted copy
instead, which will fail in China because Google is blocked.

If all your resources are under one FQDN, then there's less likelihood
you you being blocked. With two domains you double your risk.

# Recommendation 2: Actually test your site with Google/Facebook blocked

The list of networks here is probably not complete. I gathered it
simply by resolving some domains, then doing `whois` on the address to
get the whole range.

```
ipset create chinav4 nethash
for addr in \
  64.18.0.0/20 \
  64.233.160.0/19 \
  66.102.0.0/20 \
  66.249.64.0/19 \
  72.14.192.0/18 \
  74.125.0.0/16 \
  104.132.0.0/14 \
  108.177.0.0/17 \
  172.217.0.0/16 \
  207.126.144.0/20 \
  209.85.128.0/17 \
  216.58.192.0/19 \
  216.239.32.0/19 \
;do
  ipset add chinav4 "$addr"
done

ipset create chinav6 nethash family inet6
for addr in \
  2a00:1450::/29 \
  2a03:2880::/29 \
  2607:F8B0::/32 \
  2404:6800::/32 \
;do
  ipset add chinav6 "$addr"
done

iptables  -I INPUT -m set --match-set chinav4 src -j DROP
ip6tables -I INPUT -m set --match-set chinav6 src -j DROP
```

Does your site still load? If it doesn't load fully, is it still at
least usable?

(I'm pretty sure the list above is incomplete, because dn.se still
works after doing this, but picsearch.com does not)

# Recommendation 3: When visiting China, use roaming data with your home Telco

In other words: Get a data plan that's not ridiculously expensive. My
data plan vith Vodaphone UK charges me at £3 per megabyte. Yes, per
megabyte. That would fall under "ridiculously expensive".

The easiest way to get non-censored Internet, with working Google
services (including Google maps and GMail) is to use roaming data from
a western country.

The reason it's not blocked is that roaming mobile data actually
tunnels back to your home country, and it's there that you connect to
The Internet. China could do deep packet inspection on this tunnel,
but they don't.

You'll have a very high latency to everywhere, since all packets have
to go across the world first, but it'll work. You could try getting a
roaming mobile data plan in Hong Kong or a nearby country, which
should help.
