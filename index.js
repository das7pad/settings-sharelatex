const fs = require('fs')
const Path = require('path')

function merge(settings, defaults) {
  for (const [key, value] of Object.entries(settings)) {
    // null and Array are false positive objects
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      defaults[key] = merge(settings[key], defaults[key] || {})
    } else {
      defaults[key] = value
    }
  }
  return defaults
}

function resolveConfigPath(configPath) {
  for (const extension of ['', '.js', '.json', '.coffee']) {
    const fullConfigPath = `${configPath}${extension}`
    try {
      const stat = fs.statSync(fullConfigPath)
      if (stat.isDirectory()) continue
      return fullConfigPath
    } catch (e) {}
  }
}

function loadConfig(configPath) {
  if (Path.extname(configPath) === '.coffee') {
    // PERF: lazy-load coffee-script
    // coffee-script will install a module loader
    // (and do lot's of other strange things for stack-traces and such)
    require('coffee-script')
  }
  return require(configPath)
}

function getSettingsFor(mode) {
  const possibleSettingsPaths = [
    Path.join(__dirname, `../../config/settings.${mode}`),
    Path.join(process.cwd(), `config/settings.${mode}`),
  ]

  for (const defaultSettingsPath of possibleSettingsPaths) {
    const configPath = resolveConfigPath(defaultSettingsPath)
    if (!configPath) continue

    return loadConfig(configPath)
  }
  return {}
}

function getCustomSettings() {
  if (process.env.SHARELATEX_CONFIG) {
    const resolvedPath = resolveConfigPath(process.env.SHARELATEX_CONFIG)
    if (!resolvedPath) return {}
    return loadConfig(resolvedPath)
  }

  const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase()
  return getSettingsFor(nodeEnv)
}

function getDefaultSettings() {
  return getSettingsFor('defaults')
}

module.exports = merge(getCustomSettings(), getDefaultSettings())

if (Object.keys(module.exports).length === 0) {
  console.warn("No settings or defaults found. I'm flying blind.")
}
