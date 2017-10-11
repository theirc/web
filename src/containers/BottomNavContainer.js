import React from "react";
import { connect } from "react-redux";
import { BottomNav } from "../components";
import PropTypes from "prop-types";
import { push } from "react-router-redux";
import { history } from "../store";

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

	componentWillMount() {}

	render() {
		const {
			category,
			country,
			onGoToCategories,
			onGoHome,
			showServiceMap,
			router,
		} = this.props;

		console.log(router);

		let pathParts = router.location.pathname.split("/");
		let selectedIndex = 0;
		if (pathParts.length > 2) {
			if (pathParts[2] === "article") {
				selectedIndex = -1;
			} else if (pathParts[2] === "menu") {
				selectedIndex = -1;
			} else if (pathParts[2] === "services") {
				selectedIndex = 2;
			} else {
				selectedIndex = 1;
			}
		}

		return (
			<BottomNav
				showServiceMap={showServiceMap}
				index={selectedIndex}
				country={country && country.slug}
				onGoToCategories={() => onGoToCategories(country.fields.slug)}
				onGoHome={() => onGoHome(country.fields.slug)}
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
	};
};

export default connect(mapState, mapDispatch)(BottomNavContainer);
