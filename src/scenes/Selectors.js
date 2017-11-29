import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { CountrySelector, LanguageSelector, DetectLocationSelector } from "../components";
import { Redirect } from "react-router";
import cms from "../content/cms";
import { actions } from "../store";
import measureDistance from "@turf/distance";
import _ from "lodash";

class Selectors extends Component {
	state = {
		currentPage: 1,
		countryList: null,
		country: null,
		language: null,
		redirect: "",
	};

	componentWillMount() {
		const { language } = this.props;
		if (language) {
			this.selectLanguage(language, 0);
		}
	}

	selectLanguage(language, timeout = 200) {
		const func = () => {
			const { onSelectLanguage, onMountOrUpdate, country } = this.props;

			onSelectLanguage(language);
			this.setState({
				language,
				countryList: null,
				currentPage: 2,
			});
			if (country) {
				this.selectCountry(country.fields.slug);
			} else {
				onMountOrUpdate(language).then(countryList => this.setState({ countryList }));
			}
		};
		if (timeout) setTimeout(func, timeout);
		else func();
	}
	selectCountry(country, timeout = 200) {
		setTimeout(() => {
			if (country !== "detect-me") {
				this.setState({
					currentPage: -1,
					redirect: `/${country}`,
				});
			} else {
				this.setState({ currentPage: 3 });
			}
		}, timeout);
	}

	lookupCoordinates(l) {
		const { countryList } = this.state;
		const { coords } = l;
		const currentGeoJSON = {
			type: "Point",
			coordinates: [coords.longitude, coords.latitude],
		};

		let first = _.first(
			_.sortBy(countryList, country => {
				if (!country.coordinates) {
					return -1;
				} else {
					const { lon, lat } = country.coordinates;
					const countryGeoJSON = {
						type: "Point",
						coordinates: [lon, lat],
					};

					return measureDistance(countryGeoJSON, currentGeoJSON);
				}
			}).reverse()
		);

		this.selectCountry(first.slug);
	}

	logError(l) {
		console.log(l);
	}

	render() {
		const {   currentPage, countryList } = this.state;
		const { languages } = cms.siteConfig;

		switch (currentPage) {
			case 1:
				return (
					<LanguageSelector
						languages={languages}
						onSelectLanguage={l => {
							this.selectLanguage(l);
						}}
					/>
				);
			case 2:
				if (!countryList) return null;
				return (
					<CountrySelector
						onGoTo={slug => {
							this.selectCountry(slug);
						}}
						countryList={countryList}
					/>
				);
			case 3:
				return <DetectLocationSelector onBackToList={() => this.setState({ currentPage: 2 })} onLocationFound={l => this.lookupCoordinates(l)} onLocationError={l => this.logError(l)} />;
			case -1:
				return <Redirect to={this.state.redirect} />;
			default:
				return null;
		}
	}
}

const mapState = ({ countryList, country, language }, p) => {
	return {
		language,
		country,
	};
};
const mapDispatch = (d, p) => {
	return {
		onMountOrUpdate: language => {
			return cms.listCountries(language).then(e => e.items.map(a => ({ id: a.sys.id, ...a.fields, ...a })));
		},

		onSelectLanguage: code => {
			d(actions.changeLanguage(code));
		},

		onGoTo: slug => {
			d(push(`/${slug}`));
		},
	};
};

export default connect(mapState, mapDispatch)(Selectors);
