const { JSON_CONFIG_FILENAME } = require("tslint/lib/configuration");

const fs = require('fs')

const it = JSON.parse(fs.readFileSync('src/i18n/it.json'))

const en = {}
let count = 0
for (const key in it) {
    if (key == 'app.name') {
        en[key] = 'Bike Tracking';
    } else {
        en[key] = key;
    }
    count++
}

fs.writeFileSync('src/i18n/en.default.json', JSON.stringify(en, null, 4))
console.log('write', count, 'keys in src/i18n/en.default.json')