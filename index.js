let possibleConfigFiles
const fs = require('fs')
const path = require('path')
const env = (process.env.NODE_ENV || 'development').toLowerCase()

function merge(settings, defaults) {
  for (const key in settings) {
    const value = settings[key]
    if (typeof value === 'object' && !(value instanceof Array)) {
      defaults[key] = merge(settings[key], defaults[key] || {})
    } else {
      defaults[key] = value
    }
  }
  return defaults
}

const possibleDefaultSettingsPaths = [
  path.normalize(__dirname + '/../../config/settings.defaults'),
  path.normalize(process.cwd() + '/config/settings.defaults'),
]

let defaults = {}
let settingsExist = false

for (const defaultSettingsPath of possibleDefaultSettingsPaths) {
  if (
    fs.existsSync(`${defaultSettingsPath}.coffee`) ||
    fs.existsSync(`${defaultSettingsPath}.js`)
  ) {
    defaults = require(defaultSettingsPath)
    settingsExist = true
    break
  }
}

if (process.env.SHARELATEX_CONFIG) {
  possibleConfigFiles = [process.env.SHARELATEX_CONFIG]
} else {
  possibleConfigFiles = [
    process.cwd() + `/config/settings.${env}.js`,
    path.normalize(__dirname + `/../../config/settings.${env}.js`),
    process.cwd() + `/config/settings.${env}.coffee`,
    path.normalize(__dirname + `/../../config/settings.${env}.coffee`),
  ]
}

for (const file of possibleConfigFiles) {
  if (fs.existsSync(file)) {
    module.exports = merge(require(file), defaults)
    settingsExist = true
    break
  }
}

if (!settingsExist) {
  console.warn("No settings or defaults found. I'm flying blind.")
}

module.exports = defaults
