const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const middleware = require('./middleware');
const bodyParser = require('body-parser');

const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');

const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');
const mustacheExpress = require('mustache-express');
const logger = require('winston');
const less = require('less');
const fs = require('fs');


const app = feathers();

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// Load app configuration
app.configure(configuration());

app.use(middleware);

// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join('build', 'favicon.ico')));

// Set up Plugins and providers
app.configure(hooks());
app.configure(rest());
app.configure(socketio());


app.get('/config', (rq, res) => {
    let config = JSON.stringify({
        serverUrl: process.env.BACKEND_URL,
        hostname: rq.headers.host
    });
    let responseText = `
    window.siteConfig =  ${config}
    `;
    
    res.contentType("application/javascript");
    res.send(responseText);
})

// Host the public folder
app.use('/', feathers.static('build'));

app.get('*', function(request, response, next) {
  response.sendfile(path.join(path.dirname( __dirname), 'build') + '/index.html');
});

app.use(notFound());
app.use(handler());


const port = app.get('port') || process.env.PORT || 3000;
const host = app.get('host') || 'localhost';

app.set('port', port);
app.set('host', host);

const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
    logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
    logger.info(`Feathers application started on ${app.get('host')}:${port}`)
);
