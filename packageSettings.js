var sass = require("node-sass");
/*
*/

var walk = require("walk"),
	fs = require("fs"),
	path = require("path"),
	walker;

walker = walk.walk(path.join(__dirname, "src"), {});
var cssList = [];
var appUrl = process.env.APP_URL || "khabrona.info";
var appName = process.env.APP_NAME || "Khabrona.Info";

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
