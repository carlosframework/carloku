# Custom domains

Your app already answers on a hostname the platform gave it, something
like `hello.bdf.oncarlos.com`. Attaching your own domain is two moves:
tell Carloku the hostname is yours, then point a DNS record at it. The
platform hostname keeps working afterwards, so you can do all of this
before you switch any traffic over.

```sh
carlos domains attach -app hello www.example.com
```

Leave `-route` off when the app has one instance — the command works out
what to point the hostname at. With several, name the one you mean.

## The DNS record

Attach finishes by printing the record to create and the hostname's
current DNS state, so you need neither a second command nor a trip to the
console to know what is left. Usually that is an A record at this
deployment's edge addresses, named for you rather than left to look up.
Where the deployment offers a steering hostname, a subdomain is offered a
CNAME at that instead: visitors then reach the nearest healthy edge, and
a failed edge drops out of the answer on its own. An apex domain —
`example.com` with nothing in front of it — always takes the A record,
because a CNAME cannot legally sit at the apex.

Create the record with whoever runs your DNS. Checks run every few
minutes, so there is nothing to trigger.

## Watching it come live

```sh
carlos domains list -app hello
```

Each row is one claim joined to what the fleet actually observes: which
route it points at, whether the hostname resolves to the edge, when its
certificate expires, and — while it isn't pointing yet — the same
instruction attach printed. Certificates are minted and renewed for you;
there is no step here you own.

The claim itself reaches the boxes within seconds of the attach, so a row
that still reads `pending` a minute later is unusual. The DNS column is
the slow half. It stays unhelpful until your record has propagated, and
nothing on this side can hurry that along.

## Taking one off

```sh
carlos domains detach -app hello www.example.com
```

The boxes serving the app notice within seconds and stop answering for
the hostname, the same way they picked it up when you attached it. Your
DNS record is yours to clean up afterwards.

## Wildcards

Two flags on
[attach](https://carlosframework.com/docs/cli/#carlos-domains) cover the
give-every-customer-a-subdomain case. `-wildcard` enables a delegated
wildcard certificate for the hostname; `-catchall` derives a `*.<host>`
alias onto the same route. Both need DNS delegation in place, and attach
refuses with the reason when it isn't. Attaching one marketing domain
needs neither.

Neither flag has a default position either. Naming one changes it and
leaving it off leaves it alone, so you can turn a wildcard on months
later without restating anything else about the claim.
