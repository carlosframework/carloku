# Members and service credentials

Two kinds of thing act on your apps. A person is a Keymail address with a
role in the account. A credential is something a server holds — a CI runner,
a job, a router — with its reach decided when it was minted and no human
attached to it. They are administered in different places, and the mistakes
they invite are different too.

## People

Invites go out from the Team page in the console, addressed to a Keymail
address. The invitation lands in that person's Keymail Apps inbox rather than
their email; the platform does not send mail to anyone. It works once and
expires after seven days, and an owner can revoke a pending one before it is
used.

There are two roles. A member does the day-to-day work on the account's apps
— deploy, promote, roll back, config, domains, logs. An owner does all of
that plus everything that changes who can act or ends something permanently:
inviting, removing a member, handing ownership over, deleting an app or the
account, and every credential in the next section. Handing over ownership is
a single transaction that steps you down to member as it lifts them up, so
there is no moment with two owners or none.

Some of those actions ask for your passkey again even though you are already
signed in — removing a member, transferring ownership, deleting the account,
approving a terminal or revoking one, minting or rotating a credential. The
gesture has to be within the last five minutes. A session cookie proves who
you are and not that you are still at the keyboard, which is the whole
question when the action is irreversible.

None of this has a `carlos` verb. Membership is console work, deliberately:
the passkey prompt is the point of it, and a terminal has nowhere to put one.

## Credentials a server holds

```sh
carlos services create -role publish -app hello ci-runner
```

The secret prints once, right there in your terminal, and only its hash is
stored. There is no page and no command that will show it to you again — a
lost secret means rotating, not re-running. Get it into the app the way you
get any credential in:

```sh
carlos secrets set -app hello CARLOS_SERVICE_TOKEN=<the secret>
```

Pick the narrowest role that does the job. `publish` is the deploy loop:
claim an app, ship, promote, roll back, manage hostnames, retire. `operate`
is runtime work with no release authority — restart, config, logs. `instance`
is the older app-token shape, kept for what already depends on it. `admin` is
the union of those plus ledgers, storage and placement, and it includes
granting object-store access, which mints a real IAM user. That last one is a
handover, not a convenience.

`-app hello` binds the credential to one app, which also means it cannot
claim new ones. Leave it off for an account-wide credential. Either way the
reach is fixed at mint: if you join another account next month, the
credential you minted does not follow you there. It draws on its own rate
budgets rather than yours, too — see [Limits](/docs/limits/) — and it never
expires, so revoking is the control.

## Rotate replaces, revoke stops

This is the distinction to have straight before you need it.

```sh
carlos services rotate ci-runner
```

Rotation mints a fresh secret and prints it once, keeping the name, the role,
the scope and the history. The old secret is refused on the credential's
*next* call — work already in flight is unaffected. That makes rotation a
hygiene move, not an incident response.

```sh
carlos services revoke ci-runner
```

Revocation is the hard stop: the credential's next call fails whatever secret
it is holding. It is idempotent, so revoking a name twice, or one that never
existed, answers the same way. And unlike minting and rotating, it does not
ask for your passkey — one step, at whatever hour you find out.

If you suspect a secret has leaked, revoke. Then mint a replacement under a
new name if the work still needs doing.

To see what exists:

```sh
carlos services ls
```

Live credentials only — name, role, scope, when it was minted, when its
current secret began, when it was last used, and who minted it. A revoked one
is gone rather than listed as revoked, so this is inventory, not history.

Every verb here is owner-only, and closed to service credentials themselves:
no credential can mint, rotate or revoke any credential, not even its own.
A leaked one therefore cannot quietly issue itself a quieter sibling. The
console's Account settings page carries the same list, the same mint form,
and rotate and revoke controls per row.

Each verb takes `-account` when you belong to more than one; with a single
account you can leave it off.
[carlos services](https://carlosframework.com/docs/cli/#carlos-services) has
the rest of the flags.
