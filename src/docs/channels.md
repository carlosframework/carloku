# Channels

A channel is a pointer with a name. It says which shipped version an app
is serving, and promoting is the act of moving it. Nothing is rebuilt
between one channel and the next — the bytes that were tested are the
bytes that go live, which is the whole reason the platform separates
shipping from promoting.

## You start with one

Every app is created with a single channel called `edge`, and
`carlos deploy` lands there. That is enough for most apps: you deploy,
and it is live. To see where things stand:

```sh
carlos channels -app hello
```

Nothing is ever promoted *onto* the entry channel. Deploys land there, and
promotion moves a version from it to whatever comes next — so with one
channel there is no promotion step at all.

## Adding a stage in front of production

When you want a version to sit somewhere before a wider audience sees it,
declare a pipeline. The starter template adds a `production` channel
behind `edge`:

```sh
carlos pipeline init -app hello -template edge-production
```

That gives `production` a 24-hour bake window, a passkey requirement on
promotion, and an approval on any change to those rules — so the
protection cannot be quietly removed later either. The other template,
`full-ladder`, sets up `edge → beta → stable` with bakes of 24 and 72
hours and the passkey on `stable`.

Once a pipeline exists, deploys still land on `edge` and you move a
version forward by naming it:

```sh
carlos promote -app hello a1b2c3d production
```

A channel is entered from the one immediately before it and no other, so
"it ran on edge for a day first" is a fact about the bytes rather than a
claim about process. Promoting the same version twice succeeds and
changes nothing.

The rules a channel can carry — bake windows, passkeys, approval counts —
are all editable after the fact with
[carlos pipeline](https://carlosframework.com/docs/cli/#carlos-pipeline),
and [carlos promote](https://carlosframework.com/docs/cli/#carlos-promote)
documents the rest of its own flags.

## Putting a version back

Rollback points a channel at whatever it was serving before:

```sh
carlos rollback -app hello production
```

The outgoing version goes onto the channel's history as it leaves, so
running the same command again returns you to where you started — useful
when the rollback turns out to be the wrong call. A bake window does not
delay it: a box already has the version it is going back to, so there is
nothing to hold.

Two things are worth doing before you need this. Give your ships a
`-label` people can read, because that is what you will be squinting at
during a rollback. And get familiar with
[carlos releases](https://carlosframework.com/docs/cli/#carlos-releases)
while nothing is on fire: it answers "what is there to run", where
`carlos channels` answers "what is running".

## What reaching stable means

The `full-ladder` shape has a `stable` channel at the top, and a
promotion onto it can cut a semver tag: one name pointing at one release,
with the changelog of every iteration that led there compiled into it.

That happens when the version being promoted is an iteration of a target
rather than a commit sha, so set the target once:

```sh
carlos version target -app hello 0.5.0
```

From then on `carlos ship` with no `-version` mints the next iteration
under it. Promote a sha-named build to stable instead and the promotion
still lands. There is no tag to cut, and the promotion says so.

Tags are a naming convenience and an audit record, nothing more. No part
of getting your app running reads one, so an app that never uses them
loses nothing.

Full flags for the commands on this page:
[channels](https://carlosframework.com/docs/cli/#carlos-channels) and
[rollback](https://carlosframework.com/docs/cli/#carlos-rollback).
