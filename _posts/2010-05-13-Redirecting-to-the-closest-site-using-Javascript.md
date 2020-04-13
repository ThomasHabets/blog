---
layout: post
title:  "Redirecting to the closest site using Javascript"
date:   2010-05-13 00:00:00 +0000
categories: coding, web
---
I'm sure this problem has been solved this way many times before, but
I haven't seen it while idly browsing around sites about scalability
and load balancing. So here it is, a [Javascript solution to
the closest-site problem](http://github.com/ThomasHabets/closite).

For static content optimizing for latency is easy and cheap. Just put
your files in a CDN such as [Amazon
CloudFront](http://aws.amazon.com/cloudfront/) and you're done. Low
(lower) latency all over the world. Done.

For dynamic content it's a bit harder. You can set up several data
centers (sites) and try to redirect the user to their closest
site. But how do you find out what site is the closest one, and how do
you redirect the user to the right one?

There are several solutions to this, such as using anycast BGP or
source-aware DNS. But they have big drawbacks.  DNS based solutions
depend on the users resolver to be close to the user and that the
ip2location database is correct.  BGP-based solutions depend on you
having access to BGP (and the staff to make sure it's done correctly)
and have your own PI IPs. There are other drawbacks as well.

To me the best solution, at least for smaller websites, is to have the
browser check the latency to all the sites and migrate to the closest
one. So I coded up some javascript for that using jQuery. You can even
have the initial (static) start page be on a CDN, and have all the
links from there automatically be redirected to the closest site for
delivering dynamic content.

Other interesting things you can do with this is to have the browser
report back what latency you have to their IP, and you'll easily get
your own network map. One that is more relevant than an ip2location
database for this particular use.

The drawbacks to this solution are that you may have to check that you
can handle users migrating to another site mid-session and that if the
user bookmarks the page then the site domain name will be included in
that bookmark which you may not want.  Still, often this can be the
best solution, and if you don't want to migrate users mid-session then
you can limit the use of the redirection to only the front page or the
first request in a session.

Please excuse my Javascript. It's not my native tongue.

## Links

* [Closite at github](http://github.com/ThomasHabets/closite)
* [Demo of closite](http://jasmin.pseudohacker.net/~marvin/closite/site1/index.html), click "Link back to this page" and you'll be redirected back and forth (both sites are on the same box, with artificial delay introduced so that you go back and forth)
* [Improving Global Application Performance, continued: GSLB with EC2](http://dev.bizo.com/2010/05/improving-global-application.html)
