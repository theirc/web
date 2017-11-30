import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { CountrySelector } from "../components";
import { Redirect } from "react-router";
import cms from "../content/cms";
import getSessionStorage from "../shared/sessionStorage";

class CountrySelectorScene extends Component {
	state = {
		countryList: [],
	};
	componentWillMount() {
		const { onMountOrUpdate, language } = this.props;
		onMountOrUpdate(language).then(countryList => this.setState({ countryList }));
	}

	render() {
		const { country, language, onGoTo } = this.props;
		const { countryList } = this.state;

		let firstTimeHere = false;
		const sessionStorage = getSessionStorage();

		if (sessionStorage) {
			const { firstRequest } = sessionStorage;
			firstTimeHere = !firstRequest;
		}

		if (!countryList) {
			return null;
		}

		if (countryList.length === 1) {
			onGoTo(countryList[0].fields.slug);

			return null;
		}

		if (firstTimeHere || !country) {
			return <CountrySelector onGoTo={onGoTo} countryList={countryList} />;
		} else {
			if (!language) {
				return <Redirect to={`/language-selector`} />;
			} else {
				return <Redirect to={`/${country.fields.slug}`} />;
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
		onMountOrUpdate: language => {
			return cms.listCountries(language).then(e => e.items.map(a => ({ id: a.sys.id, ...a.fields, ...a })));
		},
		onGoTo: slug => {
			d(push(`/${slug}`));
		},
	};
};

export default connect(mapState, mapDispatch)(CountrySelectorScene);
