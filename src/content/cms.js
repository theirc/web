import config from "./config";
const contentful = require('contentful');
let client = null;
let siteConfig = null;

for(let key of Object.keys(config)) {
    if(global.window && global.window.location) {
        if(window.location.hostname.indexOf(key) > -1) {
            siteConfig = config[key];
            client = contentful.createClient({
                ...siteConfig
            });
        }
    }
}

export default {
    client, 
    siteConfig
}