---
layout: post
title:  "Benchmarking TPM-backed SSL"
date:   2012-02-04 00:00:00 +0000
categories: security, network, tpm, hsm
---
![TPM performance](https://blog.habets.se/static/2012-02-05_TPM_handshake_performance.png)

As you can plainly see from this graph, my TPM chip can do
approximately 1.4 SSL handshakes per second. A handshake takes about
0.7 seconds of TPM time, so when two clients are connecting the
average connect time is 1.4 seconds.  This means probably not useful
on server side, but should be good for some client side applications.

<blargh:body/>

To replicate the test, start a server:

```
openssl s_server -keyform engine -engine tpm -accept 12345 -cert foo.crt -key foo.key -tls1 -CAfile foo.crt -verify 1 -status
```

And then connect 100 times:

```
for n in $(seq 100); do time openssl s_client -tls1 -connect localhost:12345 < /dev/null >/dev/null 2>/dev/null;done 2> timelog
```

Then just look at the "real" time in the timelog. (if in doubt, use
bash. zsh gave me some crap in the log) Example GNUPlot:

```
plot [1:] [0:2] '2' using (2/$1) w l title '2 clients','1' using (1/$1) w l title '1 client'
```
