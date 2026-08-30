#!/usr/bin/env node
import {createHash} from 'node:crypto'
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs'
import {join} from 'node:path'
import {validateModulaModuleManifest} from '@modula/module-validator'

const failures = []
const standard = readJson('modula.module.json')
const greenfield = readJson('module.manifest.json')
const product = readJson('modula.product.json')
const packageJson = readJson('package.json')
const check = (condition, message) => condition ? console.log(`PASS ${message}`) : (failures.push(message), console.error(`FAIL ${message}`))
const validation = validateModulaModuleManifest(standard)
check(validation.valid, `Standard 2.1 manifest validates${validation.valid ? '' : `: ${validation.issues.map(issue => `${issue.code} ${issue.path}`).join('; ')}`}`)
check(product.identity.id === 'digital.modula.vault-notes.ai' && product.identity.version === packageJson.version, 'Vault AI MPS identity matches package')
check(standard.id === product.identity.id && standard.moduleVersion === packageJson.version && greenfield.version === packageJson.version, 'compatibility identities match MPS')
check(standard.extensionProduct?.kind === 'addon' && standard.extensionProduct.targets?.[0]?.productId === 'digital.modula.vault-notes', 'Vault Notes target declared')
check(standard.extensionProduct.contributions.length >= 7, 'dynamic contributions declared')
check(standard.functions.some(item => item.id.endsWith('.function.ask-note')), 'ask-note function declared')
check(!standard.permissions.some(item => ['notes.delete', 'notes.export'].includes(item.id)), 'delete and export capabilities absent')
check(greenfield.backend?.endpoints?.baseUrlStrategy === 'registry' && !JSON.stringify(greenfield.backend).includes('http://'), 'service origin is registry-governed')
check(greenfield.backend?.authentication?.tokenExchangeRequired === true && greenfield.backend.authentication.tokenTtlSeconds <= 900, 'short-lived Greenfield token exchange required')
check(packageJson.files.includes('frontend/frontend.manifest.json') && !packageJson.files.includes('frontend'), 'release package includes only the compiled frontend')

const frontendPath = product.frontend?.artifact?.path
check(product.frontend?.mode === 'host-contribution' && frontendPath === 'frontend/frontend.manifest.json' && existsSync(frontendPath), 'product-owned host contribution artifact exists')
if (frontendPath && existsSync(frontendPath)) {
  const bytes = readFileSync(frontendPath)
  const frontend = JSON.parse(bytes.toString('utf8'))
  const hash = createHash('sha256').update(bytes).digest('hex')
  check(hash === product.frontend.artifact.sha256 && hash === product.release.provenance.frontendSha256, 'frontend hash and provenance match')
  check(frontend.productId === product.identity.id && frontend.releaseVersion === packageJson.version && frontend.mode === 'host-contribution', 'frontend identity and mode match')
  for (const declaration of product.contributions) check(frontend.contributions.some(item => item.id === declaration.id && item.target === declaration.target), `frontend contribution matches MPS declaration: ${declaration.id}`)
  check(frontend.views.some(view => view.id === 'settings') && frontend.settings?.viewId === 'settings', 'Vault AI owns its settings view')
  const unavailable = frontend.views.find(view => view.id === 'settings')?.states?.capabilityUnavailable?.text
  check(typeof unavailable === 'string' && unavailable.includes('No AI provider is configured') && unavailable.includes('not generate or simulate output'), 'provider unavailable UI is honest')
  check(frontend.routes === undefined && frontend.entry === undefined, 'add-on does not invent a standalone app')
}

const text = JSON.stringify({product, standard, greenfield}) + collectText('src') + collectText('scripts')
for (const prohibited of ['SELECT * FROM vault_notes', 'greenfield session bearer', 'providerApiKey', 'accessToken', 'refreshToken', 'customSql', 'remoteEntry', 'componentCode', 'dangerouslySetInnerHTML', 'rawJs', 'rawHtml']) check(!text.includes(prohibited), `prohibited construct absent: ${prohibited}`)
check(text.includes('AI_PROVIDER_UNAVAILABLE'), 'provider unavailable runtime state is explicit')
check(text.includes('TEST_ONLY'), 'deterministic provider is visibly test-only')
if (failures.length) process.exit(1)
console.log('Vault AI release verifier passed')

function readJson(path) { return JSON.parse(readFileSync(path, 'utf8')) }
function collectText(dir) {
  let result = ''
  for (const entry of readdirSync(dir)) {
    if (['.git', 'node_modules', 'dist', 'release', 'verify-release.mjs'].includes(entry)) continue
    const path = join(dir, entry)
    const stat = statSync(path)
    result += stat.isDirectory() ? collectText(path) : /\.(json|ts|md|mjs)$/.test(entry) ? readFileSync(path, 'utf8') : ''
  }
  return result
}
