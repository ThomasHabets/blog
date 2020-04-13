---
layout: post
title:  "Why bitcoin is terrible"
date:   2017-11-12 00:00:00 +0000
---
For every day that passes I like bitcoin less. It's bad for the world.

I have ranted about this many times, and it's time I consolidate these
rants into a blog post.

We'll see with time if this rant ages poorly or not.

# Section 1: Practicalities

## What bitcoin is trying to achieve in payments

These would be good things:
* Anonymity
* Peer to peer and remote payments

## What bitcoin is actually good for

Bitcoin today is pretty much only good for two things:
* Committing crimes
* Speculating on currency

If you're not doing one of those, then don't use Bitcoin.

If you are an online store then sure, accept Bitcoin. There's moral
problems with supporting Bitcoin (see rest of post), but as long as
you immediately convert to fiat currency when you receive payment it's
fine *for you*. There are even companies out there that'll guarantee
an exchange rate so that you never have to get into the business of
currency.

You may say that Bitcoin can be used to get money out of China, or
into Brazil, or to enable shopping of "things that should not be
called 'drugs' anyway", but you have to admit that no matter what you
think of laws, that's just other words for "committing crimes".

## It does peer-to-peer and online payments, you left that out!

Is that really a hard problem?

* [Paypal](https://www.paypal.com)
* [GMail Payments](https://support.google.com/pay/answer/7644136)
* [WeChat P2P](https://pay.weixin.qq.com/index.php/public/wechatpay)
* [Facebook is introducing it](https://en-gb.facebook.com/help/863171203733904/)
* [Wywallet](http://wywallet.se/)
* [Venmo](https://venmo.com/) (Owned by Paypal)
* [Alipay](https://intl.alipay.com/)
* [Paytm](https://paytm.com/)
* [Paym](https://www.paym.co.uk/)
* [TWiNT](https://www.twint.ch/en/)
* [Revolut](https://www.revolut.com/)

## But wait, it's still anonymous!

Is it though? In order to pay anonymously with bitcoin you need to
jump through hoops and be improbably competent. You need to tumble
your money very carefully, through multiple parties (how do you know
they're not fronts for the same party?), who you trust are not
compromised.

### … who you trust are not compromised.

If you're the NSA/GCHQ/etc… and you *haven't* hacked most bitcoin
exchanges and tumblers then you're incompetent, and essentially asleep
at the wheel. They [hack SIM card
manufacturers](http://www.bbc.co.uk/news/technology-31619907) and
[SWIFT](https://www.wired.com/2017/04/major-leak-suggests-nsa-deep-middle-east-banking-system/),
so of course they would hack these amateur tumbler and exchange
websites.

**Update:** Seems they are [not asleep at the
wheel](https://www.coindesk.com/nsa-reportedly-eyes-to-scrap-bitcoins-anonymity/)

### … and be improbably competent

Attacks only get better. They never get worse. There are people
*today* who [claim to be able to de-anonymize
bitcoin](http://www.bit-cluster.com/).

Can they? Maybe. But the transaction log is public. Do you think in 30
years it'll be impossible? Do you think that your bitcoin tumbling
strategy *today* will be impossible to decode after 30 years of
research and statistics?

By the way, [Monero is not
immune](https://www.wired.com/story/monero-privacy/).

For those familiar with cryptography: Your use of Bitcoin anonymously
is like you making your own security protocol, and thinking it's
secure because you base it on AES. But solid primitives don't
automatically make for a solid protocol.

There are vast opportunities to screw up a security protocol even with
good primitives, and new ways are found every
day. E.g. encrypt-then-sign, or sign-then-encrypt? If you're not
*actually* a cryptographer you shouldn't put yourself into a position
to answer that.

In 10-30 years when there's a new paper showing how to de-anonymize
your tumbling-strategy of today, do you want your weed purchases to be
visible for the whole world to see? The government is unlikely to care
(they likely already had the info anyway, and it's beyond the statute
of limitations), but now anyone with a grudge can make a "thing" out
of it, socially or legally.

And do you truly believe that the people who tumble your cash aren't
secretly recording the in's and out's? If someone's already immoral
enough to launder money for anyone, what makes you think they'll be
loyal to you? That in/out mapping over a few years will be worth *a
lot*.

Are you that competent? Is anyone? Seems improbable to me.

Even [so-called professionals who create secure hardware wallets get
it wrong](https://jochen-hoenicke.de/trezor-power-analysis/). Sorry,
customer, you shouldn't have been stupid enough to buy a hardware
wallet that has a side-channel vulnerability. The fact that this
particular vulnerability has been fixed is irrelevant, there's always
infinity more vulnerabilities out there to be found. Traditional banks
can just reverse the transaction. Once again reversibility is a
feature. Irreversibility is a bug.

Do you really want a future where because someone's math proof had an
error all your money was stolen, and *by design* it can't be
recovered? [Zcash is absurdely trying to spin exactly such an error as
being some form of a "success
story"](https://z.cash/blog/zcash-counterfeiting-vulnerability-successfully-remediated/),
just because they were 100% lucky this time.

# Section 2: Let's talk about an anonymous global currency

If the end goal of Bitcoin is a currency as common as any other, legal
and practical for goods and services on a large scale, then we need to
answer some questions about what society that is.

Let's assume that all technical hurdles of anonymity and scale are
actually solved, and we have a perfectly anonymous currency, and
compare it to digital non-anonymous currency like today's "banks" and
"credit cards".

## How would tax work?

Are you against taxes existing at all? All of it? Income tax, capital
gains, VAT, duties, etc…

Sure, you can be an ultra-liberal to the point of being almost
indistinguishable from an anarchist, but you and I both know that most
people are not, and they won't be.

Most people want and will want a government, and in the west even
democracy.

If there's no way for the government to check, then there's no way to
get caught. Why not pay everyone under the table? Today stores and
taxis (bloody black cabs) dealing with cash have the opportunity to
pocket money tax free. But there's at least some work to keep that
quiet. And it's not always easy to spend the money either. It's hard
to pay rent, buy a car, a vacation, and all other things using untaxed
money.

And if you get audited today it'll look suspicious if 100% of your
legal money goes towards rent, since the tax man knows that you need
to eat too.

When paid in bitcoin both employer and employee have perfect
deniability about how much is being paid. Bonuses can be simply
transferred in bitcoin.

So in the end rich people will pay zero tax, and poor people much less
than today. All untraceable. If there's a social safety net for people
who can't afford food then everyone will be entitled to it.

## Death

If I don't tell you my password before I die then that money
disappears.

If I do tell you my password before I die then it could disappear
before I die.

What's Bitcoin's plan for this? Just suck it up as deflation? What if
someone or something worth 10% of the currency dies? Which brings me to…

## Money consolidation

Do you want a society where one family can collect 50% of the world's
money? To want a digital anonymous world you not only say "yes", but
you also want to say "yes, and future generations should not be
allowed to know if this happens".

Today we can at least investigate how much money rich people
have. They hide it in complexity, but not with unbreakable math.

## Individuals are not competent in every field humanity does

When was the last time you tried to get cash and the ATM said "sorry,
we forgot the password to your account, so your money is gone"?

With Bitcoin people will have (and have had) hard drive crashes that
have destroyed fortunes.

A society like this makes no sense.

## Bitcoin exchanges are not regulated

… or at least not as regulated as banks.

Every idiot with a Cloud account can just become the bank and steal
all the money.

Or claim that someone else broke in and stole all the money.

Or turn your bank into a Ponzi scheme after someone steals all the
money.

* [Mt. Gox](https://en.wikipedia.org/wiki/Mt._Gox). In one breach 6%
  of all Bitcoin in circulation was stolen (4% of all Bitcoin that
  will ever exist). Imagine if 6% of all cash were stolen. And realize
  that some of that bitcoin that *you* use is stolen property.
* [Phaser
  Inc](https://www.engadget.com/2011/08/12/biggest-eve-online-scam-ever-recorded-nets-over-a-trillion-isk/)
* [Nicehash](https://www.theguardian.com/technology/2017/dec/07/bitcoin-64m-cryptocurrency-stolen-hack-attack-marketplace-nicehash-passwords)
* [Coincheck](https://www.reuters.com/article/us-japan-cryptocurrency/tokyo-based-cryptocurrency-exchange-hacked-losing-530-million-nhk-idUSKBN1FF29C)
* [QuadrigaCX](https://gizmodo.com/crypto-exchange-says-it-cant-repay-190-million-to-clie-1832309454)
* [Binance](https://www.bbc.co.uk/news/technology-48199375)
* [Iota](https://www.zdnet.com/article/iota-cryptocurrency-shuts-down-entire-network-after-wallet-hack/)
* [Many many more](https://magoo.github.io/Blockchain-Graveyard/)

With game money you and the robber can just shrug and say "this is
part of the game", but when it's about your non-disposable real money
it's not so funny anymore.

## Fraud

Fraud (e.g. credit card fraud) is often solved by reversing the
charge. This not only returns the money to the victim but also puts
the incentives in the right place. Consumers don't have the power to
force chip-and-pin, so there would be no point in placing the
incentives with them.

Thought it was annoying to get a virus before? Now it'll take your
bank account with no possibilty to fix it. You can't really insure
against it either, because another crime that'd be trivial and
untraceable would be insurance fraud.

Fraud handling works much better "for the little guy" today than with
Bitcoin. With Bitcoin fraud is not fixable.

It's not "fraud", but here's [proof that humanity (even cryptocurrency
people) want
reversibility](https://github.com/5chdn/EIPs/blob/a5-eip-999/EIPS/eip-999.md). Of
course like [this guy](https://news.ycombinator.com/item?id=16844205)
points out, they only want reversibility for their crypto-rich
friends. If *you* lose $1M due to a mistake, then sucks to be you.

## Bank hacking

Banks get hacked, or sometimes just make mistakes in big
transfers. How do you fix it? Yes, you reverse the transaction. What
if the recipient has withdrawn all of it as cash? You send the police
after them. And people know this, so they almost invariably don't.

"If you are bank then don't make a mistake" is obviously not the
answer.

When [one of the founders of The Pirate
Bay](https://en.wikipedia.org/wiki/Gottfrid_Svartholm) [hacked a
bank](https://wikileaks.org/gottfrid-docs/), with full access to their
mainframe and money transfer system, only something like $3000 was
actually lost because it turns out it's hard to get large sums of
money out of a bank without the bank being able to reverse the
transactions.

In the end the bank lost those ~$3000 that the criminals managed to
take out of an ATM, plus a tiny bit due to currency exchange rates
when the international transfers were reversed.

When the bank realised what was going on for a while blocked all
international transfers on manual individual review.

If this had been cryptocurrencies then… well it would have been
[Mt. Gox](https://en.wikipedia.org/wiki/Mt._Gox).

## Money laundering

Are you simply OK with money laundering as a thing everyone should do?
I'm not.

## "Follow the money" for crime investigations

### Banks

Bob is murdered. Alice transferred $100k to known criminal Dave 7 days
prior. It's not conclusive proof in itself, but you know where to
start this investigation, don't you?

### Cash

Alice withdrew $100k 7 days prior, has been seen handing a bag to
Dave, and Dave now needs to carefully and competently launder that
without making a mistake.

### Bitcoin

Bob is murdered. The End.

## Without bitcoin ransomware would not exist

To participate in bitcoin is to enable ransomware. Yes, you can shrug
and say "guns don't kill people, people kill people", but you have to
admit that this is starting to add up. You have to shrug at a *lot* of
suffering in the world in order to support bitcoin. People literally
die who would not die if cryptocurrency didn't exist.

How much shrugging is too much for your abstract notions of
decentralized currency? (and it looks like it's not even all that
decentralized anyway, but this section assumes a perfect
cryptocurrency)

# Section 3: But it's just like cash and that's fine!

Bitcoin is really really not like cash. For small transactions,
yes. But more of the same is not the same.

## One example: Kamikaze-robbery

What happens if a huge pile of cash is left unguarded for 2 seconds?
It might get stolen. Someone could grab the bag and run. They may even
be armed. But the robbers can only grab as much as they can carry, and
they have to keep it safe. The police will run after them, and often
the money is recovered.

What happens when someone goes into a bitcoin exchange armed to the
teeth, demanding all bitcoins in the exchange or the hostage will die?

What happens when a rogue employee of a company holding bitcoin (e.g.
an exchange) realizes that due to a security mistake they have access
to $1B worth of bitcoin, and they take it?

Well… they'll probably get caught. Let's assume the government exists,
or at least the police does.

Now what? The money is gone. The robber didn't even need an exit
strategy, and can just surrender. Their family is set for life, and
only one person went to jail, and maybe only for a few years. When
they get out they're rich.

ISIS could do this today. They could even go in, steal a billion
dollars, and then blow themselves up.

You could literally kill a bank and take all its money.

[Somewhat
relevant](https://www.engadget.com/2017/12/14/crooks-make-off-with-ethereum/).

## HSBC got a slap on the wrist for laundering terrorist money, but at least we know about it

Yeah [that
happened](https://www.forbes.com/sites/afontevecchia/2012/07/16/hsbc-helped-terrorists-iran-mexican-drug-cartels-launder-money-senate-report-says/).

If the world were Bitcoin then HSBC would not be needed. Bitcoin *is*
dishonest money laundering because "money laundering" is just the flip
side of honest "anonymity".

## Bitcoin is inherently deflationary

Deflation is about the worst thing that can happen to a currency. Mild
deflation is right up there with hyperinflation.

If you expect the currency to go up in value then economic
transactions are disincentivised. This is the opposite of what you
want for an economy.

I'm not elaborating here because it's such a big topic on its own.

# Section 4: The electricity

Some of the electricity aspects are in theory possible to fix, I'll
admit. But the current state is absolutely horrible.

## The numbers

As of 2018-04-15 [Bitcoin consumes about 7GW of
power](https://digiconomist.net/bitcoin-energy-consumption). That's
about 5-6 nuclear reactor's worth of output (depending on reactor
size) at a cost of about 3 BILLION dollars annually.

All this to support 3-7 transactions per second.

## Bitcoin is built on burglary and theft

As of approximately now-ish (depends on BTC value of the day) it's not
economically feasible to pay for electricity to run Bitcoin. So why
does Bitcoin run?

Because it's run on stolen power. Hacked machines, fraud, abuse, and
malware runs bitcoin.

You don't need to go to [Silk
Road](https://en.wikipedia.org/wiki/Silk_Road_(marketplace)) to be
part of the criminal parts of Bitcoin; Bitcoin *itself* runs on crime.

Some of the electricity to run bitcoin is bought near the electricity
producer. Great. You bought electricity that would otherwise have gone
to useful purposes. Because you bought electricity cheap someone else
now has to pay more (because supply of usable hydroelectric, for
example, is finite and largely already used up), which brings me
to…

## Electricity cost floor

This is another major reason I strongly dislike Bitcoin. As long as
participating in mining or transaction validation is compensated this
sets a floor on the cost of electricity.

Imagine I invented a device that lowered the cost of electricity
production to 10% of what it is today. How would that affect the price
of energy for consumers, to save money for consumers, resources for
the world, and enable new uses of energy previously not economical?

In a Bitcoin world: Not at all. The price was already at the level
where it was rational for someone to pay that in order to make
Bitcoin. If the price drops, then that pushes up demand until supply
runs low causing the price to be back to exactly where it started.

Placing a floor on the price of energy is just about the most evil
thing that can be done to civilization, the world economy, and
everything affected by it.

## Random links

* [Bitcoin is not cash](https://www.youtube.com/watch?v=p9HH_dFcoLc)
* [Bitcoin is stupid](https://www.mrmoneymustache.com/2018/01/02/why-bitcoin-is-stupid/)
* [Bitcoin dine-and-dash betting](https://www.bloomberg.com/news/articles/2018-08-03/a-massive-losing-bet-on-bitcoin-futures-has-investors-buzzing)
* [Attack of the 50 foot
  blockchain](https://www.amazon.com/Attack-50-Foot-Blockchain-Contracts-ebook/dp/B073CPP581/)
  (I read this almost a year after writing this blog post)
* [Regulatory bucket of cold water](https://www.reddit.com/r/worldnews/comments/dj2jro/the_largest_dark_web_child_pornography_site_in/f41kuy9/)
