const join = require('path').join;
const { readdir, lstatSync, readFile } = require('fs');

const getPackagesAllPaths = (packagesDirectory) => {
    return new Promise((resolve, reject) => {
        readdir(packagesDirectory, (err, paths) => {
            if (err) {
                return reject(err);
            }

            const packagesPaths = paths
                .map((file) => join(packagesDirectory, file))
                .filter((filePath) => lstatSync(filePath).isDirectory());

            resolve(packagesPaths);
        });
    });
};

const getPackageJson = (packagePath) => {
    return new Promise((resolve, reject) => {
        const packageJsonPath = join(packagePath, 'package.json');
        readFile(packageJsonPath, 'UTF-8', (err, data) => {
            if (err) {
                return reject(err);
            }

            resolve({
                path: packageJsonPath,
                contents: JSON.parse(data)
            });
        });
    });
};

const getAllPackageJsons = async (rootDirectory) => {
    // we get all because the name of the package and the name of the package dir might be different
    const paths = await getPackagesAllPaths(join(rootDirectory, 'packages'));

    const packages = await Promise.all(paths.map((p) => getPackageJson(p)));

    return packages;
};

module.exports = { getAllPackageJsons };