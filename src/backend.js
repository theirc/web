import feathers from 'feathers/client';
import hooks from 'feathers-hooks';
import auth from 'feathers-authentication-client';
import reduxifyServices, {  } from 'feathers-reduxify-services';

const superagent = require('superagent');
const rest = require('feathers-rest/client');
const { siteConfig } = window;

const url = (siteConfig && siteConfig.serverUrl) || 'http://localhost:8080/api';
const restClient = rest(url);

const client = feathers()
    .configure(restClient.superagent(superagent))
    .configure(hooks())
    .configure(auth())
    ;

const services = reduxifyServices(client, ['articles', 'countries', 'categories']);

export default services;