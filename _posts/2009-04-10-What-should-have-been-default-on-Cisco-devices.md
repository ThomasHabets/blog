---
layout: post
title:  "What should have been default on Cisco devices"
date:   2009-04-10 00:00:00 +0000
categories: cisco, network
---

Some things on Cisco switches and routers never should have been on by
default. Other things should have been turned on or set
differently. This is not how I want them to be configured in the end
(I like CDP for example), just how I think they should have been
configured from the factory.

(not all commands are supported on all switches/routers. Just ignore
error messages from those settings)

```
vtp mode transparent
service timestamps debug datetime msec localtime show-timezone
service timestamps log datetime msec localtime show-timezone
service sequence-numbers
service password-encryption

snmp-server ifindex persist
no service dhcp
logging buffered 1048576 debugging
spanning-tree portfast default
spanning-tree extend system-id
no ip domain-lookup
no ip source-route
no ip bootp server
no ip finger
no cdp run
no ip http server
no ip http secure-server
no ip https server
no https server
vlan dot1q tag native

int range fa0/1 - 24
  switchport mode access
  switchport nonegotiate
  load-interval 30
  flowcontrol receive off
  flowcontrol send off
  no shutdown

int vlan 1
  load-interval 30

line console 0
  escape-character 3
  transport preferred none
  history size 256
  logging sync
line vty 0 4
  escape-character 3
  transport preferred none
  history size 256
  logging sync
line vty 5 15
  escape-character 3
  history size 256
  logging sync
  transport preferred none
```

Feel free to cut and paste (change according to port
configuration). Suggestions to more defaults are welcome.
