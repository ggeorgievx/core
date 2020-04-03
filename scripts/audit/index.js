const audit = require('./audit');

audit()
    .then(() => console.log('Audit completed'))
    .catch((packageName) => {
        setTimeout(() => { throw new Error(`${packageName} failed the audit, inspect the console output for details.`); }, 0);
    });
