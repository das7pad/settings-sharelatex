fs = require "fs"
path = require "path"
env = (process.env.NODE_ENV or "development").toLowerCase()

merge = (settings, defaults) ->
	for key, value of settings
		if typeof(value) == "object" and value not instanceof Array
			defaults[key] = merge(settings[key], defaults[key] or {})
		else
			defaults[key] = value
	return defaults

possibleDefaultSettingsPaths = [
	path.normalize(__dirname + "/../../config/settings.defaults"),
	path.normalize(process.cwd() + "/config/settings.defaults"),
]

defaults = {}
settingsExist = false

for defaultSettingsPath in possibleDefaultSettingsPaths
	if fs.existsSync("#{defaultSettingsPath}.coffee") or fs.existsSync("#{defaultSettingsPath}.js")
		defaults = require(defaultSettingsPath)
		settingsExist = true
		break

if process.env.SHARELATEX_CONFIG?
	possibleConfigFiles = [process.env.SHARELATEX_CONFIG]
else
	possibleConfigFiles = [
		process.cwd() + "/config/settings.#{env}.js"
		path.normalize(__dirname + "/../../config/settings.#{env}.js")
		process.cwd() + "/config/settings.#{env}.coffee"
		path.normalize(__dirname + "/../../config/settings.#{env}.coffee")
	]

for file in possibleConfigFiles
	if fs.existsSync(file)
		module.exports = merge(require(file), defaults)
		settingsExist = true
		break

if !settingsExist
	console.warn "No settings or defaults found. I'm flying blind."

module.exports = defaults
