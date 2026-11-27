# ADR 0033 — An email door for offers

Status: proposed

Date: 2026-11-27

## Context

Today an offer can be left only on `datum.quest` itself: the web form, plain HTTP, or the MCP door ([ADR 0026](0026-mcp-door-for-agents.md)). Some actors can't get there:

- Agents often run in sandboxes whose network allows a short list of hosts. The carry mirror ([ADR 0032](0032-carry-mirror-on-github.md)) lets them read, but not leave anything.
- Some work and school filters block the `.quest` domain.
- Cloudflare turns some HTTP clients away before a request reaches Hummingbird (error 1010).

Almost every person, and almost every agent acting for a person, can send email. When the steward's own agent tried to leave offers, it drafted them and held each one for its person's approval before sending. Email fits that: the agent drafts, the person sends from their own mail, and nothing has to reach `datum.quest` over HTTP.

The steward asked on 2026-11-27 whether offers could be left somewhere else and relayed in, and asked for this to be written up as a proposed ADR. Relaying through a public GitHub issue was considered and set aside (see Alternatives).

## Decision (proposed)

### 1. One address, one small Worker

Mail to `offer@datum.quest` becomes an offer. Cloudflare Email Routing hands it to one small Worker in plain JavaScript. Pages Functions can't receive mail, so this is a separate Worker, but it is not a new place to keep anything: it holds no storage binding, no D1, no KV and no secrets.

No other address at `datum.quest` takes mail. There is no catch-all.

### 2. The Worker is an ordinary client of the offer door

The Worker turns the mail into one `POST https://datum.quest/offer` request, with a `User-Agent` that names it, exactly as any other client would. Validation, the 250-offer capacity, retention (30 days, or 22 for an answer to a scoped ask), receipts, handling terms, the keyed content hash and the review rules all stay where they are and apply unchanged. There is no new route, field, table, limit or retention rule.

### 3. What the Worker reads

- **The offer** is the plain-text part of the mail (or the text of its HTML part when there is no plain-text part), trimmed. Quoted lines (starting with `>`) and anything after a standard signature line (`-- `) are dropped.
- **Two optional fields** may open the mail, one per line: `question_id: <id>` and `reference: <https URL>`. They map to the door's existing `question_id` and `reference` fields and are removed from the offer text.
- **The subject is ignored.** Senders are asked to leave it empty or write only "offer", because the host's mail log keeps subjects (see 4).
- **Attachments are ignored**, as the door takes no files. The reply says so.
- Mail over 64 KB is refused before it is read, which keeps the Worker within the host's free-plan limits. The offer itself is still capped at 4,000 characters by the door.

### 4. The sender's address

The Worker uses the sender's address only to send one reply, and only while it handles that one mail. It never passes the address to the offer door, never writes it anywhere, and never logs it. The offer record is the same as one left by any other door.

The host keeps more than that, and Hummingbird will say so plainly wherever the email door is named. Cloudflare's Email Routing keeps an activity log of each mail's sender, recipient and subject for 31 days, which the steward can see in the Cloudflare dashboard. It also checks each mail's SPF, DKIM and DMARC and rejects mail that fails, before Hummingbird sees it. Hummingbird doesn't copy that log, read it to learn who sent an offer, or tie it to an offer. "Not stored by Hummingbird: … email addresses" stays true; the pages add one sentence that the host's mail log keeps them for 31 days.

### 5. One reply, carrying the receipt

Each accepted mail gets exactly one reply, from `offer@datum.quest`, threaded to the sender's message. It carries what the door returned: the private receipt and how to use it, or the door's refusal and its reason. The receipt then sits in the sender's own mailbox, which also helps agents that can't keep it.

The host sends such a reply only when the incoming mail passes DMARC. The Worker checks that first. A mail that doesn't pass is refused at the mail level with a short reason pointing to the web form, and is not turned into an offer, so nobody is left with an offer they can't reach.

### 6. No loops, no mailing lists

The Worker sends no reply, and makes no offer, for mail marked as automatic (`Auto-Submitted` other than `no`), bounces and delivery reports, mail from `mailer-daemon` or `postmaster`, or mail carrying a `List-Id`. The host also refuses to reply to a mail with more than 100 `References` entries.

### 7. Where it is named

`llms.txt`, the offer page, the connect page and the carry mirror README name the address, the two optional lines, what is and isn't kept (including the host's 31-day mail log), and that a reply carries the receipt. The OpenAPI description and the MCP door don't change.

### 8. Turning it on and off

Turning it on takes two steps only the steward can do in the Cloudflare dashboard: onboard `datum.quest` to Email Routing (which adds its mail DNS records), and either route `offer@datum.quest` to the Worker or let the deploy token manage that one routing rule. The Worker is deployed by a new target in the manual Edge workflow, with the existing scoped token.

The steward can stop the door at any time by disabling that one routing rule in the dashboard. Nothing else depends on it.

## Why the current stack cannot meet the need

The need is Leave for actors who can't make an HTTP request to `datum.quest` but can send mail. No page, function or file on the current stack can receive mail. The Worker adds one handler and one parsing library (a small, pinned MIME parser such as `postal-mime`, since hand-parsing MIME encodings is fragile), and no new provider: Email Routing is part of the same Cloudflare account.

## Risks and limits

- **Spam:** an address is easier to find than a POST route. Mail that fails SPF, DKIM or DMARC, or comes from a listed IP address, is rejected by the host. What passes is an ordinary offer and can fill the 250-offer pilot; a full buffer is evidence, not failure, and the routing rule can be switched off in one click.
- **A record outside Hummingbird:** the host's 31-day mail log holds sender addresses Hummingbird doesn't otherwise see. This is the main cost of the door, and it is why the pages must say so before anyone sends.
- **Shared limits:** every mail offer reaches the door from the host's own network. If an edge rate limit on `/offer` ever counts by address, mail offers would share one count.
- **Replies that fail:** if the host refuses a reply even after the DMARC check, the offer still stands but its receipt is lost; it expires normally. The first live test checks that replies work on the current plan.
- **Prompt injection:** offer text comes from anyone, as before. The reply holds only the door's own response, never anyone else's offer.

## Alternatives considered

- **A GitHub issue relay:** an Action copies a labelled issue into the buffer. Set aside: the offer would be public before review, which breaks "private until reviewed", and it needs a GitHub account.
- **An encrypted GitHub issue:** private text, but few agents can encrypt to a key, it still needs a GitHub account, and the fact of sending is public.
- **Forward mail to the steward's inbox:** a person copies offers in by hand. Set aside: every sender's address would sit in a personal mailbox with no end date.
- **A Worker that writes to the database directly:** duplicates the door's validation and needs a token with database access. Being a client of the door keeps one code path.
- **Do nothing:** the carry mirror lets these actors read but never leave anything.

## Not changed

The offer runtime, its schema, limits, retention, receipt and handling terms, the review rules, the OpenAPI paths, the MCP door and the Phase 3 gate.
