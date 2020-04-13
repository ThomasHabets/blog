---
layout: post
title:  "Another way to protect your SSH keys"
date:   2014-06-17 00:00:00 +0000
categories: security, network, unix
---

Let's say you don't have a TPM chip, or you hate them, or for some
other reason don't want to [use it to protect your SSH keys][prev].
There's still hope! Here's a way to make it possible to **use** a key
without having access to it. Meaning if you get hacked the key can't
be stolen.

[prev]: /2013/11/TPM-chip-protecting-SSH-keys---properly.html

<blargh:body/>

No TPM, but key can't be stolen anyway? Surely this is an elaborate
ruse? Well yes, it is.  My idea is that you essentially bounce off of
a Raspberry Pi.

But doing that straightforward is too easy. I've instead made an SSH
proxy, and will show you how to automatically bounce off of it. You
could do the same by setting up a second SSH server (or the same one),
and hack around with PAM and a restricted shell. But this solution can
be run as any user, with just the binary and the set of keyfiles. Very
simple.

The goal here is to log in to `shell.foo.com` from your workstation
via a Raspberry Pi. The workstation SSH client presents its SSH client
key to the SSH Proxy on the Raspberry Pi, and if allowed will connect
on and present the SSH Proxy client key to `shell.foo.com`.

It doesn't have to be a Raspberry Pi, of course, but the idea here is
to have it be a dedicated machine that you never log in to otherwise,
and one nobody else has access to. A virtual machine will not do,
since the host system has access to virtual machines.

## 1. Get a Raspberry Pi

Get it up and running with SSH, and lock down every other port except,
say 2022. Details on this are out of scope for this blog post.


## 2. Install Go

An ARM version that runs on Raspberry Pi is now downloadable, so you no longer have to build it yourself.

```shell
raspberrypi# cd /usr/local
raspberrypi# wget https://storage.googleapis.com/golang/go1.7.1.linux-armv6l.tar.gz
raspberrypi# tar fxz go1.7.1.linux-armv6l.tar.gz
```

## 3. Get SSHProxy

```shell
raspberrypi$ cd $HOME
raspberrypi$ mkdir go
raspberrypi$ cd go
raspberrypi$ GOPATH=$(pwd) /usr/local/go/bin/go get github.com/ThomasHabets/sshproxy
raspberrypi$ ./bin/sshproxy -help
Usage of ./sshproxy:
  -auth="": Auth mode (key, kbi).
  -authorized_keys="": auth=key: Authorized keys for clients.
  -client_keyfile="": auth=key: SSH client key file.
  -conn_fd="": File descriptor to work with.
  -forwarded="": Forwarded for. Used by sslserver.
  -keyfile="": SSH server key file.
  -log_downstream=false: Log data from downstream (client).
  -log_upstream=false: Log data from upstream (server).
  -logdir="": Directory in which to create logs.
  -target="": SSH server to connect to.
```

## 4. Generate SSHProxy server key

```shell
$ ssh-keygen -N "" -f sshproxy -b 4096 -t rsa
```

## 5. Generate key SSHProxy will log in with

```shell
$ ssh-keygen -N "" -f sshproxy-client -b 4096 -t rsa
```

## 6. Generate SSL key for SSHProxy (e.g. self signed)

If someone breaks this key, or because it's self signed you are
MITMed, then you will only reveal which hostname/port you tried to
connect to.

```shell
$ openssl req -new -x509 -nodes -sha256 -days 4096 -verbose -subj /CN=sshproxy.foo.com/ -newkey rsa:4096 -keyout sshproxy-ssl.key -out sshproxy-ssl.crt
```

## 7. Add your normal workstation SSH key to a new file, "authorized_proxy_clients"

```shell
raspberrypi$ cat > authorized_proxy_clients
ssh-rsa AAAA[...]uoeu== foo@bar.com
^D
$
```

## 8. Start SSHProxy on the Raspberry Pi

```shell
raspberrypi$ mkdir sshlogdir
raspberrypi$ ./sslserver -key sshproxy-ssl.key -cert sshproxy-ssl.crt -listen :2023 \
        ./sshproxy \
        -auth key \
        -keyfile sshproxy \
        -authorized_keys authorized_proxy_clients \
        -client_keyfile sshproxy-client \
        -logdir sshlogdir
```

## 9. Install SSHProxy on your workstation too

You'll only be using its `sslclient`. See above for instructions.

## 10. Add Proxy config to your workstation `~/.ssh/config`

```
Host *.foo.com
    ProxyCommand /path/to/sslclient -proxy 127.0.0.1:2023 -target %h:%p
```

## 10. Make sure *only* the SSHProxy client key is in `authorized_keys` on shell.foo.com

## 11. SSH from workstation to shell.foo.com

```shell
workstation$ ssh shell.foo.com
shell$
```

## Links

* [github.com/ThomasHabets/sshproxy](https://github.com/ThomasHabets/sshproxy)
* [TPM chip protecting SSH keys - properly](/2013/11/TPM-chip-protecting-SSH-keys---properly)
