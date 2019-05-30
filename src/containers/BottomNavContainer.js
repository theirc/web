import React from "react";
import { connect } from "react-redux";
import { BottomNav } from "../components";
import PropTypes from "prop-types";
import { push } from "react-router-redux";

class BottomNavContainer extends React.Component {
	static propTypes = {
		match: PropTypes.shape({
			params: PropTypes.shape({
				country: PropTypes.string,
				category: PropTypes.string,
				article: PropTypes.string,
			}).isRequired,
		}),
	};
	constructor() {
		super();

		this.state = {};
	}

	goToServices(showDepartments, country){
		let { onGoToServices, onGoToDepartments } = this.props; 
		if (showDepartments){
			onGoToDepartments(country);
		}else{
			onGoToServices(country);
		}
	}

	componentWillMount() {}

	render() {
		const { country, onGoToCategories, onGoHome, onGoToSearch, router, showMapButton, goToMap, showDepartments } = this.props;
		let { showServiceMap } = this.props;
		let pathParts = router.location.pathname.split("/");
		let selectedIndex = 0;
		if (pathParts.length > 2) {
			if (pathParts[2] === "article") {
				selectedIndex = -1;
			} else if (pathParts[2] === "search") {
				selectedIndex = 2;
			} else if (pathParts[2] === "services") {
				selectedIndex = 3;
			} else {
				selectedIndex = 1;
			}
		}

		country && country.fields && country.fields.slug === 'italy' && (showServiceMap = false);
		
		return (
			<BottomNav
				showServiceMap={showServiceMap}
				index={selectedIndex}
				country={country && country.slug}
				onGoToCategories={onGoToCategories.bind(null, country.fields.slug)}
				onGoHome={onGoHome.bind(null, country.fields.slug)}
				onGoToSearch={onGoToSearch.bind(null, country.fields.slug)}
				onGoToServices={() => {this.goToServices(showDepartments, country.fields.slug)}}
				showMapButton={showMapButton}
				goToMap={goToMap}
			/>
		);
	}
}

const mapState = ({ category, country, showServiceMap, router }, p) => {
	return {
		category,
		country,
		showServiceMap,
		router,
	};
};
const mapDispatch = (d, p) => {
	return {
		onGoToCategories: country => {
			d(push(`/${country}/categories`));
		},
		onGoHome: country => {
			d(push(`/${country}`));
		},
		onGoToSearch: country => {
			d(push(`/${country}/search`));
		},
		onGoToServices: country => {
			d(push(`/${country}/services/`));
		},
		onGoToDepartments: country => {
			d(push(`/${country}/services/`));
		},
	};
};

export default connect(mapState, mapDispatch)(BottomNavContainer);
