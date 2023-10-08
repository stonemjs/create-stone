import modules from './src/**/*.mjs'
import configs from './config/**/*.mjs'
import { Application } from '@stone-js/core'

/**
 * Get configurations
 */
const configurations = configs.reduce((all, config) => {
  return {
    ...all,
    ...Object
      .entries(config)
      .reduce((prev, [name, value]) => ({ ...prev, [name]: value }), {})
  }
}, {})

/**
 * Auto Scan services
 */
for (const module of modules) {
  for (const [, value] of Object.entries(module)) {
    if (!value.metadata) {
      continue
    } else if (value.metadata.isMainApp) {
      configurations.app.appModule = value
    } else if (value.metadata.isServiceProvider) {
      configurations.app.providers ??= []
      configurations.app.providers.push(value)
    } else if (value.metadata.isInjectable) {
      configurations.app.bindings ??= []
      configurations.app.bindings.push({ ...value.metadata, value })
    } else if (value.metadata.isListener && value.metadata.hook) {
      configurations.app.hookListeners ??= {}
      configurations.app.hookListeners[value.metadata.event] ??= []
      configurations.app.hookListeners[value.metadata.event].push(value)
    } else if (value.metadata.isListener && !value.metadata.hook) {
      configurations.app.listeners ??= {}
      configurations.app.listeners[value.metadata.event] ??= []
      configurations.app.listeners[value.metadata.event].push(value)
    } else if (value.metadata.isSubscriber) {
      configurations.app.subscribers ??= []
      configurations.app.subscribers.push(value)
    }
  }
}

/**
 * Launch app
 */
export default Application.launch(configurations)