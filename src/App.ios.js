import React, { Component } from "react";
import { connect } from "react-redux";
import Router from "./router";
import cms from "./content/cms";

global.sessionStorage = {};
global.localStorage = {};
class App extends Component {
	render() {
		const { direction, language } = this.props;
		const organization = cms.siteConfig.theme;

		return <Router />;
	}
}

App = connect(({ organization, direction, language }) => {
	return {
		direction,
		language,
	};
})(App);

export default App;
