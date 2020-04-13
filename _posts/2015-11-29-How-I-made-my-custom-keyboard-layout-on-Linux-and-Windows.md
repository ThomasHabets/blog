---
layout: post
title:  "How I made my custom keyboard layout on Linux and Windows"
date:   2015-11-29 00:00:00 +0000
categories: unix, keyboards
---
This post explains how to set up a keyboard layout the way I like it.
It may not fit you at all, but it may give you ideas that would work
for you.

In short: I remap Caps Lock to add some extra keys.

<blargh:body/>

First a description of what my preferred keyboard layout is: I type
[Dvorak][dvorak], but also want to occasionally use Swedish
letters. There are a couple of Dvorak versions for Swedish, but since
most of my typing is in English or programming I think they compromise
too much on the accessibility of other keys to add these three Swedish
characters.

[dvorak]: https://en.wikipedia.org/wiki/Dvorak_Simplified_Keyboard
![Picture of my keyboard](https://blog.habets.se/static/2015-03-keyboard.jpg)

So for a decade or so I've been remapping Caps Lock to AltGr and
holding down AltGr to add new keys. Typing "ö" quickly became fluent
and easy, since it involves holding down one key with my left hand and
pressing a key with another.

I used this method even before I switched to Dvorak, because if you've
ever coded on a Swedish keyboard you should know how terrible it is. I
know several Swedish programmers who use US keyboard layout all the
time because of this, and simply live without being able to type
proper Swedish.

## GRUB 2.x

```shell
ckbcomp dvorak | sudo grub-mklayout -o /boot/grub/dvorak.gkb
echo -e 'insmod keylayouts\nkeymap /boot/grub/dvorak.gkb' | sudo tee -a /etc/grub.d/40_custom
echo GRUB_TERMINAL_INPUT=at_keyboard | sudo tee -a /etc/default/grub
sudo update-grub
```

Not working at the moment due to [a bug in
GRUB](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=741464).

## Linux console

Enable Dvorak using:

```shell
$ sudo apt-get install console-data
$ sudo dpkg-reconfigure keyboard-configuration
```

No further customization made, since I spend so little time in pure
terminals.

## Linux graphics

`setxkbmap dvorak` and then I run `xmodmap` on [this
file](https://github.com/ThomasHabets/dotfiles/blob/master/.xmodmap-dvorak). Done.

## Windows

You don't need to be admin to do this. Well, maybe to turn caps lock
into AltGr, I forget.

[winrak]: https://blog.habets.se/static/hdvorak.rar
[winrak2]: https://blog.habets.se/static/hdvorak.exe

1. Make custom keyboard map (or [download mine][winrak] or as
   [self-extracting archive][winrak2].
    1. Google “microsoft keyboard layout creator”
    2. Install it
    3. File -> Load Existing Keyboard
    4. United States-Dvorak
    5. Check the Alt+Ctrl (AltGr) checkbox on the left.
    6. Add special keys. Don’t forget the capital letters by also checking the Shift checkbox.
    7. File -> Save Source File
        * Say yes to setting metadata
        * Enter suitable metadata
    8. Project -> Build DLL and Setup package.
2. Install custom keymap
    1. Double-click on the generated Setup binary. Keyboard layout is now installed.
    2. Windows Start menu
    3. Settings
    4. Region & language
    5. Under “Languages”, click on “English (United States)”
    6. Options
    7. Remove the one that’s not your custom one.
3. Remap Caps Lock to Right Alt (AltGr)
    1. Run `regedit`
    2. Navigate to `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layout`
    3. Right click to create a new Binary Value named `Scancode Map`
    4. Enter value: `00 00 00 00 00 00 00 00 02 00 00 00 38 E0 3A 00 00 00 00 00`
       * `00 00 00 00 00 00 00 00`: Padding
       * `02 00 00 00`: Length
       * `38 E0`: Key to map to (Right Alt)
       * `3A 00` Key to map from (Caps Lock)
       * `00 00 00 00`: More padding
    5. Log out and in again.

## ChromeOS

No solution yet. Use normal Dvorak. :-(

## Android

No solution yet. Use normal Dvorak. :-(

## USB keyboard on any machine

To get Dvorak I use a [QIDO](http://www.keyghost.com/qido/) adapter.

Or a [WASD Keyboards](https://www.wasdkeyboards.com/) keyboard. They
have a switch to allow you to use Dvorak anywhere.
