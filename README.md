# Vault AI

Canonical MPS source: `modula.product.json` (1.0). Published ID stays `digital.modula.vault-notes.ai`.

Vault AI is the separately versioned, provider-neutral AI add-on for `digital.modula.vault-notes`. Vault Notes does not import this repository. Greenfield resolves the add-on target, permissions, contributions, functions, AI engine binding, and scoped note invocation.

Initial actions are summarise current note, rewrite selected text, generate title, extract tasks, and ask about the current note. With no real configured provider, the honest result is `AI_PROVIDER_UNAVAILABLE`. The deterministic provider is guarded by both `NODE_ENV=test` and `VAULT_AI_TEST_ONLY=true`.

Version 0.5.0 owns those actions, contributions, and product settings in a validated frontend artifact. Its signed AI action declarations execute through Greenfield's generic AI engine broker; the product has no HTTP backend or provider credentials. It is rendered by the generic Modula Product Host and does not require a Vault AI branch in `modula-latest`. This release does not mutate any earlier immutable tag.

The add-on never queries Vault Notes tables and never receives a raw Greenfield session bearer. It consumes only the note resource selected by the capability broker.

Run `pnpm frontend:build`, `pnpm verify`, and `pnpm mps verify /path/to/modula-vault-ai` before release.
