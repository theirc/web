// libs
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import HeaderBar from "../../../components/HeaderBar/HeaderBar";

// local
import i18nHelpers from '../../../helpers/i18n';
import getSessionStorage from "../../../shared/sessionStorage";
import instance from '../../../backend/settings';
import "./LocalDemo.css";
const NS = { ns: 'DemoTool' };

/**
 * @class
 * @description 
 */
class LocalDemo extends Component {
	state = {
		loaded: true,
		done: false,
	};

	componentDidMount() {
		if (global.window) {
			const sessionStorage = getSessionStorage();
			delete sessionStorage.country;
			delete sessionStorage.dismissedNotifications;
		}
	}

	render() {
		const { country, language, t } = this.props;
		const { loaded, done } = this.state;
		const startCache = () => {
			console.log("start cache");
			this.setState({ loaded: false });
			var demoConfig = {
				"cn": {
					urlsToStore: [
						{ storeName: 'serviceList', url: 'https://admin.cuentanos.org/e/production/v2/services/searchlist/?filter=relatives&geographic_region=el-salvador&page=1&page_size=1000&type_numbers=' },
						{ storeName: `${language}-${country.fields.slug}-service-categories`, url: 'https://admin.cuentanos.org/e/production/v2/service-types/?region=el-salvador' },
						{ storeName: `${language}-countries`, url: 'https://admin.cuentanos.org/e/production/v2/regions/?exclude_geometry=true' }
					],
					services: [1501, 1833, 1694],
					buttonColor: 'greeen',
				},
				"ri": {
					urlsToStore: [
						{ storeName: 'serviceList', url: `https://admin.refugee.info/e/production/v2/services/searchlist/?filter=relatives&geographic_region=${country.fields.slug}&page=1&page_size=1000&type_numbers=` },
						{ storeName: `${language}-${country.fields.slug}-service-categories`, url: `https://admin.refugee.info/e/production/v2/service-types/?region=${country.fields.slug}` },
						{ storeName: `${language}-countries`, url: 'https://admin.refugee.info/e/production/v2/regions/?exclude_geometry=true' }
					],
					services: [

					],
					buttonColor: 'yellow',
				}
			};
		
			let site = instance.brand.code;
			let urlsToStore = demoConfig[site].urlsToStore;
			urlsToStore.map(url => {
				fetch(url.url)
					.then(res => {
						return res.json();
					})
					.then(res => {
						sessionStorage.setItem(url.storeName, JSON.stringify(res));
						return this.setState({ loaded: true, done: true });
					})
				return console.log(url);
			})
			let backendUrl = 'https://admin.refugee.info/e/production/v2/services/search/?id=';

			demoConfig[site].services.map(id =>
				fetch(backendUrl + id)
					.then(res => {
						return res.json()
					})
					.then(res => {

					})
			)
		}
		return (
			<div className="LocalDemo">
				<Helmet>
					<title>{t('Download data for offline use', NS)}</title>
				</Helmet>

				<HeaderBar title={t('Download data for offline use', NS)} />
				
				<div className="content">
					<h3>{t('Description', NS)}</h3>
					{loaded && <button onClick={startCache} className="downloadButton">{t('Click to download data', NS)}</button>}
					{!loaded && <div className="loader" />}
					{done && <h3>{t('Download complete', NS)}</h3>}
				</div>

			</div>
		);
	}
}

export default withTranslation()(LocalDemo);
