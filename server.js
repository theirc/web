var npmRun = require('npm-run');

npmRun.exec('npm run build-server', { cwd: __dirname }, function (err, stdout, stderr) {
    var app = require('./distServer');
})