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
    {id: 'ui-contributions', required: true, reason: 'Publish declarative Vault Notes actions and commands.'},
  ],
  records: [],
  views: [],
  actions: [],
  functions: functions(),
  settings: [],
  events: [],
  automations: [],
  search: [],
  ai: [{
    id: `${id}.ai.actions`,
    features: ['summarize', 'extract', 'draft'],
    allowedContext: ['record-content', 'user-selected-text'],
    toolDefinitions: [],
    structuredOutputs: [],
    permissions: ['notes.read', 'ai.request', 'ai.context.private'],
    policyMode: 'require-confirmation',
    productActions: aiProductActions(),
  }],
  migrations: {dataSchemaVersion: '1.0.0', steps: []},
  release: {repository: 'modula-mod/modula-vault-ai', commitSha: sourceCommit, checksum: '0'.repeat(64), licenseEvidence: ['LICENSE', 'README.md', 'SECURITY.md'], signing: {signed: false}, channel: 'stable', reviewStatus: 'approved', securityAdvisories: []},
  extensionProduct: extensionProduct(),
})
standard.identity = {version: '2.1.0', metadata: {moduleId: id, publisherId: 'modula'}}
standard.dependencyGraph = {version: '2.1.0', requires: [{moduleId: targetId, versionRange: '>=1.2.0 <2.0.0', reason: 'Vault AI extends Vault Notes through public contracts.', capabilityIds: ['notes.read', 'notes.editor.contribute', 'notes.actions.contribute']}], optional: [], recommended: [], conflicts: [], replaces: [], provides: [{id: `${id}.functions`, title: 'Vault AI engine-backed functions', version, kind: 'capability'}]}
standard.serviceRegistry = {version: '2.1.0', items: []}
standard.jobRegistry = {version: '2.1.0', items: []}
standard.storageModel = {version: '2.1.0', items: []}
standard.widgetRegistry = {version: '2.1.0', items: []}
standard.navigationRegistry = {version: '2.1.0', items: []}
standard.uiContributions = {version: '2.1.0', items: []}
standard.eventBus = {version: '2.1.0', items: []}
standard.capabilityDiscovery = {version: '2.1.0', supportsBackend: false, supportsWidgets: false}
standard.permissionModel = {version: '2.1.0', categories: {data: standard.permissions.filter(item => item.id.startsWith('notes.')), ai: standard.permissions.filter(item => item.id.startsWith('ai.'))}}
standard.versioning = {version: '2.1.0', moduleVersion: version, standardVersion: '2.1.0', manifestVersion: '2.1.0'}
standard.compatibilityMatrix = {version: '2.1.0', moduleStandardVersion: '^2.1.0', runtimeVersion: '^1.0.0', platforms: ['ios', 'android', 'web', 'server']}
standard.marketplace = {...standard.marketplace, version: '2.1.0', repository: 'modula-mod/modula-vault-ai', backendMode: 'engine-backed', aiSupport: true, downloads: 0}
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
    functions: functions().map(item => ({id: `${item.id}.registration`, title: item.title, functionId: item.id, mode: 'builtIn', inputSchemaRef: 'schemas/vault-ai-request.schema.json', outputSchemaRef: 'schemas/vault-ai-result.schema.json', executionRequired: true})),
    tools: [{id: `${id}.tool.summarise`, title: 'Summarise with Vault AI', toolId: `${id}.tool.summarise`, functionId: `${id}.function.summarise`, surfaces: ['composer-tools', 'vault-notes']}],
  },
  ai: {
    features: ['summarise', 'extract', 'generate'],
    prompts: aiProductActions().map(action => action.promptId),
    requiredCapabilities: ['text-generation'],
    dataAccess: {recordScopes: [`${id}.brokered-target`], defaultPolicy: 'account-consent'},
    productActions: aiProductActions(),
  },
  integrity: {manifestSha256: '', releaseSha256: '0'.repeat(64)},
  extensionProduct: extensionProduct(),
}
greenfield.integrity.manifestSha256 = manifestChecksum({...greenfield, integrity: {...greenfield.integrity, manifestSha256: ''}})

writeJson('modula.module.json', standard)
writeJson('module.manifest.json', greenfield)

function permissions() {
  return [
    {permission: 'notes.read', reason: 'Read only the user-selected note for an invoked AI action.', risk: 'low'},
    {permission: 'notes.editor.contribute', reason: 'Register declared AI editor commands.', risk: 'low'},
    {permission: 'notes.actions.contribute', reason: 'Register declared note actions.', risk: 'low'},
    {permission: 'ai.request', reason: 'Invoke a configured real AI provider through Greenfield.', risk: 'medium'},
    {permission: 'ai.context.private', reason: 'Use the explicitly selected private note as bounded context.', risk: 'high'},
  ]
}

function functions() {
  return [
    functionDefinition('summarise', 'Summarise current note', ['notes.read']),
    functionDefinition('rewrite', 'Rewrite selected text', ['notes.read']),
    functionDefinition('generate-title', 'Generate title', ['notes.read']),
    functionDefinition('extract-tasks', 'Extract tasks', ['notes.read']),
    functionDefinition('ask-note', 'Ask about current note', ['notes.read']),
  ]
}

function functionDefinition(key, title, requestedPermissions) {
  return {id: `${id}.function.${key}`, title, inputSchema: {type: 'object', required: ['noteId'], properties: {noteId: {type: 'string'}}}, outputSchema: {type: 'object', required: ['text'], properties: {text: {type: 'string'}}}, permissions: [...requestedPermissions, 'ai.request', 'ai.context.private'], aiCallable: true, automationCallable: false, idempotent: true, sideEffects: [], timeoutMs: 15000, rateLimit: {windowSeconds: 60, maxCalls: 30}, audit: {event: 'extension.action.invoked', includeInput: false, includeOutput: false}, confirmationPolicy: {required: true, risk: 'medium'}}
}

function extensionProduct() {
  const target = point => `${targetId}.${point}`
  return {
    version,
    kind: 'addon',
    targets: [{productId: targetId, versionRange: '>=1.2.0 <2.0.0', requiredCapabilities: ['notes.read', 'notes.editor.contribute', 'notes.actions.contribute'], requiredExtensionPoints: [target('note.actions'), target('editor.command'), target('editor.toolbar'), target('settings.section')]}],
    extensionPoints: [],
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

function aiProductActions() {
  return [
    aiProductAction('summarise', 'Summarise', 'Summarise the explicitly selected note without changing it.'),
    aiProductAction('rewrite', 'Rewrite', 'Return a proposed rewrite for the explicitly selected note without changing it.'),
    aiProductAction('generate-title', 'Generate title', 'Return a proposed title for the explicitly selected note without changing it.'),
    aiProductAction('extract-tasks', 'Extract tasks', 'Extract a proposed task list from the explicitly selected note without changing it.'),
    aiProductAction('ask-note', 'Ask about note', 'Answer using only the explicitly selected note as context.'),
  ]
}

function aiProductAction(key, name, description) {
  return {
    id: `${id}.function.${key}`,
    name,
    description,
    promptId: `${id}.prompt.${key}`,
    promptVersionRange: '^1.0.0',
    inputSchema: 'schemas/vault-ai-request.schema.json',
    outputSchema: 'schemas/vault-ai-result.schema.json',
    requiredPermissions: ['notes.read', 'ai.request', 'ai.context.private'],
    requiredCapabilities: ['text-generation'],
    context: {sources: ['current-record'], maximumRecords: 1, maximumCharacters: 20_000, allowedClassifications: ['private']},
    execution: {streaming: false, structuredOutput: false, maximumToolCalls: 0, timeoutMs: 15_000},
    application: {mode: 'preview-only', explicitConfirmation: true, createsRecordRevision: false},
  }
}

function replaceProduct(value, from, to) {
  return JSON.parse(JSON.stringify(value).split(from).join(to))
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
}
