---
layout: post
title:  "Windows SSH client with TPM"
date:   2016-10-17 00:00:00 +0000
categories: tpm, security, hsm, windows
---

I managed to get an SSH client working using an SSH pubkey protected by a TPM.

## Optional: Take ownership of the TPM chip

   This is not needed, since TPM operations only need well known SRK PIN,
   not owner PIN, to do useful stuff. I only document it here in case
   you want to do it. Microsoft recommends against it.

   1. Set `OSManagedAuthLevel` to 4
      `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\TPM\OSManagedAuthLevel` 2 -> 4

      Reboot.

   2. Clear TPM

      Run `tpm.msc` and choose "Clear TPM". The machine will reboot
      and ask you to press F12 or something for physical proof of
      presence to clear it.

   3. Set owner password from within `tpm.msc`

## Set up TPM for SSH

1. Create key

   ```
   tpmvscmgr.exe create /name "myhostnamehere VSC" /pin prompt /adminkey random /generate
   ```
   PIN must be at least 8 characters.

2. Create CSR

   Create a new text file `req.inf`:

   ````
   [NewRequest]
   Subject = "CN=myhostnamehere"
   Keylength = 2048
   Exportable = FALSE
   UserProtected = TRUE
   MachineKeySet = FALSE
   ProviderName = "Microsoft Base Smart Card Crypto Provider"
   ProviderType = 1
   RequestType = PKCS10
   KeyUsage = 0x80
   ```

   ```
   certreq -new -f req.inf myhostname.csr
   ```

   If you get any errors, just reboot and try again with the command that failed.

3. Get the CSR signed by any CA at all

   We just need it to be a certificate so that Windows will install it.

   This should work (on a Linux system) by creating a dummy CA and
   using it to sign:

   ```
   yes '' | openssl req -x509 -newkey rsa:2048 -keyout ca.pem -nodes -out ca.pem -days 3650;echo
   openssl x509 -req -days 3650 -in myhostname.csr -out myhostname.crt -CA ca.pem -CAkey ca.pem -CAcreateserial
   ```

4. Double-click on the resulting `.crt` file

   Click the "Install Certificate..." button and go through the motions.

5. Extract the public key in SSH format.

   ```
   $ openssl req -in myhostname.csr  -pubkey -noout > pub.txt
   $ ssh-keygen -i -m PKCS8 -f pub.txt
   ssh-rsa AAAAB3Nzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   This should give you the public key in SSH format. Just put that in
   `~/.ssh/authorized_keys`, and probably add something descriptive at the end.


6. Log in with PuttyWinCrypt

   You can't use normal Putty because
   [PuttyWinCrypt](https://sourceforge.net/projects/puttywincrypt/)
   includes required support for smart card and Windows crypto.

   Under "Connection > SSH > Auth" you need to set "Private key file
   for authentication" to `cert://*`.


## Links

* [Microsoft: Change the TPM owner
  password](https://technet.microsoft.com/en-us/itpro/windows/keep-secure/change-the-tpm-owner-password). They
  recommend you don't.
* [Code to convert PEM pub ->
  SSH](https://www.idrix.fr/Root/Samples/pubkey2ssh.c). Alternative
  method.
* [Online tool to convert PEM pub ->
  SSH](http://www.zensolutions.co.nz/dev/ssh). Another alternative
  method.
* [TPM authentication in OpenVPN and PuTTY
  SSH](http://qistoph.blogspot.co.uk/2015/12/tpm-authentication-in-openvpn-and-putty.html)