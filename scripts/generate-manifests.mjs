#!/usr/bin/env node
import {readFileSync, writeFileSync} from 'node:fs'
import {vaultNotesStandard21ManifestFixture} from '@modula/module-fixtures'
import {createDefaultModuleSectionVersions, manifestChecksum} from '@modula/module-standard'

const id = 'digital.modula.vault-notes.ai'
const targetId = 'digital.modula.vault-notes'
const version = JSON.parse(readFileSync('package.json', 'utf8')).version
const sourceCommit = process.argv[2] ?? '0000000000000000000000000000000000000000'
const releaseTag = `vault-ai-v${version}`
const standard = replaceProduct(vaultNotesStandard21ManifestFixture, 'digital.modula.vault-notes', id)

Object.assign(standard, {
  id,
  slug: 'vault-ai',
  name: 'Vault AI',
  description: 'Provider-neutral governed AI add-on for Vault Notes with scoped, user-triggered actions.',
  moduleVersion: version,
  publisher: {id: 'modula', name: 'Modula', website: 'https://modula.digital', supportUrl: 'https://modula.digital/support'},
  compatibility: {host: '^1.0.0', runtime: '^1.0.0', standard: '^2.1.0', platforms: ['ios', 'android', 'web', 'server']},
  permissions: permissions().map(({permission, ...item}) => ({id: permission, ...item, required: true, policyMode: item.risk === 'high' ? 'require-confirmation' : 'observe'})),
  capabilities: [
    {id: 'ai', required: true, reason: 'Execute provider-neutral AI actions through Greenfield.'},
    {id: 'functions', required: true, reason: 'Expose reusable headless Vault AI functions.'},
    {id: 'services', required: true, reason: 'Use a Greenfield-scoped extension service binding.'},
    {id: 'ui-contributions', required: true, reason: 'Publish declarative Vault Notes actions and commands.'},
    {id: 'jobs', required: true, reason: 'Run bounded asynchronous AI work.'},
    {id: 'events', required: true, reason: 'Subscribe to declared Vault Notes events when granted.'},
    {id: 'automations', required: true, reason: 'Expose approved headless functions to governed automations.'},
  ],
  records: [],
  views: [],
  actions: [],
  functions: functions(),
  settings: [],
  events: [],
  automations: [],
  search: [],
  migrations: {dataSchemaVersion: '1.0.0', steps: []},
  release: {repository: 'modula-mod/modula-vault-ai', commitSha: sourceCommit, checksum: '0'.repeat(64), licenseEvidence: ['LICENSE', 'README.md', 'SECURITY.md'], signing: {signed: false}, channel: 'stable', reviewStatus: 'approved', securityAdvisories: []},
  backend: backend(),
  extensionProduct: extensionProduct(),
})
standard.identity = {version: '2.1.0', metadata: {moduleId: id, publisherId: 'modula'}}
standard.dependencyGraph = {version: '2.1.0', requires: [{moduleId: targetId, versionRange: '>=1.2.0 <2.0.0', reason: 'Vault AI extends Vault Notes through public contracts.', capabilityIds: ['notes.read', 'notes.editor.contribute', 'notes.actions.contribute']}], optional: [], recommended: [], conflicts: [], replaces: [], provides: [{id: `${id}.functions`, title: 'Vault AI headless functions', version, kind: 'service'}]}
standard.serviceRegistry = {version: '2.1.0', items: [{id: `${id}.service`, title: 'Vault AI service', kind: 'ai', version, contract: `${id}.service.v1`, permissions: ['notes.read', 'ai.request'], capabilities: ['vault.ai.complete'], inputSchemaRef: 'schemas/vault-ai-request.schema.json', outputSchemaRef: 'schemas/vault-ai-result.schema.json', timeoutMs: 15000, rateLimitPerMinute: 30, invocationDepthLimit: 2}]}
standard.jobRegistry = {version: '2.1.0', items: [{id: `${id}.job.completion`, title: 'Vault AI completion', kind: 'queue', functionId: `${id}.function.summarise`, retryPolicy: {maximumAttempts: 3, backoff: 'exponential'}, pausedByDefault: false}]}
standard.storageModel = {version: '2.1.0', items: [{id: `${id}.storage.derived`, title: 'Vault AI derived state', version: '1.0.0', kind: 'structured-records', scope: 'account', quotaBytes: 5_000_000, retentionPolicy: 'extension-owned', encrypted: true, exportSupported: true, deletionSupported: true}]}
standard.widgetRegistry = {version: '2.1.0', items: []}
standard.navigationRegistry = {version: '2.1.0', items: []}
standard.uiContributions = {version: '2.1.0', items: []}
standard.eventBus = {version: '2.1.0', items: [{id: `${id}.subscription.note-updated`, title: 'Vault note updated subscription', events: ['vault.note.updated.v1']}]}
standard.capabilityDiscovery = {version: '2.1.0', supportsBackend: true, supportsWidgets: false}
standard.permissionModel = {version: '2.1.0', categories: {data: standard.permissions.filter(item => item.id.startsWith('notes.')), ai: standard.permissions.filter(item => item.id.startsWith('ai.'))}}
standard.versioning = {version: '2.1.0', moduleVersion: version, standardVersion: '2.1.0', manifestVersion: '2.1.0'}
standard.compatibilityMatrix = {version: '2.1.0', moduleStandardVersion: '^2.1.0', runtimeVersion: '^1.0.0', platforms: ['ios', 'android', 'web', 'server']}
standard.marketplace = {...standard.marketplace, version: '2.1.0', repository: 'modula-mod/modula-vault-ai', backendMode: 'module-managed', aiSupport: true, downloads: 0}
standard.engineReadiness = {version: '2.1.0', engines: ['declarative-ui', 'functions', 'ai']}

const greenfield = {
  manifestVersion: 2,
  moduleId: id,
  name: 'Vault AI',
  description: 'Provider-neutral governed AI add-on for Vault Notes.',
  version,
  standardVersion: '2.1.0',
  sectionVersions: createDefaultModuleSectionVersions('2.1.0'),
  publisher: {publisherId: 'modula', displayName: 'Modula', website: 'https://modula.digital'},
  source: {provider: 'github', repository: 'modula-mod/modula-vault-ai', commit: sourceCommit, manifestPath: 'module.manifest.json', releaseTag, releaseAssetName: `modula-vault-ai-${version}.tgz`},
  license: {status: 'firstParty', evidenceIds: ['LICENSE', 'README.md', 'SECURITY.md']},
  trust: {requestedLevel: 'firstParty'},
  compatibility: {minimumGreenfieldVersion: '0.1.0', minimumModulaHostVersion: '0.1.0', protocolVersions: ['greenfield.v1'], platforms: ['ios', 'android', 'web', 'server']},
  permissions: permissions(),
  dependencies: [{moduleId: targetId, versionRange: '>=1.2.0 <2.0.0', optional: false, reason: 'Vault AI extends Vault Notes.'}],
  contributions: {
    functions: functions().map(item => ({id: `${item.id}.registration`, title: item.title, functionId: item.id, mode: 'remoteHttp', inputSchemaRef: 'schemas/vault-ai-request.schema.json', outputSchemaRef: 'schemas/vault-ai-result.schema.json', executionRequired: true})),
    tools: [{id: `${id}.tool.summarise`, title: 'Summarise with Vault AI', toolId: `${id}.tool.summarise`, functionId: `${id}.function.summarise`, surfaces: ['composer-tools', 'vault-notes']}],
    jobs: [{id: `${id}.job.completion`, title: 'Vault AI completion', jobType: 'vault-ai.completion.v1', mode: 'backgroundJob'}],
    events: [{id: `${id}.events.note-updated`, title: 'Note updated', eventType: 'vault.note.updated.v1', direction: 'subscribes'}],
  },
  backend: backend(),
  integrity: {manifestSha256: '', releaseSha256: '0'.repeat(64)},
  extensionProduct: extensionProduct(),
}
greenfield.integrity.manifestSha256 = manifestChecksum({...greenfield, integrity: {...greenfield.integrity, manifestSha256: ''}})

writeJson('modula.module.json', standard)
writeJson('module.manifest.json', greenfield)

function permissions() {
  return [
    {permission: 'notes.read', reason: 'Read only the user-selected note for an invoked AI action.', risk: 'low'},
    {permission: 'notes.search', reason: 'Search Vault Notes only when the user requests AI-assisted search.', risk: 'medium'},
    {permission: 'notes.update', reason: 'Apply a reviewed AI result to the selected note.', risk: 'medium'},
    {permission: 'notes.editor.contribute', reason: 'Register declared AI editor commands.', risk: 'low'},
    {permission: 'notes.actions.contribute', reason: 'Register declared note actions.', risk: 'low'},
    {permission: 'notes.events.subscribe', reason: 'Subscribe to versioned Vault Notes events after approval.', risk: 'medium'},
    {permission: 'ai.request', reason: 'Invoke a configured real AI provider through Greenfield.', risk: 'medium'},
    {permission: 'ai.context.private', reason: 'Use the explicitly selected private note as bounded context.', risk: 'high'},
    {permission: 'ai.structured-output', reason: 'Validate structured AI results before returning them.', risk: 'medium'},
  ]
}

function functions() {
  return [
    functionDefinition('summarise', 'Summarise current note', ['notes.read']),
    functionDefinition('rewrite', 'Rewrite selected text', ['notes.read', 'notes.update']),
    functionDefinition('generate-title', 'Generate title', ['notes.read', 'notes.update']),
    functionDefinition('extract-tasks', 'Extract tasks', ['notes.read']),
    functionDefinition('ask-note', 'Ask about current note', ['notes.read']),
  ]
}

function functionDefinition(key, title, requestedPermissions) {
  return {id: `${id}.function.${key}`, title, inputSchema: {type: 'object', required: ['noteId'], properties: {noteId: {type: 'string'}}}, outputSchema: {type: 'object', required: ['text'], properties: {text: {type: 'string'}}}, permissions: [...requestedPermissions, 'ai.request'], aiCallable: true, automationCallable: true, idempotent: true, sideEffects: key === 'rewrite' || key === 'generate-title' ? ['record-write-after-confirmation'] : [], timeoutMs: 15000, rateLimit: {windowSeconds: 60, maxCalls: 30}, audit: {event: 'extension.action.invoked', includeInput: false, includeOutput: false}, confirmationPolicy: {required: key === 'rewrite' || key === 'generate-title', risk: key === 'rewrite' || key === 'generate-title' ? 'medium' : 'low'}}
}

function extensionProduct() {
  const target = point => `${targetId}.${point}`
  return {
    version,
    kind: 'addon',
    targets: [{productId: targetId, versionRange: '>=1.2.0 <2.0.0', requiredCapabilities: ['notes.read', 'notes.search', 'notes.update', 'notes.editor.contribute', 'notes.actions.contribute', 'notes.events.subscribe'], requiredExtensionPoints: [target('note.actions'), target('editor.command'), target('editor.toolbar'), target('settings.section')]}],
    extensionPoints: [{id: `${id}.research.source`, title: 'Vault AI research sources', contributionKinds: ['search.provider'], requiredCapability: 'notes.search', maxContributions: 10}],
    contributions: [
      contribution('summarise-action', 'Summarise', 'menu.item', target('note.actions'), 'summarise', 'notes.read', true),
      contribution('ask-action', 'Ask AI', 'menu.item', target('note.actions'), 'ask-note', 'notes.read', true),
      contribution('rewrite-command', 'Rewrite', 'editor.command', target('editor.command'), 'rewrite', 'notes.read', true),
      contribution('extract-tasks-command', 'Extract tasks', 'editor.command', target('editor.command'), 'extract-tasks', 'notes.read', true),
      contribution('title-action', 'Generate title', 'toolbar.action', target('editor.toolbar'), 'generate-title', 'notes.read', true),
      contribution('settings-section', 'AI preferences', 'settings.section', target('settings.section'), 'ask-note', 'notes.actions.contribute', false),
      contribution('composer-tool', 'Summarise with Vault AI', 'composer.tool', target('composer.tool'), 'summarise', 'notes.read', true),
    ],
    retention: {defaultMode: 'KEEP_DATA', supportsUserChoice: true, metadataNamespace: id},
    graphPolicy: {maxDepth: 8, maxNodes: 128},
  }
}

function contribution(key, title, kind, extensionPoint, functionKey, requiredCapability, requiresOnline) {
  return {id: `${id}.contribution.${key}`, title, kind, extensionPoint, functionId: `${id}.function.${functionKey}`, requiredCapability, availability: {platforms: ['ios', 'android', 'web'], requiresOnline, requiredCapabilities: ['ai.request']}, priority: 100}
}

function backend() {
  const actions = ['summarise', 'rewrite', 'generate-title', 'extract-tasks', 'ask-note'].map(key => ({actionId: `${id}.function.${key}`, title: key, method: 'POST', path: `/v1/actions/${key}`, inputSchema: 'schemas/vault-ai-request.schema.json', outputSchema: 'schemas/vault-ai-result.schema.json', permissions: functions().find(item => item.id.endsWith(key))?.permissions ?? ['notes.read', 'ai.request'], idempotent: true, timeoutMs: 15000, sideEffects: key === 'rewrite' || key === 'generate-title' ? 'internal-write' : 'none', confirmation: key === 'rewrite' || key === 'generate-title' ? 'user' : 'none'}))
  return {mode: 'module-managed', protocolVersion: '1.0.0', endpoints: {baseUrlStrategy: 'registry', apiVersion: '1.0.0', discoveryPath: '/.well-known/modula-module.json', healthPath: '/v1/health', capabilitiesPath: '/v1/capabilities', actionsPath: '/v1/actions', allowedHosts: ['vault-ai.modula.digital']}, authentication: {strategy: 'greenfield-signed-jwt', tokenExchangeRequired: true, audience: 'modula-vault-ai', tokenTtlSeconds: 120, sessionExchangePath: '/v1/session/exchange'}, trust: {publisherId: 'modula', allowedOrigins: ['https://vault-ai.modula.digital']}, data: {primaryStore: 'module-backend', categories: [{id: 'vault-ai-derived-state', description: 'Vault AI extension-owned summaries, preferences, and derived metadata.', location: 'module-backend', classification: 'private', exportable: true, deletable: true}], exportSupported: true, deletionSupported: true, backupResponsibility: 'publisher'}, deployment: {ownership: 'modula-hosted', multiTenant: true, selfHostingSupported: false}, actions}
}

function replaceProduct(value, from, to) {
  return JSON.parse(JSON.stringify(value).split(from).join(to))
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
}
