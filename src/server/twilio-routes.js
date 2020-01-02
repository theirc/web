const parseLanguage = require('./common.js').parseLanguage;
const _ = require("lodash");
const conf = require("../backend/config");
const cmsApi = require("../backend/cmsApi").default;


let {
	languageDictionary
} = conf;

module.exports = function(app) {
    app.get("/twilio", (req,res) =>{
        res.status(200).json({'test': 'working'})
    })
    app.get("/get-phone-tree/:slug", (req, res ,err) => {
        console.log("init");
        const selectedLanguage = parseLanguage(req);
        console.log(selectedLanguage);
        let configKey = _.first(
            Object.keys(conf).filter(k => {
                return req.headers.host.indexOf(k) > -1;
            })
        );
        console.log("config", configKey);
        const {
            slug,
        } = req.params;
        console.log("slug",slug);
        
        languageDictionary = Object.assign(languageDictionary, conf[configKey]);
        let cms = cmsApi(conf[configKey], languageDictionary);
        try{
            cms.client
            .getEntries({
                content_type: "phoneTreeMessage",
                "fields.slug": slug,
                locale: languageDictionary[selectedLanguage] || selectedLanguage,
            })
            .then(c => {
                res.contentType("application/json");
                res.send(c.items[0].fields.initial_message);
            })
            .catch(e => {
                console.log(e);
                res.redirect(`/${country}/`);
            });
        }catch (e) {
            console.log("ERROR", e);
        }
        
        
    });

}