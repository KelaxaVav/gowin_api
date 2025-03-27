const fs = require('fs');

const file = 'assets'
const data = require(`./${file}.json`);

data.forEach((d, index) => {
    d.id = index + 1;
    // d.settings = JSON.parse(d.settings);
    // d.settings = JSON.parse(d.settings);
    delete d.created_at;
    delete d.updated_at;
    delete d.deleted_at;
});

fs.writeFileSync(`./data/${file}.json`, JSON.stringify(data, null, 2));