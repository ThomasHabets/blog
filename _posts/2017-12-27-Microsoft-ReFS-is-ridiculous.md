---
layout: post
title:  "Microsoft: ReFS is ridiculous"
date:   2017-12-27 00:00:00 +0000
categories: windows, storage, refs
---

I've blogged
[before](/2017/08/ReFS-integrity-is-not-on-by-default.html) about how
the new integrity-checking filesystem in Windows, ReFS, doesn't
actually have integrity checking turned on by default. It's pretty
silly that for a modern filesystem meant to compete with ZFS and
BtrFS, to have the main 21st century feature turned off by
default. But it's not quite ridiculous. Not yet.

Now it turns out that scrubbing is only supported on Windows
Server 2016. Microsoft honestly shipped an integrity-checking filesystem in
Windows 10 with no way to repair or scrub it.

I used to say that Windows 10 is the best Windows ever, and that
Microsoft kinda won my trust back. But what the hell?

I contacted Microsoft support over chat, who first suggested I do a
system restore (sigh). But after I insisted that they please confirm
that it's *supposed* to work confirmed that no that only ships with
Windows Server.

It's not even clear from their pricing if I need the $882 Standard
Edition or the $6,155 Datacenter Edition. Either one is way too much
for such a standard feature.

What the hell, Microsoft? All I want is a checksumming file
system. Either provide it, or don't. Don't give me a checksumming
filesystem that can't be repaired or verified.

It may even be worse. Rumors seem to be that Microsoft turned off this
feature in the 1709 release. How's that for a bait-and-switch?

It's cheaper to buy a whole new server just to run ZFS or BtrFS on it,
and use it from Windows, than it is to actually store files reliably
on the Windows machine itself. Absolutely ridiculous.

For the record, the way you would run a scrub, if you could, is:

```
Start-ScheduledTask -TaskPath "\Microsoft\Windows\Data Integrity Scan\" -TaskName "Data Integrity Scan"
```

Repair one file with:

```
Repair-FileIntegrity -FileName 'E:\somefile.png'
```

Or repair a whole tree with:

```
Get-ChildItem -Path 'E:\' -Recurse | Repair-FileIntegrity
```
