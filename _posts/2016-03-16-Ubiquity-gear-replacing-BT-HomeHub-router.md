---
layout: post
title:  "Ubiquity gear replacing BT HomeHub router"
date:   2016-03-16 00:00:00 +0000
categories: network
---
These are my notes from setting up [Ubiquity](http://www.ubnt.com)
wifi access point and router to replace the horrible BT HomeHub 5.

<blargh:body/>

## What's wrong with BT HomeHub?

* It can't hand out non-BT DNS servers
  (and BT's DNS servers MITM your queries and spoof NXDOMAIN
  if the reply has rfc1918 addresses in them. This is known
  and they "can't" turn this off)
   * This means that I had to turn off the DHCP server
     and run my own on a raspberry pi.
     So I'm actually replacing two devices.
     It was already not a all-in-one-box solution.
* The port forwarding database is not using unique key constraints,
  so you have to try and re-try adding port forwardings until
  you're lucky and don't hit a key collision.
* Only one wifi network. I want untrusted things (IoT) to be
  firewalled from the rest.
* I want to deny Internet access to some IoT things.
  I don't need them to be able to connect anywhere. HomeHub doesn't support that.
* Wifi range is not great. Not terrible, but bad enough that it doesn't cover my home.
* I don't know if it's to blame, but I did not have a good experience trying to set up
  a second AP to automatically roam into. It sort of worked, but was not reliable.

## Replacement hardware

### [Ubiquiti EdgeMAX EdgeRouter PoE 5-Port Router](https://www.ubnt.com/edgemax/edgerouter-poe/)

The three ports of the
[EdgeRouter Lite](https://www.ubnt.com/edgemax/edgerouter-lite/)
are not enough,
since one will go to the AP, one to uplink, and one to the wired network.
I'd rather have a couple of extra ports where my Internet
comes in without having to have a separate switch there.

The web UI is fine. It's actually better than fine. It's the best web
UI I've seen on a router, be it the "why do you even have this" web UI
that (even high end) Cisco routers have, or normal home broadband
routers.

But like with Cisco if you really want to configure you need to do it
command line. The web UI falls short when you get to slightly more
complicated things like pppoe.

The router runs EdgeOS, which is based on Vyatta, which in turn looks
like the Juniper CLI except not as polished (e.g. no `show | display
set`).

It also seems you have to run both `commit` and `save` after changing
the config, since the former doesn't actually persist the new config
to disk.

One annoyance with this router is that while you can do L2 switching
between some ports, you can't provide tagged output on one port and
the same VLAN untagged on another. It's a router with *some* switching
capabilities, but it's [not a switch](/2009/10/Holy-ip-packet-Batman.html).

### [Ubiquiti UniFi AP AC LR Indoor Access Point](https://www.ubnt.com/unifi/unifi-ap-ac-lr/)

I wanted to make sure the range was good enough, so I got the Long
Range one.

You configure it using the UniFi controller, a piece of software
written in Java that you run on a PC of some sort. It starts up a web
server which you connect to. It's pretty neat. It's obvious that this
would work great to manage many APs. You don't even need to run the
controller locally, you could run it in a VM in some cloud service
like EC2 or GCE.

The only complaint I have about the controller is that it requires
3.5GB disk space for its backing MongoDB database.

The management interface of the AP comes untagged, and the SSIDs are
delivered either on that same segment or optionally with a VLAN tag.
Obviously I kept them separate.

Since the AP management is not on a switched network I had to specify
the address of the UniFi controller. I found it most convenient to do
that via DHCP:

```
show service dhcp-server shared-network-name WifiMgmt subnet 192.168.10.0/24 unifi-controller 192.168.20.33
```

### Old VDSL2+ modem I already had.

So I'm replacing two boxes with three (RPi & HomeHub with modem, AP,
and router). Actually for other reasons not relevant here I'll be able
to remove a switch too, so it's three for three.

It's usually possible to turn a combined router/modem into just a
modem, so if the modem breaks I can use the HomeHub as just the modem.

## Setting up the BT uplink interface.

Setting up PPPoE with full MTU was a bit tricky, but this works:

```
ubnt@ubnt# show interfaces ethernet eth0
 address dhcp
 duplex auto
 firewall {
     local {
         name External
     }
 }
 mtu 1508
 poe {
     output off
 }
 pppoe 0 {
     default-route force
     firewall {
         local {
             name External
         }
     }
     mtu 1500
     name-server none
     password broadband
     user-id bthomehub@btbroadband.com
 }
 speed auto
```

## Other notes

* Sometimes the router would not let me commit a change
  because a "device or resource busy". At least once I had
  to edit `/config/config.boot` manually and reboot because
  the change would just not go in.
* PoE is very nice. It makes it much easier to place the AP
  where you want it, since you only need the network cable to go there.
* A friend also recommended [Dual-Band Wireless-N900 Gigabit
  Router](https://www.asus.com/us/Networking/RTN66U/)
