---
layout: post
title:  "Plug computer for always-on VPN"
date:   2013-02-08 00:00:00 +0000
categories: security, network, unix
---
Last time I was at a hacker conference I for obvious reasons didn't
want to connect to the local network.  It's not just a matter of
setting up some simple firewall rules, since the people around you are
people who have and are inventing new and unusual attacks. Examples of
this would be rogue IPv6 RA and NDs, and people who have actually
generated their own signed root CAs. There's also the risk (or
certainty) of having all your unencrypted traffic sniffed and altered.

For next time I've prepared a
[SheevaPlug](http://en.wikipedia.org/wiki/SheevaPlug) computer I had
laying around. I updated it to a modern Debian installation, added a
USB network card, and set it up to provide always-on VPN. This could
also be done using a raspberry pi, but I don't have one.

<blargh:body/>

Always-on VPN is where you have NO network access unless your VPN is
up, and then ALL traffic goes through the VPN. By setting up a plug
computer as a VPN client you can just plug in an unprotected computer
to the "inside" and you'll be protected against the attackers on your
local network.

Here are my notes on setting this up. Some of it may not be useful to
other people, but it was enough of a hassle looking this up the first
time that I want to note it down in case I have to do it again.

**WARNING:** You may brick your device if you have a different device
and/or don't know what you're doing.

### 1. Upgrade Uboot

Download
[u-boot.kwb](http://people.debian.org/~tbm/u-boot/2011.12-3/sheevaplug/u-boot.kwb)
to your tftp server.

```
Marvell>> version
U-Boot 1.1.4 (Mar 19 2009 - 16:06:59) Marvell version: 3.4.16
Marvell>> print ethaddr       # Write this down
ethaddr=00:11:22:33:44:55

setenv serverip 192.168.1.10 # IP of your TFTP server
setenv ipaddr 192.168.1.20
tftpboot 0x0800000 u-boot.kwb
nand erase 0x0 0x60000
nand write 0x0800000 0x0 0x60000
reset
setenv ethaddr 00:11:22:33:44:55
saveenv
reset
```


### 2. Install Debian

Download the [Debian installer
uImage](ftp://ftp.debian.org/debian/dists/stable/main/installer-armel/current/images/kirkwood/netboot/marvell/sheevaplug/uImage)
and
[uInitrd](ftp://ftp.debian.org/debian/dists/stable/main/installer-armel/current/images/kirkwood/netboot/marvell/sheevaplug/uInitrd)
to the tftp server.

```
setenv ipaddr 192.168.1.20
setenv serverip 192.168.1.10
tftpboot 0x00800000 uImage
tftpboot 0x01100000 uInitrd
setenv bootargs console=ttyS0,115200n8 base-installer/initramfs-tools/driver-policy=most
bootm 0x00800000 0x01100000
```

Then install normally.

### 3. Set up boot to load kernel and initrd from SD card

```
setenv bootargs_console console=ttyS0,115200
setenv bootcmd_mmc 'mmc init; ext2load mmc 0:1 0x00800000 /uImage; ext2load mmc 0:1 0x01100000 /uInitrd'
setenv bootcmd 'setenv bootargs $(bootargs_console); run bootcmd_mmc; bootm 0x00800000 0x01100000'
saveenv
run bootcmd
```

### 4. Install some stuff

```
mv /etc/motd{,.dist}
apt-get install openssh-server screen mg openvpn git python-webpy sudo tcpdump tshark uptimed ntp ntpdate isc-dhcp-server arping pv gcc make kernel-package
```

### 5. Setup useful environment

```
alias emacs=mg
alias tl='sudo iptables -n -v --line -L'
alias ls='ls --color'
# set up .screenrc
# visudo: thomas  ALL=NOPASSWD: ALL
```

### 6. Set up network interfaces

`/etc/network/interfaces`:

```
iface eth0 inet static
    address 10.1.2.1
    netmask 255.255.255.0
iface eth1 inet dhcp
    pre-up /.../bin/start
iface eth2 inet dhcp
    pre-up /.../bin/start
iface eth3 inet dhcp
    pre-up /.../bin/start
```

(many interfaces since they may be swapped around, and the names are persistent by default)

### 7. Install OpenSSH user CA (optional)
`/etc/ssh/sshd_config`:

```
TrustedUserCAKeys /etc/ssh/user_ca.pub
```

```
cat > /etc/ssh/user_ca.pub
[...]
```

### 8. Install dnetc

Just for fun.

[Download dnetc](http://http.distributed.net/pub/dcti/current-client/dnetc-linux-arm-eabi.tar.gz).

### 9. Set up remote OpenVPN server

Out of scope for this blog post.

### 10. Set up DHCP server

`/etc/dhcp/dhcpd.conf`:

```
ddns-update-style none;
option domain-name-servers 8.8.8.8, 8.8.4.4;
default-lease-time 600;
max-lease-time 7200;
authoritative;
log-facility local7;
subnet 10.1.2.0 netmask 255.255.255.0 {
        range 10.1.2.11 10.1.2.250;
        option broadcast-address 10.1.2.255;
        option routers 10.1.2.1;
}
```


### 11. Install firewalling scripts<

```
git clone git://github.com/ThomasHabets/profy.git
```

### 12. Set up OpenVPN

Create `ovpn.conf` config in `cfg/` using `ovpn.conf.template` as a
template.  Symlink `/etc/openvpn/ovpn.conf` to that file.

### 13. Set `noatime` on all filesystems in `/etc/fstab`

### 14. Set up kernel build environment

USB network drivers sucked in default kernel. I only got 2Mbps for the
ones that even had drivers. 65% of CPU was interrupt handling, OpenVPN
only about 5%.

```
cd /usr/bin
for i in ld objdump ar nm strip objcopy size; do
  ln -s {,arm-linux-gnueabi-}$i
done
```

### 15. Build and install new kernel

```
cp /boot/config* .config
make menuconfig
time fakeroot make-kpkg kernel_image
dpkg -i ../kernel*.deb
mkinitramfs -o /boot/initrd.img-3.7.6 3.7.6
cd /boot
mkimage -A ARM -O Linux -T Kernel -C none -a 0x00008000 -e 0x00008000 -n 3.7.6 -d vmlinuz-3.7.6  uImage-3.7.6
mkimage -A ARM -O Linux -T RAMDisk -C gzip -a 0x00000000 -e 0x00000000 -n 3.7.6 -d initrd.img-3.7.6  uInitrd-3.7.6
```

### 16. Test the new kernel

Copy new kernel to tftp server.

```
setenv ipaddr 192.168.1.20
setenv serverip 192.168.1.10
tftpboot 0x00800000 uImage-3.7.6
tftpboot 0x01100000 uInitrd-3.7.6
bootm 0x00800000 0x01100000
```

### 17. If working, default to new kernel

```
cd /boot
mv uImage{,.dist}
mv uInitrd{,.dist}
ln -s uImage-3.7.6 uImage
ln -s uInitrd-3.7.6 uInitrd
```


### 18. Profit

I get about 14Mbps, with less than 50% CPU assigned to OpenVPN, and the rest
curiously "idle".  Keep in mind that the SheevaPlug is about 4 years
old at this point.

## Photo
![plug VPN](https://blog.habets.se/static/2013-02-09_plug_vpn.jpg)

## Links
* [Install Debian on SheevaPlug](http://www.cyrius.com/debian/kirkwood/sheevaplug/install.html)
