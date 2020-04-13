---
layout: post
title:  "Killing idle TCP connections"
date:   2017-03-15 00:00:00 +0000
categories: network, linux
---
# Why

Let's say you have some TCP connections to your local system that you
want to kill. You could kill the process that handles the connection,
but that may also kill other connections, so that's not great. You
could also put in a firewall rule that will cause the connection to be
reset. But that won't work on a connection that's idle (also if one
side is initiator then using this method the other side would not tear
down its side of the connection). There's
[`tcpkill`](https://en.wikipedia.org/wiki/Tcpkill), but it needs to
sniff the network to find the TCP sequence numbers, and again that
won't work for an idle connection.

Ideally for these long-running connections TCP keepalive would be
enabled. But sometimes it's not. (e.g. it's not on by default for gRPC
TCP connections, and they certainly can be long-running and idle).

You could also do this by attaching a debugger and calling
`shutdown(2)` on the sockets, but having the daemon calling unexpected
syscalls thus getting into an unexpected state doesn't really make for
a stable system. Also attaching a debugger hangs the daemon while
you're attached to it.

This post documents how to do this on a Debian system.

# No, really. Why?

If a client connects to a dual-stack hostname it'll (usually, see
[RFC3484](https://www.ietf.org/rfc/rfc3484.txt)) first try IPv6, and
then IPv4 if that fails.

If a server comes up after the client tries IPv6 then it'll fall back
to IPv4, even though IPv6 would have worked at that time too.

I want to kick the IPv4 clients over to IPv6, since restarting the
server (or even rebooting the server) doesn't change anything about
the race, and I don't want to restart the clients because they're
doing long-running compute work that I don't want to lose state on.

With IPv6 I can differentiate hosts behind NAT, for example.

# How

## 1. Download debug kernel package for the kernel you're running

Take the date from `uname -a` and add a week or so, and open the
Debian archive for that day. E.g.
[http://snapshot.debian.org/archive/debian/2017031500T000000Z/pool/main/l/linux/](http://snapshot.debian.org/archive/debian/2017031500T000000Z/pool/main/l/linux/).

Download the `-dbg` version of the kernel you're running. E.g.:

```
linux-image-3.16.0-4-amd64-dbg_3.16.39-1+deb8u2_amd64.deb  351181890       2017-03-10 03:37:13
```

## 2. Unpack the .deb

```
mkdir tmpkernel
cd tmpkernel
dpkg -x ../linux-image….deb .
cp ./usr/lib/debug/lib/modules/*/vmlinux .
```

## 3. Find the address of the skbuf

```
$ ss -e -t dst 10.0.64.123
State      Recv-Q Send-Q         Local Address:Port    Peer Address:Port
ESTAB      0      0             ::ffff:192.0.2.1:22    ::ffff:10.0.64.123:30201    uid:1003 ino:68386802 sk:ffff88000caa2800 <->
```

## 3. Start kernel debugger

```
sudo apt-get install crash
sudo crash -e emacs ./vmlinux
```

## 4. Print the sequence numbers

```
crash> struct tcp_sock.rcv_nxt,snd_una ffff88000caa2800
  rcv_nxt = 2691239595
  snd_una = 3825672049
```

## 5. Kill both sides of the connection

```
hping3 -s 22    -c 1 -M 3825672049 -L 2691239595 -F -A -p 30201    10.0.64.123
hping3 -s 30201 -c 1 -L 2691239595 -M 3825672049 -F -A -p 22    -a 10.0.64.123 192.0.2.1
```

## 6. Verify that connection is closed

```
netstat -napW | grep 10.0.64.123
```

If possible you may want to check the remote end too. But if it's the
client that will eventually send traffic then it'll be cleanly
disconnected at that point.
