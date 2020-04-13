---
layout: post
title:  "Moving a process to another terminal"
date:   2009-03-21 00:00:00 +0000
categories: unix, coding, tty
---

I've always wanted to be able to move a process from one terminal to
another. For example if I've started a long-running foreground process
(such as irssi or scp) outside of a
[screen](http://www.gnu.org/software/screen/) and I have to log out my
local terminal. I looked around and there doesn't seem to be any way
to do this.

<blargh:body/>

There is a program called
[retty](http://pasky.or.cz/~pasky/dev/retty/) that I found later on
that sort of does this, but it only closes and re-opens stdin/out et
al. It doesn't seem to do full terminal handling. Nor does it seem to
detach the original terminal. It only allows you to peek into the
process, control it for a bit, and then hand it back. If you shut down
the original terminal you're still screwed.

### Attempt 1: pass the fd for the real pty

I thought I could `ptrace()` attach to the process, inject code to
`dup2()` onto stdin/out/err, and do some `ioctl()`s and that would be
that. No such luck as we shall see.

The easiest (and most portable way) to do it would be to `dlopen()` a
shared library that could then be written in C. But then I would have
to locate `dlopen()` inside the running process, if it even *had*
`dlopen()`. No, this would have to be done with syscalls directly.

This was fairly easy (albeit a bit awkward). Just:

1. attach with `ptrace()`
2. backup the current code and stack pages, as well as the registers
3. replace the content of the code and stack pages with code ("shellcode") and data to do my thing. (the code page can be assumed to be executable, and the stack page can be assumed to be read/writable)
4. reset EIP to the start of the code page.
5. resume the process, having it break at the end of my injected shellcode.
6. restore code and stack pages and registers.
7. detach from process.

The shellcode was passed a file descriptor via a unix socket and
`dup2()`ed it over stdin/out/err. I then tried to get it to change its
controlling terminal. And here's where the problems started.

It looks like it's impossible to change the current controlling terminal
(CTTY) to one that already has processes using that terminal as a CTTY (at least
as non-root without changes to the kernel). I therefore have to detach
from the terminal with my injector program. I also have to make sure that no
other process is using it (e.g. bash).

But as soon as a terminal has no processes using it as a CTTY the
master part of the terminal (e.g. xterm, getty, ...) will destroy it on
its end. I tested this by running a simple program:

```c
/** just-detach.c
 * By Thomas Habets <thomas@habets.se>
 * 2009-01-22
 */
#include <stdio.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>
#include <fcntl.h>
#include <termios.h>
#include <sys/types.h>
#include <sys/ioctl.h>
#include <sys/stat.h>

int
main(int argc, char **argv)
{
        int n;

        /* detach */
        n = ioctl(0, TIOCNOTTY, NULL);
        printf("ioctl(0, TIOCNOTTY, NULL) => %d %s\n",n,n?strerror(errno):"");

        printf("You will not see this message if running "
               "\"exec %s\" in an xterm.\n", argv[0]);

        /* attach */
        n = ioctl(0, TIOCSCTTY, 1);
        printf("ioctl(0, TIOCSCTTY, 1) => %d %s\n",n,n?strerror(errno):"");

        sleep(10);
        return 0;
}
```

Output:
```shell
$ ./just-detach
ioctl(0, TIOCNOTTY, NULL) => 0
You will not see this message if running "exec ./just-detach" in an xterm
ioctl(0, TIOCSCTTY, 1) => -1 Operation not permitted
```

So we can't just detach the terminal and then allow it to be taken and
used as a CTTY by the target process. Nor will we ever be able to
put the terminal back the way it was (retty never detaches the process
from the original tty, and therefore doesn't have this problem).

### Attempt 2: Create a new pty pair and be a pty-proxy

Ok. So I have to create a pty pair and handle the master part
of the targets new terminal. No problem, I've created a pty filter
before.

### ...Problem

To set a new CTTY you need a few things just right:

1. You must be a session leader. Can be fixed by calling `setsid()`.
2. NOT have a CTTY already. Just do `ioctl(fd, TIOCNOTTY)` to detach from your old CTTY.
3. The TTY must not already be CTTY for any other process (unless you
   are root/have `CAP_SYS_ADMIN` under Linux). No problem there, the pty
   was just created for this purpose.

But to run `setsid(2)` you must NOT be a process group leader. And you are:

```shell
$ ps -opid,pgid,sid,comm | grep irssi
 7940  7940  7938 irssi
```

To not be the process group leader you have to set it to something
else using `setpgid()`. The pid you set it to must be in the same
session as you.

To run `setpgid(2)` you need to be in the same session as the target.

  So we must:

1. find a process in the same session as the target who is willing to
   make itself process group leader with `setpgid(0,0)`...
2. so that we can `setpgid()` to it with `setpgid(0, pid)`...
3. so that we can run `setsid()` to become session leader...
4. so that we can set a new controlling terminal.

If you want to change terminal on your own stuff you can just do
a shortcut with `fork()`, run your stuff in the child and let the
parent die, but since we don't know what crazy stuff the target
may be up to we don't want to change the pid of the process.

So we fork off a child that will be the process group leader.

```python
if fork() == 0:
  setpgid(0,0)
    sleep(infinite)
    setpgid(0, child)
    setsid()
    kill(child, 9)
    waitpid(child)
```

It works. At least on single-process programs. Tested on irssi and
small test programs.

### Finishing touches

* Send SIGSTOP, SIGCONT to put the process in the background of bash job control. The user should then type "disown".
* Other payloads:
  * Inject "Hello world" write() to stdout.
  * close() fd
  * open() and overwrite existing fd

### The working program

Is [here](http://github.com/ThomasHabets/injcode).

```shell
git clone git://github.com/ThomasHabets/injcode.git
```

Screenshot:
[![foo](http://www.habets.pp.se/synscan/images/injcode_small.png)](http://www.habets.pp.se/synscan/images.php?img=injcode)


### References

* [The TTY demystified](http://www.linusakesson.net/programming/tty/index.php)

### Feedback

It didn't take long after putting the project on
[freshmeat](http://freshmeat.net) before I got an email from one of
the developers of [neercs](http://caca.zoy.org/wiki/neercs). It seems
they've done something like this too, and perfected it a bit.  They
don't inject shellcode, but instead hijack an existing syscall
instruction in the target program and re-use it to make the target do
anything they want.  This is cleaner and makes for easier
porting. They use the same trick to change the CTTY that injcode does.
