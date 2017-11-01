import React, { Component } from "react";
import { Paper } from "material-ui";
import BottomNavigation, { BottomNavigationButton } from "material-ui/BottomNavigation";
import PropTypes from "prop-types";
import { translate } from "react-i18next";

import { MoreHoriz, Home, Map, List } from "material-ui-icons";
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
		const { onGoHome, onGoToCategories, onGoToServices, onGoToMore } = this.props;

		if (selectedIndex === 3) {
			this.setState({ selectedIndex: -1 });
		} else {
			this.setState({ selectedIndex });
		}

		if (selectedIndex === 0) {
			if (onGoHome) {
				return onGoHome();
			}
		} else if (selectedIndex === 1) {
			if (onGoToCategories) {
				return onGoToCategories();
			}
		} else if (selectedIndex === 2) {
			if (onGoToServices) {
				return onGoToServices();
			}
		} else if (selectedIndex === 3) {
			if (onGoToMore) {
				return onGoToMore();
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
					<BottomNavigationButton className={this.props.index == 0 ? "Selected" : ""} icon={<Home />} label={t("Home")} value={0} />
					<BottomNavigationButton className={this.props.index == 1 ? "Selected" : ""} icon={<List />} label={t("Categories")} value={1} />
					{showServiceMap ? <BottomNavigationButton className={this.props.index == 2 ? "Selected" : ""} icon={<Map />} label={t("Map")} value={2} /> : <div />}
					<BottomNavigationButton className={this.props.index == 3 ? "Selected" : ""} icon={<MoreHoriz />} label={t("More")} value={3} />
				</BottomNavigation>
			</Paper>
		);
	}
}

export default translate()(BottomNav);
