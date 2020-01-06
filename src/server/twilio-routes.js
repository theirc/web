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
    app.get("/get-phone-tree-home/:slug", (req, res ,err) => {
        const selectedLanguage = parseLanguage(req);
        let configKey = _.first(
            Object.keys(conf).filter(k => {
                return req.headers.host.indexOf(k) > -1;
            })
        );
        const {
            slug,
        } = req.params;
        
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
                res.send(c.items[0].fields.initial_message.trim());
            })
            .catch(e => {
                res.redirect(`/${country}/`);
            });
        }catch (e) {
            console.log("ERROR", e);
        }
    });
    app.get("/get-phone-tree-moderator/:slug", (req, res ,err) => {
        const selectedLanguage = parseLanguage(req);
        let configKey = _.first(
            Object.keys(conf).filter(k => {
                return req.headers.host.indexOf(k) > -1;
            })
        );
        const {
            slug,
        } = req.params;
        
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
                res.send(c.items[0].fields.how_can_i_help.trim());
            })
            .catch(e => {
                res.redirect(`/${country}/`);
            });
        }catch (e) {
            console.log("ERROR", e);
        }
    });
    app.get("/get-article/:slug/:category/:article", (req, res, err) => {
        const selectedLanguage = parseLanguage(req);
        let configKey = _.first(
            Object.keys(conf).filter(k => {
                return req.headers.host.indexOf(k) > -1;
            })
        );
        const {
            slug,
            category,
            article
        } = req.params;
        
        languageDictionary = Object.assign(languageDictionary, conf[configKey]);
        let cms = cmsApi(conf[configKey], languageDictionary);
        let locale = languageDictionary[selectedLanguage] || selectedLanguage;
        try{
            cms.client
            .getEntries({
                content_type: "phoneTreeMessage",
                "fields.slug": slug,
                locale: locale,
            })
            .then(c => {
                console.log(c.items[0].fields.options[category-1].fields.article_Detail[article-1]);
                let id = c.items[0].fields.options[category-1].fields.article_Detail[article-1].sys.id;
                cms.client
                .getEntry(id, {
                    locale: locale,
                })
                .then( a => {
                    console.log(a.fields);
                    //let category = a.fields.category.sys.id;
                    // let entities = cms.client.parseEntries(a);
                    // console.log("entities", entities);
                    res.contentType("application/json");
                    let article = { title: a.fields.title, sumary: a.fields.content.substr(0,200)+"...", link: "http://www.cuentanos.org"};
                    res.send(article);
                })
                .catch(e => {
                    console.log(e);
                    res.send(e);
                })

                // res.contentType("application/json");
                // res.send(c.items[0].fields.initial_message.trim());
            })
            .catch(e => {
                res.redirect(`/${country}/`);
            });
        }catch (e) {
            console.log("ERROR", e);
        }
    })
}
