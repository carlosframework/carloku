# Deploying

Deploying is getting a build off your machine and onto the URL people
use, and then knowing — not hoping — that the URL is serving it. One
command covers all of that.

```sh
carlos deploy -app hello ./hello
```

It prints where it is deploying to, then `shipped`, then `promoted`, and
finally `live` against each hostname. That last line is the one that
matters. The others say a write succeeded; only `live` says a visitor
would get the new build.

## What the one command is doing

Three steps, and you can run them separately when you want the gap
between them.

Shipping hashes your artifact, stores it under its content address, and
records a manifest that never changes afterwards. Nothing you serve
changes yet. Promoting points a channel at that version — see
[Channels](/docs/channels/) for what a channel is and when you would have
more than one. Then the command watches: it polls the live hostname for
the `X-Carlos-Version` header until that header names the version you
shipped, over a 2xx. It gives up after two minutes by default, and
`-timeout` moves that.

The header is also how you check by hand later, and it is worth
preferring over anything else you might reach for. A page that looks
right can be a cached copy of the old build:

```sh
curl -sI https://hello.q4t.oncarlos.com | grep -i x-carlos-version
```

## What you ship

The version defaults to `git rev-parse --short HEAD`, so a deploy from a
clean checkout is already labelled with the commit it came from.
`-version` overrides it.

Binaries are the common case, and `-target` says what you built for. It
defaults to `linux-arm64`, which is what Carloku runs, so a Go build for
this platform is:

```sh
GOOS=linux GOARCH=arm64 go build -o hello .
```

A directory of files is a site rather than a binary, and takes
`-kind static`:

```sh
carlos deploy -app hello-site -kind static ./public
```

Run any of these once from your project and the CLI offers to remember
the app and the artifact in `.carlos/config`. Say yes and the whole
release becomes `carlos deploy` with no arguments, which is the form to
put in a Makefile or a git hook.

## When it doesn't go live

A deploy that stops short usually stops for a reason it will tell you.

If the channel you are promoting into needs approvals, the ship still
lands and the promote becomes a proposal: the CLI says how many
confirmations it needs and where to confirm them. If the channel has a
bake window, the promote lands and the fleet adopts when the window
expires — the command exits successfully, because the hold is policy
rather than a failure. And if no instance follows the channel yet, it
says so instead of watching a URL that nobody serves, and names
`carlos instances create` as the step that gives the version somewhere to
run.

A watch that times out is a different situation. The version is published
and the pointer has moved, so your app is either failing to start or
failing its first request. Go to the logs:

```sh
carlos logs -app hello -since 10m
```

Full flag lists for
[deploy](https://carlosframework.com/docs/cli/#carlos-deploy),
[ship](https://carlosframework.com/docs/cli/#carlos-ship) and
[promote](https://carlosframework.com/docs/cli/#carlos-promote) are in
the CLI reference, and `carlos deploy -h` prints them at your terminal.
