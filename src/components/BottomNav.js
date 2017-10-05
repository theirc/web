import React, { Component } from "react";
import { Paper } from "material-ui";
import BottomNavigation, {
	BottomNavigationButton,
} from "material-ui/BottomNavigation";
import PropTypes from "prop-types";

import { MoreHoriz, Home, Map, List } from "material-ui-icons";
import "./BottomNav.css";
export default class BottomNav extends Component {
	static propTypes = {
		classes: PropTypes.object,
		onButtonClicked: PropTypes.func,
		onGoToCategories: PropTypes.func,
	};

	constructor(props) {
		super();

		this.state = {
			selectedIndex: (props.category && 1) || 0,
		};
	}

	select(selectedIndex = 0) {
		const {
			onGoHome,
			onGoToCategories,
			onGoToServices,
			onGoToMore,
		} = this.props;

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
		return (
			<Paper
				style={{
					position: "fixed",
					bottom: 0,
					width: "100%",
				}}
				className="BottomNav"
			>
				<BottomNavigation
					value={this.state.selectedIndex}
					onChange={(e, i) => this.select(i)}
				>
					<BottomNavigationButton
						className={
							this.state.selectedIndex == 0 ? "Selected" : ""
						}
						icon={<Home />}
						label="Home"
					/>
					<BottomNavigationButton
						className={
							this.state.selectedIndex == 1 ? "Selected" : ""
						}
						icon={<List />}
						label="Categories"
					/>
					<BottomNavigationButton
						className={
							this.state.selectedIndex == 2 ? "Selected" : ""
						} icon={<Map />} label="Map" />
					<BottomNavigationButton 
						className={
							this.state.selectedIndex == 3 ? "Selected" : ""
						}icon={<MoreHoriz />} label="More" />
				</BottomNavigation>
			</Paper>
		);
	}
}
