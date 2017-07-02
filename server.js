var npmRun = require('npm-run');

npmRun.exec('npm run build-server', { cwd: __dirname }, function (err, stdout, stderr) {
    npmRun.exec('npm run build-css', { cwd: __dirname }, function (err, stdout, stderr) {
        npmRun.exec('./node_modules/.bin/react-scripts build', { cwd: __dirname }, function (err, stdout, stderr) {
            var app = require('./webserver');
        });
    });
});