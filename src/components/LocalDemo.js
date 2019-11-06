// libs
import React, { Component } from "react";
import { translate } from "react-i18next";
import { Helmet } from "react-helmet";
import HeaderBar from "./HeaderBar";
import PropTypes from "prop-types";

// local
import "./LocalDemo.css";
import getSessionStorage from "../shared/sessionStorage";

class LocalDemo extends Component {
	static propTypes = {};
	static contextTypes = {
		config: PropTypes.object,
	};
	state = {
		loaded: true,
	};

	componentDidMount() {
		if (global.window) {
			const sessionStorage = getSessionStorage();
			delete sessionStorage.country;
			delete sessionStorage.dismissedNotifications;
		}
	}

	render() {
		const { config } = this.context;
		const { country, language, t } = this.props;
		const { loaded } = this.state;
		const startCache = () => {
			this.setState({ loaded: false });
			var demoConfig = {
				"CN": {
					urlsToStore: [
						{ storeName: 'serviceList', url: 'https://admin.cuentanos.org/e/production/v2/services/searchlist/?filter=relatives&geographic_region=el-salvador&page=1&page_size=1000&type_numbers=' },
						{ storeName: `${language}-${country.fields.slug}-service-categories`, url: 'https://admin.cuentanos.org/e/production/v2/service-types/?region=el-salvador' },
						{ storeName: `${language}-countries`, url: 'https://admin.cuentanos.org/e/production/v2/regions/?exclude_geometry=true' }
					],
					services: [1501, 1833, 1694],
					buttonColor: 'greeen',
					title: 'Descargar información para uso sin conexión'
				},
				"RI": {
					urlsToStore: [
						{ storeName: 'serviceList', url: `https://admin.refugee.info/e/production/v2/services/searchlist/?filter=relatives&geographic_region=${country.fields.slug}&page=1&page_size=1000&type_numbers=` },
						{ storeName: `${language}-${country.fields.slug}-service-categories`, url: `https://admin.refugee.info/e/production/v2/service-types/?region=${country.fields.slug}` },
						{ storeName: `${language}-countries`, url: 'https://admin.refugee.info/e/production/v2/regions/?exclude_geometry=true' }
					],
					services: [

					],
					buttonColor: 'yellow',
					title: 'Download data for offline use',
				}
			};

			let site = config.siteCode;
			let urlsToStore = demoConfig[site].urlsToStore;
			urlsToStore.map(url => {
				fetch(url.url)
					.then(res => {
						return res.json();
					})
					.then(res => {
						sessionStorage.setItem(url.storeName, JSON.stringify(res));
						return this.setState({ loaded: true });
					})
				return console.log(url);
			})
			let backendUrl = 'https://admin.refugee.info/e/production/v2/services/search/?id=';

			demoConfig[site].services.map(id => {
				fetch(backendUrl + id)
					.then(res => {
						return res.json()
					})
					.then(res => {

					})
			})

		}
		return (
			<div className="LocalDemo">
				<Helmet>
					<title>{t('Download data for offline use')}</title>
				</Helmet>

				<HeaderBar title={t('Download data for offline use')} />
				
				<div className="content">
					{loaded && <button onClick={startCache} className="downloadButton">{t('Click to download data')}</button>}
					{!loaded && <div className="loader" />}
				</div>

			</div>
		);
	}
}

export default translate()(LocalDemo);
