import {afterEach, describe, expect, it} from 'vitest'
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {validateModulaModuleManifest} from '@modula/module-validator'
import {TestOnlyDeterministicProvider, VAULT_AI_PRODUCT_ID, VaultAIError, VaultAIService} from '../src/index.js'

const root = new URL('..', import.meta.url).pathname
const note = {id: 'note-123', title: 'Project Atlas', text: 'A private project note.'}

afterEach(() => {
  delete process.env.VAULT_AI_TEST_ONLY
})

describe('Vault AI provider-neutral service', () => {
  it('reports provider unavailable honestly', async () => {
    await expect(new VaultAIService().summarise(note)).rejects.toMatchObject({code: 'AI_PROVIDER_UNAVAILABLE'})
  })

  it('supports all five real action contracts through one provider interface', async () => {
    process.env.VAULT_AI_TEST_ONLY = 'true'
    const service = new VaultAIService(new TestOnlyDeterministicProvider())
    await expect(service.summarise(note)).resolves.toMatchObject({providerId: 'TEST_ONLY'})
    await expect(service.rewrite(note, 'private project', 'make concise')).resolves.toMatchObject({providerId: 'TEST_ONLY'})
    await expect(service.generateTitle(note)).resolves.toMatchObject({providerId: 'TEST_ONLY'})
    await expect(service.extractTasks(note)).resolves.toMatchObject({providerId: 'TEST_ONLY'})
    await expect(service.askAboutNote(note, 'What is the project?')).resolves.toMatchObject({providerId: 'TEST_ONLY'})
  })

  it('cannot activate the deterministic provider outside explicit tests', () => {
    delete process.env.VAULT_AI_TEST_ONLY
    expect(() => new TestOnlyDeterministicProvider()).toThrow(VaultAIError)
  })
})

describe('Vault AI Standard 2.1 manifest', () => {
  const manifest = JSON.parse(readFileSync(join(root, 'modula.module.json'), 'utf8'))

  it('validates and targets only Vault Notes through declared contracts', () => {
    const result = validateModulaModuleManifest(manifest)
    expect(result.valid, result.issues.map(issue => `${issue.code} ${issue.path}`).join('\n')).toBe(true)
    expect(manifest.id).toBe(VAULT_AI_PRODUCT_ID)
    expect(manifest.extensionProduct.kind).toBe('addon')
    expect(manifest.extensionProduct.targets).toEqual([expect.objectContaining({productId: 'digital.modula.vault-notes'})])
    expect(manifest.permissions.map((item: any) => item.id)).not.toEqual(expect.arrayContaining(['notes.delete', 'notes.export']))
    expect(JSON.stringify(manifest)).not.toMatch(/providerApiKey|accessToken|refreshToken|customSql|remoteEntry|componentCode/)
  })
})

