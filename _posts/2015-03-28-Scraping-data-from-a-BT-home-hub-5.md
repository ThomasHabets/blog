---
layout: post
title:  "Scraping data from a BT home hub 5"
date:   2015-03-28 00:00:00 +0000
categories: network
---
If you have BT broadband and want to graph the synced speed and actual
use of your broadband connection, and you use the BT provided router
(Home Hub), then you can't use SNMP to get these counters. But you can
get the data over HTTP without too much trouble. Here's some ugly
one-liners for doing that.

<blargh:body/>

## Current byte counters on the Internet interface (down/up)

```shell
curl -s 192.168.42.1/nonAuth/wan_conn.xml \
    | sed -r '/wan_conn_volume_list/{N;s/.*\[.//;s/[^0-9]\],$//;s/%3B/ /g;s/^[0-9]+ ([0-9]+) ([0-9]+)$/\1 \2/g;p};d'
```

## Current synced up speeds in bps (down / up)

```shell
curl -s 192.168.42.1/nonAuth/wan_conn.xml \
    | sed -r '/status_rate/{N;s/.*\[.//;s/[^0-9]\],$//;s/%3B/ /g;s/^([0-9]+) ([0-9]+) [0-9]+ [0-9]+/\2 \1/g;p};d'
```

## Misc note

First I tried this. And it appeared to work. But only if someone had
logged in to the web UI recently.

```shell
curl -s 192.168.42.1/cgi/cgi_ad_B_Internet.js \
    | sed -r '/wan_conn_volume_list/{N;s/.*\[.//;s/[^0-9]\],$//;s/%3B/ /g;s/.* ([0-9]+) ([0-9]+)$/\1 \2/g;p};d'
```

But then I try it on a different machine and... Oh... oh no. Oh say it
ain't so. Don't tell me the BT home hub security is based on IP
address? Oh... oh it is.

## In conclusion

Yet another reason these routers are completely retarded. Other
examples:

* Internal databases don't have unique constraints on primary keys, so
  if you create a new "application" in the web UI, its "unique" ID may
  clash with an existing "application", and then hilarity ensues. Well
  not hilarity so much as frustration.
* You can't enter an IP address in port forwards. It refuses to accept
  e.g. "192.168.1.123" as a valid address, because it needs to be four
  numbers separated by dots. In other words they have never even
  *tried* to use this feature, because it's 100% broken.
* If acting as a DHCP server, they *cannot* hand out DNS servers other
  than BT's DNS servers. And BT's DNS servers do broken MITM. BT's DNS
  servers spoof "NXDOMAIN" for any reply that has RFC1918 space in
  it. So I have to run my own DHCP server just to hand out
  8.8.8.8. Thanks BT.
* The web server they run don't implement the HEAD http method. You
  get a `501 Method Not Implemented` if you try it. Yes, seriously.
