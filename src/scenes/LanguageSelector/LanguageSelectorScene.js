// libs
import React from "react";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { Redirect } from "react-router";
import PropTypes from "prop-types";

// local
import { LanguageSelector } from "./LanguageSelector";
import { actions } from "../../store";
import getSessionStorage from "../../shared/sessionStorage";

class LanguageSelectorScene extends React.Component {
	constructor() {
		super();
		this.state = { selected: false };
	}

	static contextTypes = {
		config: PropTypes.object,
		api: PropTypes.object,
	};

	componentWillMount() {
		const { onMountOrUpdate } = this.props;
		onMountOrUpdate();
	}

	selectLanguage(redirect, language) {
		const { onGoTo, onSelectLanguage } = this.props;
		this.setState({ selected: true }, () => {
			setTimeout(() => {
				onSelectLanguage(language);
				setTimeout(() => {
					const sessionStorage = getSessionStorage();

					if (sessionStorage) {
						delete sessionStorage.redirect;
					}

					if (/^\//.test(redirect)) {
						redirect = redirect.substr(1);
					}
					onGoTo(redirect);
				}, 300);
			}, 300);
		});
	}

	render() {
		const { country, language } = this.props;
		const { selected } = this.state;
		const { config } = this.context;
		let redirect = null;

		let firstTimeHere = false;
		const sessionStorage = getSessionStorage();

		if (sessionStorage) {
			const { firstRequest } = sessionStorage;
			firstTimeHere = !firstRequest;
			redirect = sessionStorage.redirect;
		}

		const languages = config.languages;

		if (!selected && (firstTimeHere || !language)) {
			if (!country) {
				return <LanguageSelector languages={languages} onSelectLanguage={this.selectLanguage.bind(this, "country-selector")} />;
			} else {
				return <LanguageSelector languages={languages} onSelectLanguage={this.selectLanguage.bind(this, redirect || country.fields.slug)} />;
			}
		} else {
			if (!selected && language) {
				if (!country) {
					return <Redirect to={`/country-selector`} />;
				} else {
					return <Redirect to={`/${country.fields.slug}`} />;
				}
			} else {
				return null;
			}
		}
	}
}

const mapState = ({ countryList, country, language }, p) => {
	return {
		countryList,
		country,
		language,
	};
};

const mapDispatch = (d, p) => {
	return {
		onMountOrUpdate: () => { },
		onSelectLanguage: code => {
			d(actions.changeLanguage(code));
		},
		onGoTo: slug => {
			d(push(`/${slug}`));
		},
	};
};

export default connect(mapState, mapDispatch)(LanguageSelectorScene);
