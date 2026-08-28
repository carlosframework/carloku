# Object storage

Uploads, generated files, anything your app wants to still have next week —
none of it belongs on the box's local disk, because the process that wrote
it there is not guaranteed to be the one serving your next request. Each app
can have a bucket of its own instead, and the credentials for it arrive in
your process as environment variables.

```sh
carlos store create -app hello
```

That records the request and nothing more. No bucket exists yet: creating
declares that the app wants one, and provisioning is a step on the Carloku
side. `carlos store status` is where you watch for it landing.

## What your app ends up with

Five variables under a prefix, `CARLOS_STORE` unless you name another:
`CARLOS_STORE_BUCKET`, `_REGION`, `_ACCESS_KEY` and `_SECRET_KEY`, plus
`_ENDPOINT` where the backend has one. Your app reads them like any other
config and talks to the bucket directly, with whichever S3 client its
language already has. Nothing proxies that traffic.

The bucket, region and endpoint are ordinary values — `carlos env list` will
show them to you. The two keys are delivered through the sealed store, so
they reach your process and stop being readable to anyone, including you.
[Env and secrets](/docs/config/) explains why that is one-way.

If your app already expects a particular set of names, say so at create
time and skip the adapter code:

```sh
carlos store create -app hello -env-prefix BLOBS
```

## Watching it arrive

```sh
carlos store status -app hello
```

You get what you declared, what was granted, and what was provisioned —
bucket, region, the user the credential belongs to, and the key id currently
in use. Two of its lines are worth knowing before you meet them. One says a
delivered variable has not reached your app's config yet. That is the
ordinary state for a few seconds after any change, and a problem only if it
persists. The other says a rotation was started and never finished.

## Rotating the key

```sh
carlos store rotate -app hello
```

A fresh credential is minted and delivered, and the previous one keeps
working. Your app picks the new values up the way it picks up any config
change: the box rewrites the environment for the app's routes and cycles the
process, within seconds. Leaving the old key alive is the point of doing it
in two halves — an upload that started under it gets to finish, and a second
instance that has not converged yet keeps serving.

Close the window when you are satisfied nothing is still using it:

```sh
carlos store rotate -finish -app hello
```

Until you do, `status` keeps telling you a rotation is pending.

One habit worth forming. The secret never appears at your terminal — rotate
prints the new key's id and that is the whole of what you see — so if the
value ever turns up somewhere it shouldn't, it came out of the app. Whatever
your app dumps at startup is the first place to look.

[carlos store](https://carlosframework.com/docs/cli/#carlos-store) has the
sub-verbs and the rest of their flags.
