# The console

[console.carloku.com](https://console.carloku.com) is the same platform your
terminal talks to, with a browser in front of it. You sign in with a passkey
through Keymail, and the account you sign in to is the one
`carlos auth login` connects a terminal to — the short code the CLI prints
is approved in this browser.

Most weeks you will barely open it. Deploys, config, logs and domains are all
commands, and the console reads the records those commands write. Where it
earns its place is the handful of jobs with no command behind them, and
looking at an app somebody else on your team deployed.

## What each page shows

The bar across the top is per account: Apps, Fleet, Team and Settings, plus
a switcher for moving between accounts when you belong to more than one.

Apps is the list: each app's name, the address it answers on, a health chip,
and the version live right now. A Trash link appears under it once something
is in it. Opening an app gives you six tabs.

Overview answers *is it up* in a sentence — the hostname, the running version,
when it was published and by whom — then tiles for running copies, CPU and
memory, web addresses and versions, and a left-to-right diagram of the
channels a version travels through. [Channels](/docs/channels/) explains what
that diagram is drawing.

Versions is the release history. Every version you have shipped with its
label, kind and build time and a promote control per row; underneath, the
channels, what each holds, when a baked version goes live, and rollback.
Canaries and semver tags sit at the bottom of the same page.

Running is the copies themselves — address, health, version, channel, CPU,
memory — and where the app is placed. A copy reading *asleep* is annotated
there as waking on the next request, which [Restarting and
sleeping](/docs/sleeping/) explains at more length.

Logs is the window `carlos logs` prints, with a form for narrowing it.
Activity is the other one: when, who, what, for every change made to this
app. That record has no CLI verb, so the console is where you read it.

Settings carries the app's name and rename, its domains with their DNS and
TLS state alongside the attach form, its object store, its email
configuration, a link through to the pipeline rules, and deletion.

Back at account level, Fleet answers where this account's work actually runs:
the shared platform boxes your apps are placed on, and any boxes of your own.
Team and Settings are the subject of [Members and service
credentials](/docs/members/).

## Jobs that only happen here

Approving a terminal is the first one you meet: `carlos auth login` prints a
code, and nothing is granted until you type it into the console and confirm.

The rest cluster around authority and permanence. Inviting a teammate,
removing one and handing over ownership live on the Team page; minting,
rotating and revoking a credential a server holds live on Account settings.

Deletion is the other cluster. A deleted app goes to Trash and stays
restorable for 30 days, keeping its releases, channels and history —
restoring gives all of that back with no routes, so run
`carlos add <host>` afterwards to serve it again. An owner can also destroy
one immediately from the same page, which asks for the app's name typed out
and then for your passkey.

And when the day's app-creation budget is spent, the console's Create app
form is the way through — it has no limit of its own. [Limits and getting
help](/docs/limits/) has the numbers.

## Your own settings

Your address in the header opens a page listing every terminal signed in as
you: where it signed in from, when, when it was last used, and when it
expires. Each row has a revoke control. A laptop that went missing is the
reason this page exists — revoking there kills that terminal's access
without touching anyone else's.
