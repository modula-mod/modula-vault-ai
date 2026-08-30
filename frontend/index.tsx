import {Button, ErrorState, Field, Form, Metadata, action, defineFrontend, screen, useCapability, useSettings} from "@modula/product-ui";

const summarise = action({id: "digital.modula.vault-notes.ai.function.summarise", family: "function.invoke", label: "Summarise", functionId: "digital.modula.vault-notes.ai.function.summarise"});
const askNote = action({id: "digital.modula.vault-notes.ai.function.ask-note", family: "function.invoke", label: "Ask AI", functionId: "digital.modula.vault-notes.ai.function.ask-note"});
const rewrite = action({id: "digital.modula.vault-notes.ai.function.rewrite", family: "function.invoke", label: "Rewrite", functionId: "digital.modula.vault-notes.ai.function.rewrite"});
const extractTasks = action({id: "digital.modula.vault-notes.ai.function.extract-tasks", family: "function.invoke", label: "Extract tasks", functionId: "digital.modula.vault-notes.ai.function.extract-tasks"});
const generateTitle = action({id: "digital.modula.vault-notes.ai.function.generate-title", family: "function.invoke", label: "Generate title", functionId: "digital.modula.vault-notes.ai.function.generate-title"});
const saveSettings = action({id: "saveAiSettings", family: "settings.update", label: "Save AI preferences", settingsKey: "vaultAi.preferences"});

function AiSettings() {
  const preferences = useSettings({id: "preferences", key: "vaultAi.preferences"});
  const provider = useCapability({id: "provider", capability: "ai.generate"});
  return <Form accessibility={{label: "Vault AI settings", role: "form"}}><Metadata label="AI provider status" binding={provider} /><Field binding={preferences} field={{id: "concise", type: "boolean", label: "Prefer concise responses"}} /><Field binding={preferences} field={{id: "includeSources", type: "boolean", label: "Include source references when available"}} /><Button label="Save AI preferences" action={saveSettings} /></Form>;
}

export default defineFrontend({
  mode: "host-contribution",
  hostRuntime: {versionRange: ">=1.0.0 <2.0.0"},
  screens: [screen("settings", "settings", "Vault AI settings", AiSettings, {states: {capabilityUnavailable: <ErrorState label="No AI provider is configured. Vault AI will not generate or simulate output." accessibility={{role: "status"}} />, error: <ErrorState label="Vault AI settings are unavailable" accessibility={{role: "status"}} />}})],
  actions: [summarise, askNote, rewrite, extractTasks, generateTitle, saveSettings],
  contributions: [
    {id: "digital.modula.vault-notes.ai.contribution.summarise-action", target: "digital.modula.vault-notes/note.actions@1", action: summarise, component: <Button label="Summarise" action={summarise} />, requiredPermissions: ["notes.read.selected", "ai.request"], requiredCapabilities: ["ai.generate"]},
    {id: "digital.modula.vault-notes.ai.contribution.ask-action", target: "digital.modula.vault-notes/note.actions@1", action: askNote, component: <Button label="Ask AI" action={askNote} />, requiredPermissions: ["notes.read.selected", "ai.request"], requiredCapabilities: ["ai.generate"]},
    {id: "digital.modula.vault-notes.ai.contribution.rewrite-command", target: "digital.modula.vault-notes/editor.command@1", action: rewrite, component: <Button label="Rewrite" action={rewrite} />, requiredPermissions: ["notes.read.selected", "ai.request"], requiredCapabilities: ["ai.generate"]},
    {id: "digital.modula.vault-notes.ai.contribution.extract-tasks-command", target: "digital.modula.vault-notes/editor.command@1", action: extractTasks, component: <Button label="Extract tasks" action={extractTasks} />, requiredPermissions: ["notes.read.selected", "ai.request"], requiredCapabilities: ["ai.generate"]},
    {id: "digital.modula.vault-notes.ai.contribution.title-action", target: "digital.modula.vault-notes/editor.toolbar@1", action: generateTitle, component: <Button label="Generate title" action={generateTitle} />, requiredPermissions: ["notes.read.selected", "ai.request"], requiredCapabilities: ["ai.generate"]},
    {id: "digital.modula.vault-notes.ai.contribution.settings-section", target: "digital.modula.vault-notes/settings.section@1", settingsView: "settings"},
    {id: "digital.modula.vault-notes.ai.contribution.composer-tool", target: "digital.modula.vault-notes/composer.tool@1", action: summarise, component: <Button label="Summarise with Vault AI" action={summarise} />, requiredPermissions: ["notes.read.selected", "ai.request"], requiredCapabilities: ["ai.generate"]},
  ],
  settings: {viewId: "settings"},
  accessibility: {declaration: "host-baseline-with-product-semantics", screenReader: true, scalableText: true, keyboardNavigation: true, reduceMotion: true},
});
