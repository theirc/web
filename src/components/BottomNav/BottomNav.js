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

	// TODO: refactor this
	select(selectedIndex = 0) {
		const { onGoHome, onGoToCategories, onGoToSearch, onGoToServices, goToMap } = this.props;
		
		const mappedGoTo = {
			0: onGoHome,
			1: onGoToCategories,
			2: onGoToServices,
			3: onGoToSearch,
			4: goToMap
		};
		
		this.setState({ selectedIndex });

		return mappedGoTo[selectedIndex] && mappedGoTo[selectedIndex]();
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
						<BottomNavigationButton className={this.props.index === 2 ? "Selected" : ""} icon={<List />} label={<span className="BottomButton">{t("menu.Services", NS)}</span>} value={2} />
					) : (<BottomNavigationButton disabled style={{display: 'none'}} />)}
					
				</BottomNavigation>
			</Paper>
		);
	}
}

export default translate()(BottomNav);
