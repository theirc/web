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

const restClient = rest('http://backend.refugee.info/api');

const client = feathers()
    .configure(restClient.superagent(superagent, {
        headers: {
            "Cache-Control": "no-cache"
        }
    }))
    .configure(hooks())
    .configure(auth())

const services = reduxifyServices(client, ['articles', 'countries', 'categories']);

export default services;