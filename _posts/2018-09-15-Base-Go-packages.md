---
layout: post
title:  "Base Go packages"
date:   2018-09-15 00:00:00 +0000
---

The Go standard library is generally great, but some parts have
replacements that are just plain better and remove frustrations that
you may have not even realised were frustrations. Here are my
recommendations for every Go program.

I wouldn't recommend that anyone use the standard library version of
these for any purpose, since better alternatives exist.

This list may expand in the future.

## [gorilla/mux](https://godoc.org/github.com/gorilla/mux)

The standard router is fine, but very low level. Here's some of the
features that makes it vital.

### Filter on HTTP method

With the standard router you have to manually check that the method is
what you expect it to be, and if the same endpoint has both `GET` and
`POST` then you have to route that yourself. With gorilla/mux it's as simple as:

```go
r := mux.NewRouter()
get := r.Method("GET").Subrouter()
post := r.Method("POST").Subrouter()
get.HandleFunc("/", handleRoot)
get.HandleFunc("/items", handleListItems)
post.HandleFunc("/items", handleUploadItem)
```

You can also assert that headers are in place, for example to check
`X-Requested-With` because some API endpoints should not be allowed in
cross-domain XHR requests. Adding it to the router instead of manual
checks simplifies code and reduces risk of forgetting to add the
check.

### Pattern URLs

With the standard router you have to set up a prefix handler and parse
the URL yourself... and have your "/" handler handle all 404s that
it'll get.

```go
get.HandleFunc("/items/{item_id:[0-9-]+}", handleGetItem)
[...]
func handleGetItem(w http.ResponseWriter, r *http.Request) {
  itemID := mux.Vars(r)["item_id"]
}
```

# [sirupsen/logrus](https://godoc.org/github.com/sirupsen/logrus)

Unstructured logging is frustrating. Merely searching for all log
entries in a given time range is a whole project because timestamps
need to be parsed, daylight savings taken into account, and then the
rest of the line needs to be parsed to extract severity and message.

And that doesn't even enable multi-line logs, labels and other
structured data.

```go
func handleGetItem(w http.ResponseWriter, r *http.Request) {
  log := logrus.WithFields(logrus.Fields{
        "client_address": r.RemoteAddr,
      },
  )
  itemID := mux.Vars(r)["item_id"]

  if secretItem(itemID) {
    log.Warningf("Attempt to access secret item %q", itemID)
    code := http.StatusForbidden
    http.Error(w, http.StatusText(code), code)
    return
  }
}
```

If outputting in JSON format that becomes:

```go
time="2018-09-15T13:34:18+01:00" level=warning msg="Attempt to access secret item \"42\"" client_address=192.0.2.123
```

You can even add the item ID as another field, incrementally, with:

```go
  log = log.WithField("item_id", itemID)
```

To have these fields traverse code stacks I'd probably have my extra
label data attached to the [context](https://godoc.org/context), so
that I don't have to pass down both context and log objects.

## [errors](https://godoc.org/github.com/pkg/errors)

This is not so much a replacement for a package as filling a need that
plain errors have.

The biggest problem standard Go errors have is that they are pretty
much untyped. Yes, they have a type, but then they get annotated as
they traverse up the stack so that in the end they're more like
freeform strings. Once your `os.PathError` is wrapped via standard
means (`return fmt.Errorf("failed to read config: %v", err)`) the type
is obliterated.

```go
func readSomething() error {
  _, err := ioutil.ReadAll(f)
  if err != nil {
    return errors.Wrap(err, "reading the thing failed")
  }
  return nil
}

type stackTracer interface {
    StackTrace() errors.StackTrace
}

func main() {
  if err := readSomething(); err != nil {
    log := logrus.WithFields(log.Fields{
      "error": err.Error(),
      "cause": errors.Cause(err),
    })
    if e, ok := err.(stackTracer); ok {
      log = log.WithField("stack", e.StackTrace())
    }
    if e, ok := errors.Cause(err).(*os.PathError); ok {
      log = log.WithFields(log.Fields{
        "os.PathError.Op": e.Op,
        "os.PathError.Path": e.Path,
        "os.PathError.Err": e.Err,
      })
    }
    log.Fatalf("Failed to read something")
  }
}
```

Now the original error (or as close to it as possible) can be found
with `errors.Cause(err)`. `err.String()` is still the most
human-readable full error, but by wrapping errors you don't have to
choose between annotating, and keeping the error type and exact
value. And also not resort to parsing error strings.
