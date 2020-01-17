// libs
import React, { Component } from "react";
import { Paper } from "material-ui";
import BottomNavigation, { BottomNavigationButton } from "material-ui/BottomNavigation";
import { Home, List, Assignment } from "material-ui-icons";
import PropTypes from "prop-types";
import { translate } from "react-i18next";

// local
import i18nHelpers from '../../helpers/i18n';
import instance from '../../backend/settings';
import languages from './languages';
import "./BottomNav.css";

const NS = { ns: 'BottomNav' };

/**
 * @class
 * @description 
 */
class BottomNav extends Component {
	static propTypes = {
		classes: PropTypes.object,
		onButtonClicked: PropTypes.func,
		onGoToCategories: PropTypes.func,
	};
	
	constructor(props) {
		super();

		this.state = { selectedIndex: props.index };
	}	

	componentDidMount() {
		i18nHelpers.loadResource(languages, NS.ns);
	}	

	// TODO: move these props to local dispatch
	select(selectedIndex = 0) {
		const { onGoHome, onGoToCategories, onGoToSearch, onGoToServices, goToMap } = this.props;

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
		} else if (selectedIndex === 4) {
			if (goToMap) {
				return goToMap();
			}
		}
	}

	render() {
		const { country, t } = this.props;
		let paperStyle = {
			position: "fixed",
			bottom: 0,
			width: "100%",
		};
		
		return (
			<Paper style={paperStyle} className="BottomNav">
				<BottomNavigation showLabels={true} value={this.props.index} onChange={(e, i) => this.select(i)}>
					<BottomNavigationButton className={this.props.index === 0 ? "Selected" : ""} icon={<Home />} label={<span className="BottomButton">{t("menu.Home", NS)}</span>} value={0} />

					{instance.countries[country].switches.showArticles ? (
						<BottomNavigationButton className={this.props.index === 1 ? "Selected" : ""} icon={<Assignment />} label={<span className="BottomButton">{t("menu.Articles", NS)}</span>} value={1} />
					) : (<BottomNavigationButton disabled style={{display: 'none'}} />)}

					{instance.countries[country].switches.showServices ? (
						<BottomNavigationButton className={this.props.index === 2 ? "Selected" : ""} icon={<List />} label={<span className="BottomButton">{t("menu.Services", NS)}</span>} value={3} />
					) : (<BottomNavigationButton disabled style={{display: 'none'}} />)}
					
				</BottomNavigation>
			</Paper>
		);
	}
}

export default translate()(BottomNav);
