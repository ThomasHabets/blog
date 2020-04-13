---
layout: post
title:  "ReFS integrity is not on by default"
date:   2017-08-30 00:00:00 +0000
categories: windows, storage, refs
---

I really don't like the trend of filesystem authors to only care about
filesystem integrity by default. How about having seat belt for your
data integrity *by default* and let people turn it off if they want to
compromise correctness for performance?

What I didn't know is that ReFS integrity is not on by default. Only
metadata integrity.

It's also not visible or changeable in the UI (which is why I assumed
they'd done the right thing), which is strange to me, this being
Windows. No, you have to drop down into Microsoft's crappy CLI.

# How to check if it's turned on.

## Check files in one directory

```
PS E:\> Get-Item '*' | Get-FileIntegrity

FileName                       Enabled Enforced
--------                       ------- --------
E:\SomeDirectory               False   True
E:\SomeOtherDirectory          False   True
E:\SomeFile.txt                False   True
[...]
```

Fuck you, Microsoft.

## Check recursively

Of course `Get-Item` doesn't do recursion. Why would it? That would
make sense.

```
PS E:\> Get-ChildItem -Recurse 'E:\SomeDirectory' | Get-FileIntegrity

FileName                       Enabled Enforced
--------                       ------- --------
E:\SomeDirectory\foo.txt       False   True
[...]
```

# How to enable it

**Both commands are needed.** The first command sets the new default
for the root directory, and the second adds checksums to all existing
files and directories.

```
PS E:\> Get-Item 'E:\' | Set-FileIntegrity -Enable $True
PS E:\> Get-ChildItem -Recurse 'E:\' | Set-FileIntegrity -Enable $True
```

This will show a lame ASCII progress bar while it's doing it. I say
lame because this is 2017 and Microsoft managed to create PowerShell
without 1970's technology like SIGWINCH or equivalent for actually
detecting a window resize. Not just "after the command was started",
mind you, but also if the window changed size before starting the
command.

Oh, and run this as Administrator, because Microsoft will not only
need that for some files, it'll actually spit out error messages that
do not contain the filename in question.

This is Microsoft's "new and awesome" CLI, and it doesn't do what
CLI's have done since the 70's.

Also this can't set integrity checking on files marked read-only. Why?
Because Microsoft hates you, your data, and your cat.

# So how do I trigger a scrub, a check of all checksums?

Ha ha ha, you can't. Because Microsoft is retarded. They're going with
the bullshit "Oh you don't need to!", completely ignoring that what I
want to find out is if my physical disks are failing, or have
corrupted data.

I guess I could `tar` up the whole filesystem and send the output to
the bitbucket. But oh wait... `tar` is not included in Windows so I
need third party tools.
