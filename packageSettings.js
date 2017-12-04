var sass = require("node-sass");
/*
*/

var walk = require("walk"),
	fs = require("fs"),
	path = require("path"),
	request = require("request"),
	walker;
// https://www.refugee.info/css/app.css
var cssList = [];
var appUrl = process.env.APP_URL || "khabrona.info";
var appName = process.env.APP_NAME || "Khabrona.Info";

request.get("https://www.refugee.info/css/app.css", (e, r, b) => {
	cssList.push(b);
	walker = walk.walk(path.join(__dirname, "src"), {});

	walker.on("file", function(root, fileStats, next) {
		if (fileStats.name.endsWith("scss")) {
			sass.render({ file: path.join(root, fileStats.name) }, function(err, result) {
				cssList.push(result.css.toString());
				next();
			});
		} else {
			next();
		}
	});

	walker.on("errors", function(root, nodeStatsArray, next) {
		next();
	});

	walker.on("end", function() {
		var css = cssList.join("\n");
		var config = {
			app: {
				name: appName,
				url: appUrl,
			},
			css,
		};
		fs.writeFile("config.app.json", JSON.stringify(config), () => {
			console.log("all done");
		});
	});
});
