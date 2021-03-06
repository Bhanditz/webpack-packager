var path = require('path');
var utils = require('./utils');

module.exports = function resolveEntries (packages) {
  return function () {
    return Promise.all(packages.map(function (package) {
      var packageName = utils.getPackageName(package);

      return utils.readFile(path.resolve('node_modules', packageName, 'package.json'))
        .then((result) => JSON.parse(result));
    }))
      .then(function (results) {
        return results.reduce(function (entries, packageJson) {
          var main = utils.evaluateEntry(packageJson.main);
          var browser = utils.evaluateEntry(packageJson.browser);
          var module = utils.evaluateEntry(packageJson.module);
          var unpkg = utils.evaluateEntry(packageJson.unpkg);
          var mainEntry = 'index.js';

          if (unpkg && !utils.isPrebundledFile(unpkg)) {
            mainEntry = unpkg;
          } else if (browser && !utils.isPrebundledFile(browser)) {
            mainEntry = browser;
          } else if (module && !utils.isPrebundledFile(module)) {
            mainEntry = module;
          } else if (main && !utils.isPrebundledFile(main)) {
            mainEntry = main;
          }

          if (!path.extname(mainEntry)) {
            mainEntry += '.js';
          }

          entries[packageJson.name] = mainEntry;

          return entries;
        }, {})
      });
  }
}
