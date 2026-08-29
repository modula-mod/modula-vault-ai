# Vault AI — agent instructions

- Product ID (published, immutable): `digital.modula.vault-notes.ai`
- Do **not** rename to `digital.modula.vault-ai`
- Kind: addon
- Family: `digital.modula.vault`
- Requests capability `ai.generate` — never OpenAI/Gemini/Anthropic in the product contract
- Secrets: requirement ID `engine.ai.generate` only. Never values or `secret://`
- Providers may be NOT_CONFIGURED. Do not fake generated text.
- No Greenfield core special cases

Canonical: `modula.product.json`. MPS 1.0-RC.
