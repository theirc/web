const path = require("path");
const compress = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");

const feathers = require("feathers");
const configuration = require("feathers-configuration");
const hooks = require("feathers-hooks");
const rest = require("feathers-rest");
const socketio = require("feathers-socketio");

const handler = require("feathers-errors/handler");
const notFound = require("feathers-errors/not-found");
const mustacheExpress = require("mustache-express");
const logger = require("winston");
const less = require("less");
const fs = require("fs");
const nunjucks = require("nunjucks");
const conf = require("../content/config").default;
const cms = require("../content/cms").default;
const ReactApp = require("../App").default;

const React = require("react");
const renderToString = require("react-dom/server").renderToString;
const { store, history } = require("../store");
const Provider = require("react-redux").Provider;

const app = feathers();
app.configure(configuration());

app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up Plugins and providers
app.configure(hooks());
app.configure(rest());
app.configure(socketio());

app.get("/config", (rq, res) => {
	let serverConf = JSON.stringify({
		serverUrl: process.env.BACKEND_URL,
		hostname: rq.headers.host,
	});

	let config = Object.assign(serverConf, conf);
	let responseText = `
    window.siteConfig =  ${config}
    `;

	res.contentType("application/javascript");
	res.send(responseText);
});

var mainRequest = function(request, response, next) {
	fs.readFile(path.join(path.dirname(path.dirname(__dirname)), "build", "index.html"), (err, data) => {
		if (err) throw err;

		let hostname = request.headers.host;

		nunjucks.renderString(data.toString(), { hostname: hostname }, function(err, compiled) {
			response.send(compiled);
		});
	});
};

// Host the public folder
app.get("/", mainRequest);
app.use("/", feathers.static("build"));

app.get("*", mainRequest);

app.use(notFound());
app.use(handler());

const port = app.get("port") || process.env.PORT || 3000;
const host = app.get("host") || "localhost";

app.set("port", port);
app.set("host", host);

const server = app.listen(port);

process.on("unhandledRejection", (reason, p) => logger.error("Unhandled Rejection at: Promise ", p, reason));

server.on("listening", () => logger.info(`Feathers application started on ${app.get("host")}:${port}`));
