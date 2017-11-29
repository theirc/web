import React, { Component } from "react";
import { connect } from "react-redux";
import Router from "./router";
import cms from "./content/cms";
import getSessionStorage from "./shared/sessionStorage";

global.sessionStorage = getSessionStorage();
global.localStorage = getSessionStorage();
class App extends Component {
	render() {
		const { direction, language } = this.props;
		const organization = cms.siteConfig.theme;

		return <Router direction={direction} />;
	}
}

App = connect(({ organization, direction, language }) => {
	return {
		direction,
		language,
	};
})(App);

export default App;
