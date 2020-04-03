const spawn = require('child_process').spawn;
const join = require('path').join;
const { readFile, writeFile } = require('fs');
const { getAllPackageJsons } = require('../shared/packages-json-helpers');

const packageInJson = (packageNames, name) => {
    return packageNames.some(n => n === name);
};

const filterInternalDeps = (deps, packageNames) => {
    return packageFilter(deps, (name) => !packageInJson(packageNames, name));
};

const packageFilter = (originalDependencies, filter) => {
    return Object.entries(originalDependencies || {}).filter(([name]) => {
        return filter(name);
    }).reduce((filteredDependencies, [name, version]) => ({ ...filteredDependencies, [name]: version }), {});
};

const writePackageJson = (packageSource, contents) => {
    return new Promise((resolve, reject) => {

        const location = join(packageSource, 'package.json');
        const data = JSON.stringify(contents, null, 4);

        writeFile(location, data, (err) => {
            if (err) {
                return reject(err);
            }

            resolve();
        });

    });
};

const getPackageJson = (packageSource) => {
    return new Promise((resolve, reject) => {

        readFile(join(packageSource, 'package.json'), 'UTF-8', (err, data) => {
            if (err) {
                return reject(err);
            }

            resolve(JSON.parse(data));
        });
    });
};

const runNpmAudit = () => {

    return new Promise((resolve, reject) => {
        const npmCommand = process.platform === 'win32'
            ? 'npm.cmd'
            : 'npm';

        const child = spawn(npmCommand, ['audit'], { stdio: 'inherit' });

        child.on('error', reject);
        child.on('exit', () => {
            // if (code === 1) {
            //     console.log('COODEEEEE 1111111111111');
            //     return reject(`Failed audit at package: ${packageName}.`);
            // }
            resolve();
        });
    });
};

const removeInternalDependencies = (packageJson, allPackagesNames) => {
    packageJson.dependencies = filterInternalDeps(packageJson.dependencies, allPackagesNames);
    packageJson.devDependencies = filterInternalDeps(packageJson.devDependencies, allPackagesNames);
};

const audit = async () => {
    const packageRoot = process.cwd();

    const packageJsonOriginal = await getPackageJson(packageRoot);

    try {
        const currentWorkingJson = JSON.parse(JSON.stringify(packageJsonOriginal));

        const allPackages = await getAllPackageJsons(join(packageRoot, '../../'));
        const allPackagesNames = allPackages.map((p) => p.contents.name);

        removeInternalDependencies(currentWorkingJson, allPackagesNames);

        await writePackageJson(packageRoot, currentWorkingJson);

        await runNpmAudit(packageJsonOriginal.name);

        await writePackageJson(packageRoot, packageJsonOriginal);
    } catch (error) {
        await writePackageJson(packageRoot, packageJsonOriginal);
        throw new Error(error);
    }
};

module.exports = audit;