import React, { Component } from "react";
import { Paper } from "material-ui";
import BottomNavigation, { BottomNavigationButton } from "material-ui/BottomNavigation";
import PropTypes from "prop-types";
import { translate } from "react-i18next";

import { Home, Map, List, Search } from "material-ui-icons";
import "./BottomNav.css";
class BottomNav extends Component {
	static propTypes = {
		classes: PropTypes.object,
		onButtonClicked: PropTypes.func,
		onGoToCategories: PropTypes.func,
	};

	constructor(props) {
		super();

		this.state = {
			selectedIndex: props.index,
		};
	}

	select(selectedIndex = 0) {
		const { onGoHome, onGoToCategories, onGoToSearch, onGoToServices,  } = this.props;

		this.setState({ selectedIndex });

		if (selectedIndex === 0) {
			if (onGoHome) {
				return onGoHome();
			}
		} else if (selectedIndex === 1) {
			if (onGoToCategories) {
				return onGoToCategories();
			}
		} else if (selectedIndex === 2) {
			if (onGoToSearch) {
				return onGoToSearch();
			}
		} else if (selectedIndex === 3) {
			if (onGoToServices) {
				return onGoToServices();
			}
		}
	}

	render() {
		const { showServiceMap, t } = this.props;
		return (
			<Paper
				style={{
					position: "fixed",
					bottom: 0,
					width: "100%",
				}}
				className="BottomNav"
			>
				<BottomNavigation value={this.props.index} onChange={(e, i) => this.select(i)}>
					<BottomNavigationButton className={this.props.index === 0 ? "Selected" : ""} icon={<Home />} label={t("Home")} value={0} />
					<BottomNavigationButton className={this.props.index === 1 ? "Selected" : ""} icon={<List />} label={t("Categories")} value={1} />
					<BottomNavigationButton className={this.props.index === 2 ? "Selected" : ""} icon={<Search />} label={t("Search")} value={2} />
					{showServiceMap ? <BottomNavigationButton className={this.props.index === 3 ? "Selected" : ""} icon={<Map />} label={t("Map")} value={3} /> : <div />}
				</BottomNavigation>
			</Paper>
		);
	}
}

export default translate()(BottomNav);
