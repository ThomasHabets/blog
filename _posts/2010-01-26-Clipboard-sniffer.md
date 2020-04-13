---
layout: post
title:  "Clipboard sniffer"
date:   2010-01-26 00:00:00 +0000
categories: security, coding, unix
---
Yes clipboard, not keyboard. I've made a clipboard sniffer for X
called [ClipSniff](http://github.com/ThomasHabets/clipsniff).

It periodically saves whatever is in the clipboard (both the "PRIMARY"
and the "CLIPBOARD") into a sqlite database.

`git clone http://github.com/ThomasHabets/clipsniff.git`

It wasn't that hard when you knew where to look. You just:

1. Connect to the X server. `XOpenDisplay()`
2. Create a window (you don't need to display it). `XCreateSimpleWindow()`
3. Ask the X server who owns the PRIMARY and CLIPBOARD atoms, and ask
   that window to send you the data. `XInternAtom()`,
   `XConvertSelection()`
4. Wait for the reply event. Loop of `NextEvent()`

### Helpful links when coding Xlib

* [Minimal XGetWindowProperty Example](http://www.gelato.unsw.edu.au/IA64wiki/XGetWindowProperty)
* [Xlib Programming Manual (O'Reilly & Associates, Inc.)](http://www.sbin.org/doc/Xlib/)
* [X Selections, Cut Buffers, and Kill Rings (jwz)](http://www.jwz.org/doc/x-cut-and-paste.html)
* [X Windows Copy-Paste mini HOWTO (Stelios Xathakis)](http://michael.toren.net/mirrors/doc/X-copy+paste.txt)
