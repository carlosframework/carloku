# Logs

`carlos logs` is one timeline rather than two. Your app's own stdout and
stderr come back interleaved with the platform's account of what happened to
it — which instance woke and on what version, when something restarted it,
and when a wake failed, with the reason.

```sh
carlos logs -app hello -since 1h
```

Lines print oldest to newest: a UTC timestamp, the stream, the instance, the
message, and any structured fields your app attached, dimmed at the end.

## Following

`-f` leaves the command running and polls for new lines every two seconds.

```sh
carlos logs -app hello -f
```

It runs close to live, not exactly live. Boxes ship what they have collected
every ten seconds or so, so a follow arrives in small batches instead of
scrolling a character at a time. Start one before a deploy and you will see
the wake and the first requests.

## Cutting it down

An hour of a busy app is more than anyone reads. `-since` takes a duration
back from now (`15m`, `24h`) or an RFC3339 timestamp, and `-until` closes the
far end of the window. `-grep` matches an RE2 pattern against the message.
`-host` narrows to a single instance when the app runs more than one. `-n`
caps how many lines come back — a thousand by default, five thousand at most
— and when the window has more than that, it tells you it is showing the
newest.

There is also `-stream`. `-stream app` drops the platform's commentary and
leaves your own output; `-stream platform` does the opposite.

## The half you can't get any other way

Your app's output you could always have arranged for yourself. The platform
stream is the part that needs a view from outside the process: `instance woke
(version a1b2c3)`, `instance restarting (carlos restart)`, `instance
stopping`, and — when a request got a 503 you cannot reproduce — a wake
failure written in terms you can act on, like a socket left behind by a
previous run, or nothing promoted on the channel this instance follows.

A static site has no process and so has no app stream at all. Its platform
events still show up, and they are the reason to run `carlos logs` against a
site.

## How far back it goes

Seven days, and a size ceiling per app that drops the oldest hour first if
an app is unusually chatty. If you need a longer record than that, have the
app ship its own copy somewhere; the platform's retention is for debugging
this week, not for keeping an audit trail.

An empty result is worth a second look rather than a bug report. Platform
events only happen when something happens — a wake, a restart, a failure —
so a quiet hour of a quiet app really does have nothing in it. Widen to
`-since 24h` before you conclude that logging is broken.

The remaining flags, including `-level` and the repeatable `-field`, are in
[carlos logs](https://carlosframework.com/docs/cli/#carlos-logs).
