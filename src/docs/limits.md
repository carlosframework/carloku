# Limits and getting help

The numbers on this page exist to make a stolen token boring, not to ration
ordinary work. You are unlikely to meet any of them by hand. An automated
loop is another matter, so here they are, along with what the refusal looks
like when one does bite.

## Shipping

Two uploads a minute, counted per terminal token. That is past what an honest
build-test-ship loop can produce, since a build worth shipping takes longer
than half a minute to make.

A refusal is a 429 that names the wait in seconds and repeats it in a
`Retry-After` header, so a script has a number to sleep on instead of a
guess. The window is a minute for exactly that reason: the worst a refused
caller is ever asked for is sixty seconds. Sleep, retry, carry on.

Size is the other ship limit. One request carries 256 MiB across everything
in it. A static release is a single archive; a binary release can carry up to
eight targets at once, which is well past what a normal build produces.

## Everything else you type

Ordinary mutations — env, secrets, promotes, rollbacks, restarts,
schedules — get thirty a minute, counted against your address and not your
terminal, so opening a second shell does not double it. The instance verbs
get sixty a minute on their own budget, because a burst of signups creating
instances is the workload that API exists for.

Claiming an app name is the tight one: ten attempts a day per address, and
attempts, not successes, so refused tries count. A claimed name persists
whether or not you ever use it, which is why this ceiling runs over a day and
the others run over a minute. When you hit it, the message points at the
console's Create app form, which has no limit of its own. That is the
intended way through, not a loophole.

## Credentials a server holds

A credential minted with `carlos services` draws on its own budgets, larger
than a person's and entirely separate: ten ships a minute, a hundred and
twenty other writes a minute, a hundred app claims a day. A CI fleet cutting
releases back to back therefore cannot starve the person who minted it, and
the person's noisy afternoon cannot stop CI.

The counters key on the credential's name, not its secret, so rotating one
does not hand it a fresh budget. [Members and service
credentials](/docs/members/) covers the rest of how they work.

## Things that expire

Logs go back seven days, with a size ceiling per app that drops the oldest
hour first — [Logs](/docs/logs/) has the detail. A deleted app sits in Trash
for thirty days before the platform destroys it. A terminal you have signed
in stays valid for ninety days, and you can revoke it sooner from your own
settings page. An invitation to join an account lasts seven days and works
once.

## When something is refused

Read the message before anything else. The platform's refusals are written to
be acted on: a rate limit names the seconds to wait, an app you cannot claim
today names the console form that will let you, an attached domain that is
not resolving prints the DNS record it wants. Very few need interpreting.

After that, in rough order of how often it helps: `carlos <verb> -h` for the
flags, [the CLI reference](https://carlosframework.com/docs/cli/) for the
full page, and `carlos logs -app <app> -since 1h` for anything where your app
started and then misbehaved. If a deploy looks stuck, check
`X-Carlos-Version` on the live hostname, not the page in your browser —
[Deploying](/docs/deploying/) explains why the header is the honest answer.

If none of that gets you there, open an issue on
[the carloku repo](https://github.com/carlosframework/carloku/issues). These
pages are written and kept there, so a question worth asking is usually a
page worth fixing, and both happen in the same place.
