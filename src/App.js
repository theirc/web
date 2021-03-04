// libs
import React, { Component } from "react";
import { connect } from "react-redux";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { createMuiTheme } from "material-ui/styles";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/pro-solid-svg-icons';

// local
import cmsApi from "./backend/cmsApi";
import instance from './backend/settings';
import Router from "./router";
import "./App.css";

library.add(fas);

// const theme = createMuiTheme({
// 	overrides: {
// 		MuiBottomNavigationButton: {
// 			selected: {
// 				color: "#000000",
// 			},
// 		},
// 	},
// });

class ThemedApp extends Component {
	static childContextTypes = {
		config: PropTypes.object,
		api: PropTypes.object,
	};

	getChildContext() {
		let api = cmsApi();
		return { api };
	}

	render() {
		const { direction, language } = this.props;
		const organization = instance.brand.theme;
		const title = instance.brand.tabTitle;
		const favicon = instance.brand.images.favicon;

		return (
			<div>
				<span className={`${organization} ${direction} language-${language}`}>
					<Helmet defer={false}>
						<title>{title}</title>
						<link rel='shortcut icon' href={favicon} />
					</Helmet>
					
					<Router />
				</span>
			</div>
		);
	}
}

const mapState = ({ direction, language }) => ({ direction,	language });

export default connect(mapState)(ThemedApp);
