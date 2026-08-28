# Restarting and sleeping

Your app's process gets cycled for reasons that have nothing to do with new
code. You ask for it, a config change forces it, or the platform puts a quiet
app to sleep and starts it again when somebody turns up. This page covers the
first and the last.

```sh
carlos restart -app hello
```

The reply says *restart requested*, which is the accurate word for what
happened: the console wrote one small object, and every box serving the app
notices it within seconds and cycles its own routes. No version moves, no
channel is consulted, nothing is pushed at a box.

What cycling looks like depends on how the instance runs. A long-running one
stops and comes straight back. An on-demand one stops within seconds and
starts again on the next request that needs it — for a quiet app, that may
be a while. An instance that is already asleep is left asleep and
starts fresh whenever it next wakes.

Reach for restart when a process is wedged and you have no change to make. A
deploy already cycles the app, and so does a config change — see
[Deploying](/docs/deploying/) and [Env and secrets](/docs/config/) — so
neither of those needs a restart after it.

## What hibernation is

An app nobody has talked to for a while is checkpointed to its bucket and its
process stopped. The idle window belongs to the deployment; fifteen minutes
is the default. The app's state was living in the bucket the whole time, so
there is nothing to lose in the transition — the process was only ever the
part that reads it.

```sh
carlos instances list -app hello
```

The health column reads `asleep` for those instances and `running` for the
rest. For anything without steady traffic, `asleep` is the ordinary
condition, not a fault to clear.

## What a visitor sees

A request for a sleeping app is held at the edge while the instance wakes,
then handed to it. The visitor waits longer for that page and then gets it;
there is no error page and nothing for them to retry. Requests that arrive
together during a wake all join the same one instead of each starting their
own.

The exception is a wake that takes an unusual length of time. Past about
thirty seconds the request is answered with a 503 and a `Retry-After`, and a
wake that fails outright ends the same way. In
both cases the reason is one line in the platform stream:

```sh
carlos logs -app hello -stream platform -since 15m
```

## Traffic that doesn't wake anything

The edge keeps its own cache of responses and checks it before it goes
anywhere near the wake path, so a crawler asking for the same public page all
afternoon can be answered without your app running at all. What makes a
response eligible is your app saying so: a 2xx GET with `Cache-Control:
max-age=…` and no `Set-Cookie`. Whatever number you set, the edge caps the
entry at five minutes, so this cannot strand a page for long. Setting that
header on your public pages is the single most useful thing you can do for an
app that hibernates.

A TLS handshake by itself never wakes anything either — only a request that
would reach your app does.

## Work that still happens

A timetable set with [carlos
schedule](https://carlosframework.com/docs/cli/#carlos-schedule) survives
hibernation. Before an instance goes to sleep the platform records when its
next job falls due, and wakes it when that time arrives; the job runs, and the
usual idle window puts it back. You do not have to keep the app awake to keep
its schedule.

Flags for [carlos restart](https://carlosframework.com/docs/cli/#carlos-restart)
and [carlos instances](https://carlosframework.com/docs/cli/#carlos-instances)
are in the CLI reference.
