/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let possibleConfigFiles
const fs = require('fs')
const path = require('path')
const env = (process.env.NODE_ENV || 'development').toLowerCase()

var merge = function (settings, defaults) {
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

for (const defaultSettingsPath of Array.from(possibleDefaultSettingsPaths)) {
  if (
    fs.existsSync(`${defaultSettingsPath}.coffee`) ||
    fs.existsSync(`${defaultSettingsPath}.js`)
  ) {
    defaults = require(defaultSettingsPath)
    settingsExist = true
    break
  }
}

if (process.env.SHARELATEX_CONFIG != null) {
  possibleConfigFiles = [process.env.SHARELATEX_CONFIG]
} else {
  possibleConfigFiles = [
    process.cwd() + `/config/settings.${env}.js`,
    path.normalize(__dirname + `/../../config/settings.${env}.js`),
    process.cwd() + `/config/settings.${env}.coffee`,
    path.normalize(__dirname + `/../../config/settings.${env}.coffee`),
  ]
}

for (const file of Array.from(possibleConfigFiles)) {
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
