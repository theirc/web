// libs
import React, { Component } from "react";
// import _ from "lodash";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { Redirect } from "react-router";
import PropTypes from "prop-types";
import measureDistance from "@turf/distance";

// local
import { CountrySelector, LanguageSelector } from "../../components";
import Skeleton from '../../components/Skeleton/Skeleton';
import { actions } from "../../shared/redux/store";
import i18nHelpers from '../../helpers/i18n';
import instance from '../../backend/settings';
import languages from './languages';
import servicesApi from "../../backend/servicesApi";
import getSessionStorage from "../../shared/sessionStorage";

const NS = { ns: 'Selectors' };

/**
 * @class
 * @description 
 */
class Selectors extends Component {
	state = {
		currentPage: 1,
		countryList: null,
		country: null,
		language: null,
		redirect: "",
		regionList: null,
		loaded: false
	};

	static contextTypes = {
		api: PropTypes.object,
	};

	constructor() {
		super();
		i18nHelpers.loadResource(languages, NS.ns);
	}	

	componentWillMount() {
		const sessionStorage = getSessionStorage();
		let language = instance.languages.length === 1 ? instance.defaultLanguage : this.props.language;

		if (language && (!!sessionStorage.firstRequest || instance.languages.length === 1)) {
			this.selectLanguage(language, 0);
		}
	}

	selectLanguage(language, timeout = 200) {
		const func = () => {
			const {
				onSelectLanguage,
				country,
				onGoTo,
			} = this.props;
			const {
				api
			} = this.context;

			onSelectLanguage(language);
			this.setState({
				language,
				countryList: null,
				currentPage: 2,
			});

			if (country) {
				const sessionStorage = getSessionStorage();

				if (sessionStorage && sessionStorage.redirect) {
					let {
						redirect
					} = sessionStorage;
					delete sessionStorage.redirect;
					if (/^\//.test(redirect)) {
						redirect = redirect.substr(1);
					}
					onGoTo(redirect + "?language=" + language);
				} else {
					this.selectCountry(country.fields.slug);
				}
			} else {
				servicesApi.fetchCountries(language).then((regionList) => {
					api
						.listCountries(language)
						.then(e => e.items.map(a => ({
							id: a.sys.id,
							...a.fields,
							...a
						})))
						.then(countryList => this.setState({
							countryList,
							regionList,
							loaded: true
						}));
				})
			}
		};

		if (timeout) {
			setTimeout(func, timeout);
		} else {
			func();
		}
	}

	selectCountry(country, timeout = 200) {
		setTimeout(() => {
			if (country !== "detect-me") {
				this.setState({
					currentPage: -1,
					redirect: `/${country}`,
				});
			} else {
				this.setState({
					currentPage: 3
				});
			}
		}, timeout);
	}

	backToLanguage() {
		this.setState({
			currentPage: 1,
			countryList: null,
			regionList: 1,
			country: null
		});
	}

	// lookupCoordinates(l) {
	// 	const {
	// 		countryList
	// 	} = this.state;
	// 	const {
	// 		coords
	// 	} = l;
	// 	const currentGeoJSON = {
	// 		type: "Point",
	// 		coordinates: [coords.longitude, coords.latitude],
	// 	};

	// 	let first = _.first(
	// 		_.sortBy(countryList, country => {
	// 			if (!country.coordinates) {
	// 				return 1e10;
	// 			} else {
	// 				const {
	// 					lon,
	// 					lat
	// 				} = country.coordinates;
	// 				const countryGeoJSON = {
	// 					type: "Point",
	// 					coordinates: [lon, lat],
	// 				};

	// 				return measureDistance(countryGeoJSON, currentGeoJSON);
	// 			}
	// 		})
	// 	);

	// 	this.selectCountry(first.slug);
	// }

	filterLangs() {
		const currentCountry = sessionStorage.getItem('redirect');
		const slug = currentCountry && currentCountry.split('/')[1];

		// Preventing redirect with a corrupted value (country not found in instance.countries[])
		return currentCountry && instance.countries[slug] ? instance.languages.filter(l => instance.countries[slug].languages.includes(l[0])) : instance.languages;
	}

	render() {
		const {
			countryList,
			currentPage,
			loaded,
			regionList,
		} = this.state;
		const { language } = this.props;

		let filteredlanguages = this.filterLangs();
		switch (currentPage) {
			case 1:
				return (
					<Skeleton hideShareButtons={true}>
						<LanguageSelector
							languages={filteredlanguages}
							onSelectLanguage={l => {
								this.selectLanguage(l);
							}}
						/>
					</Skeleton>
				);

			case 2:
				if (!countryList) {
					return (
						<Skeleton hideShareButtons={true}>
							<div className="LoaderContainer"><div className="loader" /></div>
						</Skeleton>
					)
				}

				if (countryList.length === 1) {
					this.selectCountry(countryList[0].slug);
					return null;
				} else {
					if (!loaded) {
						return (
							<Skeleton hideShareButtons={true}>
								<div className="LoaderContainer"><div className="loader" /></div>
							</Skeleton>
						)
					}

					return (
						<Skeleton hideShareButtons={true}>
							<CountrySelector
								onGoTo={slug => {
									this.selectCountry(slug);
								}}
								countryList={countryList.sort((a, b) => a.name ? a.name.localeCompare(b.name) : 0)}
								regionList={regionList}
								language={language}
								backToLanguage={this.backToLanguage.bind(this)}
							/>
						</Skeleton>
					);
				}

			case 3:
				console.log('DetectLocationSelector');
				return null;
				// return <DetectLocationSelector onBackToList={() => this.setState({ currentPage: 2 })} onLocationFound={l => this.lookupCoordinates(l)} onLocationError={l => this.logError(l)} />;

			case -1:
				return <Redirect to={this.state.redirect} />;

			default:
				return null;
		}
	}
}

const mapState = ({ country, language }, p) => ({ language, country });

const mapDispatch = (d, p) => ({
	onGoTo: slug => d(push(`/${slug}`)),
	onSelectLanguage: code => d(actions.changeLanguage(code)),
});

export default connect(mapState, mapDispatch)(Selectors);
