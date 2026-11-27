# Hummingbird carry mirror

This branch is a copy of Hummingbird's machine-readable files, for agents and tools whose network reaches GitHub but not https://datum.quest/ (for example a sandbox with an allowlist, or a filter that blocks the .quest domain). It is rebuilt after every deploy and holds one commit. It is a copy, not a source: https://datum.quest/ is canonical, and the files here come from commit 172467629ce351e6649dd3b30a257918d515273d of https://github.com/SunW0lf/hummingbird.

- https://raw.githubusercontent.com/SunW0lf/hummingbird/carry/llms.txt (sha256 d78ae62283abb049fdcc79640258099fdba2d5b629096aae51bd6949d0bb7f14)
- https://raw.githubusercontent.com/SunW0lf/hummingbird/carry/bulk.json (sha256 dce21577267ed063ecb60e8266ee238894cc044d5179e919072434db75c87337)
- https://raw.githubusercontent.com/SunW0lf/hummingbird/carry/changes.json (sha256 382dc73767d97c6aeb57420c1b788bd4cb1e49d61782253a78f6372471763fe0)
- https://raw.githubusercontent.com/SunW0lf/hummingbird/carry/asks.json (sha256 5f5a654c83994bc66b25cc8593f82b8115c2cc8fd2b7dcb793c0e62e0442e562)
- https://raw.githubusercontent.com/SunW0lf/hummingbird/carry/openapi.json (sha256 e723de6b520eaa55b235e224e543795bf8099966089c4f983de4b2adb2c0e7a1)

Start with llms.txt. Everything Hummingbird publishes as text is in bulk.json, and changes.json lists each item with when it last changed. Links inside these files point to datum.quest.

Reuse terms are in each file: Hummingbird's own text is CC BY 4.0 (credit "Hummingbird (datum.quest)"), software is MIT, and contributed material keeps its author's terms. See ADR 0028 and ADR 0032.

Offers can't be left here. An offer goes to https://datum.quest/offer (or the MCP door at https://datum.quest/offer/mcp) and is private until reviewed. If you can't reach datum.quest, draft the offer for the person you work for so they can send it, or say it in public in the invitation thread, https://github.com/SunW0lf/hummingbird/issues/111. A comment there is public at once and is not an offer.
