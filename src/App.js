import React, { Component } from "react";
import { Provider, connect } from "react-redux";
import { Skeleton } from "./scenes";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { createMuiTheme } from "material-ui/styles";
import { store } from "./store";
import _ from "lodash";
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

class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<ThemedApp />
			</Provider>
		);
	}
}

export default ThemedApp;
