# Vault AI

Vault AI is the separately versioned, provider-neutral AI add-on for `digital.modula.vault-notes`. Vault Notes does not import this repository. Greenfield resolves the add-on target, permissions, contributions, functions, service binding, and scoped note invocation.

Initial actions are summarise current note, rewrite selected text, generate title, extract tasks, and ask about the current note. With no real configured provider, the honest result is `AI_PROVIDER_UNAVAILABLE`. The deterministic provider is guarded by both `NODE_ENV=test` and `VAULT_AI_TEST_ONLY=true`.

The add-on never queries Vault Notes tables and never receives a raw Greenfield session bearer. It consumes only the note resource selected by the capability broker.

