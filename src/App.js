// libs
import React, { Component } from "react";
import { connect } from "react-redux";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { createMuiTheme } from "material-ui/styles";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";

// local
import Router from "./router";
import cmsApi from "./backend/cmsApi";
import cms from "./backend/cms";
import "./App.css";


const theme = createMuiTheme({
	overrides: {
		MuiBottomNavigationButton: {
			selected: {
				color: "#000000",
			},
		},
	},
});

class ThemedApp extends Component {
	static childContextTypes = {
		config: PropTypes.object,
		api: PropTypes.object,
	};

	getChildContext() {
		let config = cms.siteConfig;
		let api = cmsApi(config, {});

		return {
			config,
			api,
		};
	}

	render() {
		const { direction, language } = this.props;
		const organization = cms.siteConfig.theme;

		return (
			<MuiThemeProvider theme={theme}>
				<span className={[organization, direction, `language-${language}`].join(" ")}>
					<Helmet>
						<title>{cms.siteConfig.title}</title>
						<link rel="shortcut icon" href={cms.siteConfig.favicon} />
						<link rel="icon" href={cms.siteConfig.favicon} />
					</Helmet>
					
					<Router />
				</span>
			</MuiThemeProvider>
		);
	}
}

ThemedApp = connect(({ organization, direction, language }) => {
	return {
		direction,
		language,
	};
})(ThemedApp);

export default ThemedApp;
