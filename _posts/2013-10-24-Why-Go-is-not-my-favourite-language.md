---
layout: post
title:  "Why Go is not my favourite language"
date:   2013-10-24 00:00:00 +0000
categories: coding
---
### 1. Go has exceptions *and* return values for error

Yes it does. Yes, it really really does.<blargh:body/> We can discuss
this for hours but in the end it boils down to four points:

* In Go some errors cause stack unrolling, with the possibility to for
  each step in the call stack register code that runs before the stack
  is unrolled further, or for the unrolling to stop. In programming
  languages, that's called "exceptions".  Idiomatic use in a language
  of the feature doesn't affect what the feature **is**.  Saying that
  Go doesn't have exceptions is like saying Go doesn't have NULL
  pointers (it has `nil` pointers).

* There is no non-tautology definition of exceptions that includes the
  ones in Python, C++ and Java, but does not include `panic/recover`
  in Go. Go on, try to language lawyer your way into a definition.  In
  spoken/written languages we have words, and those words have
  meaning. And the word for this meaning is "exceptions".

* The programmer must write exception-safe code, or it will be broken
  code.

* `encoding/json` uses `panic/recover` as exceptions internally. Thus
  proving that they are exceptions, and they're usable (arguably
  useful) as such.

These four points feel like four stages of grief. Denial ("error codes
only!"), bargaining ("What if we redefine the word 'exception?`")  and
eventually acceptance ("sigh, ok... what does this mean for my
code?").

`defer` isn't just a good idea. It's the law. If you want to do something while holding a lock
then you *have* to lock, `defer` unlock, and then do whatever it is that needs to be done.
      Here's an incomplete list of things that can cause stack unroll, thus requiring cleanup to be done
      in `defer`:

* Array or slice lookups
* Acquiring a lock
* Expected system files (like /dev/random) missing
* Bugs in your code
* Bugs in library code
* Operating on channels

This code is not safe! It can leave your program in a bad state.
```go
mutex.Lock()
fmt.Println(foo[0])
mutex.Unlock()
```

#### Fine, it has exceptions and you have to write exception-safe code. So what?

Do you know anybody who thinks mixing exceptions and error return
values is a good idea? The reason Go gets away with it is that Go
programmers stick fingers in their ears and scream "la la la, Go
doesn't have exceptions" and thus avoid defending that choice.

#### Fine, but I don't ever use `recover`, so `panic()` becomes a graceful assert fail

You may not `recover`, but your framework might. In fact, the standard
Go library HTTP handler parent will catch... I'm sorry, "recover" a
panic and prevent your program from crashing gracefully. All code in
your HTTP handlers, and any library (yours or third party) now has to
be exception safe. Idiomatic Go must be exception safe. It's not like
idiomatic Erlang where you can assume your process *will*
actually die (One can write bad code in any language, I'm specifically
referring to idiomatic code here).

### 2. No way to run things at end of scope

This code is bad:

```go
mutex.Lock()
defer mutex.Unlock()
doSomethingRandom()
for _, foo := range foos {
  file, err := os.Open(foo)
  if err != nil {
    log.Fatal(err)
  }
  defer file.Close()
  doSomething(file)
}
```

(and my GOD is it verbose)

The reason is that no file is closed until the function returns. Now,
how pretty is this code that fixes it?

```go
func() {
  mutex.Lock()
  defer mutex.Unlock()
  doSomethingRandom()
}()
for _, foo := range foos {
  func() {
    file, err := os.Open(foo)
    if err != nil {
      log.Fatal(err)
    }
    defer file.Close()
    doSomething(file)
  }()
}
```

C++ runs destructors at end of scope, enabling the lovely
`std::lock_guard`. Python has the `with` statement, and Java (the
weakest in the bunch in this one aspect, aside from Go) has `finally`.

The `defer` is needless typing. What do I want to do when
my file object is unreachable? Close the file, obviously!  Why do I
have to tell Go that? My intent is obvious. C++ and CPython will do it
automatically. It's so obvious that `File` objects actually
have a finalizer that closes the file, but you don't know when or if
that is called.

### 3. `if ... := ...; ...cond... {` is crippled

C syntax for assigning and checking for error in one line doesn't
really work with multiple return values (well, it does, but it would
use the comma operator. Not optimal). So when Go supplied this
return-and-check syntax it seemed pretty nice. Until it collided with
scoping rules. If the function returns more than one value then you
either have to manually "var" all values and use "=", or do all work
in an else handler.

#### Bad code

```go
foo := 0
if len(*someFlag) < 0 {
  if foo, err := doSomething(*someFlag); err != nil {
    log.Fatalf("so that failed: %v", err)
  } else {
    log.Printf("it succeeded: %d", foo)
  }
}
```

### Code code

```go
foo := 0
if len(*someFlag) < 0 {
  // Can't use := because then it'd create a new foo,
  // so need to define err manually. Oh, the verbosity!
  var err error
  if foo, err = doSomething(*someFlag); err != nil {
    log.Fatalf("so that failed: %v", err)
  } else {
    log.Printf("it succeeded: %d", foo)
  }
}
```

### 4. Pointers satisfy interfaces

So for any "handle" you get back from a function you now have to check
if `FooBar` is a struct or an interface.  `func NewFooBar() FooBar
{...}`. Should I pass `FooBar`s around, or pointers to FooBars? I
don't know that unless I look in a second place to see if `FooBar` is
a struct or an interface.

### 5. Why do maps and channels need "`make()`", when all others types have valid `nil` values?

I don't mean "why?" on a technical level. I know why `nil` slices are
valid and `nil` maps aren't.  But people give C++ grief all the time
because of "B follows from A" excuses.

### 6. No interfaces or inheritance for variables

This is sometimes annoying. I don't feel strongly about it though.

### 7. There are no compiler warnings, only errors! ... except there are warnings too

[There are no warnings in the
compiler](http://weekly.golang.org/doc/faq#unused_variables_and_imports). Except
it's so bloody useful to be able to have warnings, that it's instead
been made into an [external tool](http://golang.org/cmd/vet/). Which
is less useful because it's one extra step you have to manually take.

So Go is not my favourite language. It comes in second after C++. And
for many if not most projects I prefer to use Go.
