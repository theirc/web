import React, { Component } from "react";
import { translate } from "react-i18next";
import { Helmet } from "react-helmet";
import HeaderBar from "./HeaderBar";

import "./LanguageSelector.css";
import getSessionStorage from "../shared/sessionStorage";

class LocalDemo extends Component {
	static propTypes = {};

	componentDidMount() {
		if (global.window) {
			const sessionStorage = getSessionStorage();
			delete sessionStorage.country;
			delete sessionStorage.dismissedNotifications;
		}
	}
    
	render() {
        const { language, country, t } = this.props;
        const startCache = () =>{
			var CACHE_NAME ='rescue-cache-v3';
			var urlsToCache = [
				'https://cdn.contentful.com/spaces/e17qk44d7f2w/entries?content_type=country&locale=es',
				'https://admin.cuentanos.org/e/production/v2/services/searchlist/?filter=relatives&geographic_region=el-salvador&page=1&page_size=1000&type_numbers=',
				

			];
			
			caches.open(CACHE_NAME)
			.then(function(cache) {
				// Open a cache and cache our files
				urlsToCache.map(url => {
					return fetch(url).then((res)=> {
						var response = res.clone();
						cache.put(url, response);						
					})
				}) 
				//return cache.addAll(urlsToCache);
			})
        }
		return (
			<div className="LocalDemo">
                <Helmet>
					<title>{t('Download data for offline use')}</title>
				</Helmet>
                <HeaderBar title={t('Download data for offline use')} />

                <span>{country.fields.name}</span>
                <span>{language}</span>
                <button onClick={startCache}>{t('Download site')}</button>
			</div>
		);
	}
}

export default translate()(LocalDemo);
