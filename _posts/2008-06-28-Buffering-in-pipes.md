---
layout: post
title:  "Buffering in pipes"
date:   2008-06-28 00:00:00 +0000
categories: tty, unix, coding, ind
---
I'm trying to force a program not to buffer its output to stdout. Any program,
all programs. It can't involve changing the source code or depending on weird
or unportable stuff.

It should be possible. It seems like I'm missing something obvious, but I
can't figure out what.

  <blargh:body/>

## Some background info

I've written a program
([ind](http://www.habets.pp.se/synscan/programs.php?prog=ind)) that
puts itself between a subprocess that it creates and the terminal. It
acts as a filter for the output from the subprocess.

Like this example, where it prepends "stdout: " to all lines that the subprocess prints to standard output:
```shell
$ echo hej
hej
$ ./ind -p 'stdout: ' echo hej
stdout: hej
```

The dataflow is, from left to right:
```
echo (the subprocess) -> pipe(2) -> ind -> the terminal
```

(stderr runs through a separate pipe(2). Stdin has not been played with yet)


## So far so good

The problem is that the subprocess' libc (not the kernel) buffers all
output using stdio (i.e. all `FILE*` stuff, and that includes implicit
`FILE*` stuff like `printf(3)`).

Libc checks if the file descriptor backing stdout is a terminal
(`isatty(STDOUT_FILENO)=1` I assume), in which case it uses line
buffering (write completed lines as soon as the program writes a newline).

If it's not a terminal then the output is fully buffered. Libc won't
look for end-of-line characters. I'll show below why this is a
problem.

In the example above echo writes to stdout using stdio into a
non-terminal (specifically a `pipe(2)`). This makes it buffered, not
line-buffered or non-buffered.

For programs other than a simple echo this not only causes you not to
see the output immediately, but also destroys the *order* of
the lines output if anything is written to stdandard error! Stderr is
never fully buffered in this way, so the order from this program is
2,1,3 and not the expected 1,2,3:


```c
#include <stdio.h>
#include <unistd.h>
int
main()
{
        fprintf(stdout, "1 stdout\n");
        sleep(1);
        fprintf(stderr, "2 stderr\n");
        sleep(1);
        fprintf(stdout, "3 stdout\n");
        return 0;
}
```

Try it yourself. If run in the terminal you'll get the expected order
(1,2,3), while if you run it using `./test 2>&1 | cat` you get order
2,1,3. Stderr ("2") output gets thrown immediately into the pipe,
while stdout ("1" and "3") are buffered until the program ends (or the
buffer gets full).

If the program expects to be run in this way the fix is simple. Tell
libc not to buffer stdout:

```c
setvbuf(stdout, (char *)NULL, _IONBF, 0);
```

But this needs to be run from the subprocess, and in this case you
can't change the code in the subprocess.

I thought that there must be an ioctl() that can tell libc to just
never buffer stdio on this file descriptor ("never buffer", "pretend
this is a terminal"), but there doesn't seem to be. According to <a
href="http://www.developerweb.net/forum/showthread.php?t=2990">this</a>
the only way is to actually set up a pseudoterminal
(pty). Ugh. Suddenly this project got a bit yucky. Different Unixes
have different methods for setting up terminals, and so far the
program assumed very little and was very portable. It even worked on
IRIX.

Stderr can still be channeled through a normal pipe(2). Stderr is never
fully buffered according to C99 7.19.3. It can use a pty too, of
course, but it can't use the same pty as stdout uses because then I
can't differentiate them on the master end of the pty and do my
filtering magic.

It seems I have to do this awkward and less portable terminal
emulation, since according to that same 7.19.3, stdin and stdout are
always fully buffered by default if (and <em>only</em> if) the file descriptors
are non-terminals.

Gah.

The [program](http://github.com/ThomasHabets/ind):
```shell
git clone git://github.com/ThomasHabets/ind.git
```

## Update 2008-07-01
I have now implemented the pty version and released 0.11 (and beyond).
