import React, { Component } from "react";
import { connect } from "react-redux";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { createMuiTheme } from "material-ui/styles";
import Router from "./router";
import cms from "./content/cms";

import { Helmet } from "react-helmet";
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
	render() {
		const { direction, language } = this.props;
		const organization = cms.siteConfig.theme;

		return (
			<MuiThemeProvider theme={theme}>
				<span className={[organization, direction, language].join(" ")}>
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
