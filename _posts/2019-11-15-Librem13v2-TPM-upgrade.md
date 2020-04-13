---
layout: post
title:  "Librem13v2 TPM upgrade"
date:   2019-11-15 00:00:00 +0000
categories: security, tpm
---

I have upgraded my TPM firmware on my Librem13v2. Its keys are now
safe. \o/

Back in 2017 we had [the Infineon disaster (aka ROCA)][roca]. I've
written about it before about [how bad it is][magnitude] and [how to
check if you're affected with a simple tool][check].

**I TAKE NO RESPONSIBILITY IF YOU BRICK YOUR DEVICE OR FOR ANYTHING
ELSE BAD HAPPENING FROM YOU FOLLOWING MY NOTES.**

## Before the upgrade

```shell
$ tpm_version | grep Chip
Chip Version:        1.2.4.40    # <--- Example vulnerable version
$ cbmem -c | grep Purism         # I upgraded coreboot/SeaBIOS just before doing this.
coreboot-4.9-10-g123a4c6101-4.9-Purism-2 Wed Nov 13 19:54:43 UTC 2019 […]
[…]
Found mainboard Purism Librem 13 v2
```

### Download upgrade tool

```shell
$ wget https://repo.pureos.net/pureos/pool/main/t/tpmfactoryupd/tpmfactoryupd_1.1.2459.0-0pureos9_amd64.deb
[…]
$ alien -t tpmfactoryupd_1.1.2459.0-0pureos9_amd64.deb
[…]
$ tar xfz tpmfactoryupd-1.1.2459.0.tgz
$ mv usr/bin/TPMFactoryUpd .
$ sudo systemctl stop trousers.service         # Need to turn off tcsd for TPMFactoryUpd to work in its default mode.
[…]
$ ./TPMFactorUpd -info
  **********************************************************************
  *    Infineon Technologies AG   TPMFactoryUpd   Ver 01.01.2459.00    *
  **********************************************************************

       TPM information:
       ----------------
       Firmware valid                    :    Yes
       TPM family                        :    1.2
       TPM firmware version              :    4.40.119.0
       TPM enabled                       :    Yes
       TPM activated                     :    Yes
       TPM owner set                     :    Yes
       TPM deferred physical presence    :    No (Not settable)
       Remaining updates                 :    64
```

Note the status of the TPM: enabled, active, owner set, and not
"physical presence". This is not the state we want to be in for our
upgrade.

### Get TPM into state ready to upgrade.

The TPM must be enabled and active. If it's not then you need to get
into your BIOS to fix that. You may need to enter from a clean power
off. A "reboot" may not be enough.

There are two TPM chip states where an upgrade will work:

1. Deferred physical presence is set to "yes". You may be able to get
   into this state on some machines by using `tpm_clear`, and then
   rebooting. Your BIOS will then ask you "do you confirm TPM physical
   presence?". I believe one of my other machines did this, but it's
   been too long for me to be sure. This uses the `-update tpm-PP`
   option with the updater. It looks like this is not possible with
   the Librem13v2, so I won't talk about this option any further.
2. The "Owner" must be cleared, and `-update tpm-takeownership` is
   used with the updater.

#### Clearing the TPM

If any of the steps fail, just continue. As long as you get to the
state shown, as per `TPMFactoryUpd -info` it should work fine.

1. `tpm_clear`
2. Reboot
3. When the Purism screen shows, press ESC
4. Press `t` to enter the TPM menu
5. Choose `c` to clear the TPM
6. Choose `e` to enable the TPM
7. Choose `a` to activate the TPM. The machine automatically reboots
8. At the grub menu, press `e` on your normal boot option
9. Go to the end of the kernel line and add `iomem=relaxed` at the end
10. Press F10 to boot
11. Confirm TPM state is enabled, activated, owner NOT set:

    ```
$ ./TPMFactoryUpd -info
  **********************************************************************
  *    Infineon Technologies AG   TPMFactoryUpd   Ver 01.01.2459.00    *
  **********************************************************************

       TPM information:
       ----------------
       Firmware valid                    :    Yes
       TPM family                        :    1.2
       TPM firmware version              :    4.40.119.0
       TPM enabled                       :    Yes                 <--- correct
       TPM activated                     :    Yes                 <--- correct
       TPM owner set                     :    No                  <--- correct
       TPM deferred physical presence    :    No (Not settable)
       Remaining updates                 :    64
```

## Upgrade

1. Download and unzip [the firmware][firmware].
2. Upgrade the TPM

   ```
$ sudo ./TPMFactoryUpd -update tpm12-takeownership -firmware TPM12_4.40.119.0_to_TPM12_4.43.257.0.BIN 
  **********************************************************************
  *    Infineon Technologies AG   TPMFactoryUpd   Ver 01.01.2459.00    *
  **********************************************************************

       TPM update information:
       -----------------------
       Firmware valid                    :    Yes
       TPM family                        :    1.2
       TPM enabled                       :    Yes
       TPM activated                     :    Yes
       TPM owner set                     :    No
       TPM deferred physical presence    :    No (Not settable)
       TPM firmware version              :    4.40.119.0
       Remaining updates                 :    64
       New firmware valid for TPM        :    Yes
       TPM family after update           :    1.2
       TPM firmware version after update :    4.43.257.0

       Preparation steps:
       TPM1.2 Ownership preparation was successful.

    DO NOT TURN OFF OR SHUT DOWN THE SYSTEM DURING THE UPDATE PROCESS!

       Updating the TPM firmware ...
       Completion: 100 %
       TPM Firmware Update completed successfully.
```
3. Confirm upgrade

   ```
$ ./TPMFactorUpd -info
  **********************************************************************
  *    Infineon Technologies AG   TPMFactoryUpd   Ver 01.01.2459.00    *
  **********************************************************************

       TPM information:
       ----------------
       Firmware valid                    :    Yes
       TPM family                        :    1.2
       TPM firmware version              :    4.43.257.0        <--- new version
       TPM enabled                       :    Yes
       TPM activated                     :    No
       TPM owner set                     :    Yes
       TPM deferred physical presence    :    No (Settable)     <--- huh? ok
       Remaining updates                 :    63
$ tpm_version | grep Chip
  Chip Version:        1.2.4.43
```
4. Reboot
5. Press ESC, t to enter TPM menu again
6. Enable & active the TPM, reboot.
7. `tpm_takeownership -z`

## Confirming generated keys are good

Using my tool mentioned [here][check].

```
$ ./check-srk
Running self test…
Size: 2048
Modulus:
2357823904823904723[…]4782347892347238913
--------------
The key is fine.
```

## Links

For more troubleshooting, see [this][troubleshooting].

## Thanks

Huge thanks to MrChromebox on #purism for the help.

[roca]: https://en.wikipedia.org/wiki/ROCA_vulnerability
[magnitude]: https://blog.habets.se/2017/10/WPA2-And-Infineon.html
[check]: https://blog.habets.se/2017/10/Is-my-TPM-affected-by-the-Infineon-disaster.html
[firmware]: https://blog.habets.se/static/TPM12_4.40.119.0_to_TPM12_4.43.257.0.BIN.gz
[troubleshooting]: https://github.com/ThomasHabets/simple-tpm-pk11/blob/master/TPM-TROUBLESHOOTING
