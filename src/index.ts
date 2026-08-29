export const VAULT_AI_PRODUCT_ID = 'digital.modula.vault-notes.ai' as const
export const VAULT_AI_VERSION = '0.3.0' as const
export const VAULT_AI_TARGET_PRODUCT_ID = 'digital.modula.vault-notes' as const

export type CompletionRequest = {
  operation: 'summarise' | 'rewrite' | 'generate-title' | 'extract-tasks' | 'ask-note'
  note: {id: string; title: string; text: string}
  selection?: string
  instruction?: string
  question?: string
}

export type CompletionResult = {
  text: string
  structured?: Record<string, unknown>
  providerId: string
  modelId: string
  usage?: {inputUnits?: number; outputUnits?: number}
}

export type EmbeddingRequest = {text: string}
export type EmbeddingResult = {vector: number[]; providerId: string; modelId: string}

export interface ModulaAIProvider {
  complete(request: CompletionRequest): Promise<CompletionResult>
  embed?(request: EmbeddingRequest): Promise<EmbeddingResult>
}

export class VaultAIError extends Error {
  constructor(readonly code: 'AI_PROVIDER_UNAVAILABLE' | 'INVALID_REQUEST' | 'PROVIDER_FAILED', message: string) {
    super(message)
    this.name = 'VaultAIError'
  }
}

export class VaultAIService {
  constructor(private readonly provider?: ModulaAIProvider) {}

  summarise(note: CompletionRequest['note']) {
    return this.execute({operation: 'summarise', note})
  }

  rewrite(note: CompletionRequest['note'], selection: string, instruction?: string) {
    if (!selection.trim()) throw new VaultAIError('INVALID_REQUEST', 'A non-empty selection is required')
    return this.execute({operation: 'rewrite', note, selection, instruction})
  }

  generateTitle(note: CompletionRequest['note']) {
    return this.execute({operation: 'generate-title', note})
  }

  extractTasks(note: CompletionRequest['note']) {
    return this.execute({operation: 'extract-tasks', note})
  }

  askAboutNote(note: CompletionRequest['note'], question: string) {
    if (!question.trim()) throw new VaultAIError('INVALID_REQUEST', 'A non-empty question is required')
    return this.execute({operation: 'ask-note', note, question})
  }

  private async execute(request: CompletionRequest): Promise<CompletionResult> {
    if (!this.provider) throw new VaultAIError('AI_PROVIDER_UNAVAILABLE', 'AI provider unavailable')
    try {
      return await this.provider.complete(request)
    } catch (error) {
      if (error instanceof VaultAIError) throw error
      throw new VaultAIError('PROVIDER_FAILED', error instanceof Error ? error.message : 'AI provider failed')
    }
  }
}

/** Deterministic providers are forbidden outside an explicit test process. */
export class TestOnlyDeterministicProvider implements ModulaAIProvider {
  constructor() {
    if (process.env.NODE_ENV !== 'test' || process.env.VAULT_AI_TEST_ONLY !== 'true') {
      throw new VaultAIError('INVALID_REQUEST', 'TEST_ONLY provider is unavailable outside explicit tests')
    }
  }

  async complete(request: CompletionRequest): Promise<CompletionResult> {
    return {
      text: `TEST_ONLY:${request.operation}:${request.note.id}`,
      structured: {testOnly: true, operation: request.operation},
      providerId: 'TEST_ONLY',
      modelId: 'deterministic-fixture',
    }
  }
}
