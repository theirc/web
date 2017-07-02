import feathers from 'feathers/client';
import socketio from 'feathers-socketio/client';
import hooks from 'feathers-hooks';
import errors from 'feathers-errors'; // An object with all of the custom error types.
import auth from 'feathers-authentication-client';
import io from 'socket.io-client/dist/socket.io';
import reduxifyServices, { getServicesStatus } from 'feathers-reduxify-services';

const supercache = require('superagent-cache');
const superagent = require('superagent');
const rest = require('feathers-rest/client');

const url = process.env.BACKEND_URL || 'http://localhost:8080/api'
const restClient = rest(url);

const client = feathers()
    .configure(restClient.superagent(superagent))
    .configure(hooks())
    .configure(auth())

const services = reduxifyServices(client, ['articles', 'countries', 'categories']);

export default services;