# Env and secrets

Your app's configuration lives in two stores. Both arrive at your process
as ordinary environment variables, and from inside the app you cannot
tell them apart. The difference is what happens to the value on the way
there, and it is worth getting right the first time.

Plain config goes in `carlos env`:

```sh
carlos env set -app hello LOG_LEVEL=debug
```

Credentials go in `carlos secrets`. Same shape:

```sh
carlos secrets set -app hello STRIPE_KEY=sk_live_example
```

## Which store a value belongs in

Ask whether you would mind the value appearing in a screenshot. A log
level, a feature flag, the public URL of a service you call — nobody
cares, and `carlos env` keeps them readable, which is what you want when
you are working out why staging behaves oddly.

An API key, a database URL with a password in it, a signing secret,
anything a third party issued you: `carlos secrets`. If in doubt, the
sealed store costs you nothing except the ability to read the value back,
so put it there.

## What sealing actually does

`carlos secrets set` seals the value on your machine, using the
deployment's public key, before anything leaves your terminal. What gets
stored is an envelope. The private half of that key lives on the box that
runs your app and never leaves it, so the console holds a secret it
cannot itself open.

The consequence is the one thing people trip over: nothing can show you
the value again. `carlos secrets list` prints key names and stops there.
Lose the value and your only move is setting a new one.

One practical wrinkle. The value is on your command line when you type
it, so your shell history keeps a copy of it. Clear that out on a machine
other people use.

## Getting the new value into your app

Changing config converges on its own. The write bumps a marker, every box
serving the app notices within seconds, rewrites the environment file for
each of the app's routes, and cycles the process so it comes back holding
the new value. There is no separate deploy, and no restart for you to
remember.

Two things follow from the cycling. A config change is a small
interruption for a running app, so batch related changes into one call —
`carlos env set` takes several `KEY=value` pairs at once. And a change
that appears not to have taken effect is more likely to be your app
reading the variable once at startup than the platform failing to deliver
it.

To see what is set:

```sh
carlos env list -app hello
```

That prints values as well as names, and the sealed store's `list` prints
names alone. Both families also take `unset` with a key name, and the
reference pages for
[carlos env](https://carlosframework.com/docs/cli/#carlos-env) and
[carlos secrets](https://carlosframework.com/docs/cli/#carlos-secrets)
have their remaining sub-verbs.

If you take one thing from this page: put the credential in the sealed
store on the day you first set it. Moving it later means rotating it,
because by then it has been sitting somewhere readable.
