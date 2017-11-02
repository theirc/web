import React, { Component } from "react";
import {  connect } from "react-redux";
import { Skeleton } from "./scenes";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { createMuiTheme } from "material-ui/styles";
import Router from "./router";
import cms from "./content/cms";


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
        const {  direction } = this.props;
        const organization = cms.siteConfig.theme;

		return (
			<MuiThemeProvider theme={theme}>
				<span className={[organization, direction].join(" ")}>
					<Skeleton>
						<Router />
					</Skeleton>
				</span>
			</MuiThemeProvider>
		);
	}
}

ThemedApp = connect(({ organization, direction }) => {
	return {
		direction,
	};
})(ThemedApp);

export default ThemedApp;
