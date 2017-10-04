import React from "react";
import { actions } from "../store";
import { connect } from "react-redux";
import { AppHeader, Footer } from "../components";
import { BottomNavContainer } from "../containers";
import { push } from "react-router-redux";
import { history } from "../store";
import cms from "../content/cms";

import "./Skeleton.css";

import { Helmet } from "react-helmet";

class Skeleton extends React.Component {
	componentWillMount() {}

	render() {
		const {
			children,
			country,
			language,
			match,
			onGoHome,
			onGoToSearch,
			onChangeLocation,
			onChangeCountry,
			onChangeLanguage,
		} = this.props;

		return (
			<div className="Skeleton">
				<Helmet>
					<title>{cms.siteConfig.title}</title>
				</Helmet>
				<AppHeader
					country={country}
					language={language}
					onGoHome={onGoHome(country)}
					onGoToSearch={onGoToSearch(country)}
					onChangeCountry={onChangeLocation}
					logo={cms.siteConfig.logo}
				/>
				{children}
				{country &&
					language && (
						<Footer
							questionLink={cms.siteConfig.questionLink}
							disableCountrySelector={
								!!cms.siteConfig.disableCountrySelector
							}
							onChangeLocation={onChangeLocation}
							onChangeLanguage={onChangeLanguage}
						/>
					)}
				{country && language && <BottomNavContainer match={match} />}
			</div>
		);
	}
}

const mapState = ({ country, language }, p) => {
	return {
		country,
		language,
	};
};
const mapDispatch = (d, p) => {
	return {
		onGoHome: country => () => {
			if (country) d(push(`/${country.slug || ""}`));
		},
		onGoToSearch: country => () => {
			if (country) d(push(`/${country.slug}/search`));
		},
		onChangeLocation: () => {
			d(actions.changeCountry(null));
			d(push(`/country-selector`));
		},
		onChangeLanguage: () => {
			d(actions.changeLanguage(null));
			d(push(`/language-selector`));
		},
	};
};

export default connect(mapState, mapDispatch)(Skeleton);
