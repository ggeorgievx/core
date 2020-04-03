const audit = require('./audit');

audit()
    .then(() => console.log('Audit completed'))
    .catch(console.error);
