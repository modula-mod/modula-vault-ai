#!/usr/bin/env node
import {readFileSync, readdirSync, statSync} from 'node:fs'
import {join} from 'node:path'
import {validateModulaModuleManifest} from '@modula/module-validator'

const failures = []
const standard = readJson('modula.module.json')
const greenfield = readJson('module.manifest.json')
const check = (condition, message) => condition ? console.log(`PASS ${message}`) : (failures.push(message), console.error(`FAIL ${message}`))

const validation = validateModulaModuleManifest(standard)
check(validation.valid, `Standard 2.1 manifest validates${validation.valid ? '' : `: ${validation.issues.map(issue => `${issue.code} ${issue.path}`).join('; ')}`}`)
check(standard.id === 'digital.modula.vault-notes.ai' && standard.moduleVersion === '0.1.0', 'Vault AI immutable identity declared')
check(standard.extensionProduct?.kind === 'addon' && standard.extensionProduct.targets?.[0]?.productId === 'digital.modula.vault-notes', 'Vault Notes target declared')
check(standard.extensionProduct.contributions.length >= 7, 'dynamic contributions declared')
check(standard.functions.some(item => item.id.endsWith('.function.ask-note')), 'ask-note function declared')
check(!standard.permissions.some(item => ['notes.delete', 'notes.export'].includes(item.id)), 'delete and export capabilities absent')
check(greenfield.backend?.endpoints?.baseUrlStrategy === 'registry' && !JSON.stringify(greenfield.backend).includes('http://'), 'service origin is registry-governed')
check(greenfield.backend?.authentication?.tokenExchangeRequired === true && greenfield.backend.authentication.tokenTtlSeconds <= 900, 'short-lived Greenfield token exchange required')
const text = JSON.stringify({standard, greenfield}) + collectText('src') + collectText('scripts')
for (const prohibited of ['SELECT * FROM vault_notes', 'greenfield session bearer', 'providerApiKey', 'accessToken', 'refreshToken', 'customSql', 'remoteEntry', 'componentCode', 'dangerouslySetInnerHTML']) check(!text.includes(prohibited), `prohibited construct absent: ${prohibited}`)
check(text.includes('AI_PROVIDER_UNAVAILABLE'), 'provider unavailable state is explicit')
check(text.includes('TEST_ONLY'), 'deterministic provider is visibly test-only')
if (failures.length) process.exit(1)
console.log('Vault AI release verifier passed')

function readJson(path) { return JSON.parse(readFileSync(path, 'utf8')) }
function collectText(dir) {
  let result = ''
  for (const entry of readdirSync(dir)) {
    if (['.git', 'node_modules', 'dist', 'release'].includes(entry)) continue
    const path = join(dir, entry)
    if (entry === 'verify-release.mjs') continue
    const stat = statSync(path)
    result += stat.isDirectory() ? collectText(path) : /\.(json|ts|md|mjs)$/.test(entry) ? readFileSync(path, 'utf8') : ''
  }
  return result
}
