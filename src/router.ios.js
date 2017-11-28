import React, { Component } from "react";
import ReactNative, { View } from "react-native";
import { NativeRouter, Router, Route, Switch, Link } from "react-router-native";
import { ConnectedRouter } from "react-router-redux";
import { Home, Article, Categories, CountryHome, CategoryHome, CountrySelectorScene, LanguageSelectorScene, Search, Services } from "./scenes";
import { history } from "./store";
import { Skeleton } from "./scenes";
import { withCountry, withCategory } from "./shared/hoc";

class AppRouter extends Component {
	render() {
		const Placeholder = props => props.children;
		const ServicesWithCountry = withCountry(Services);
		return (
			<Router history={history}>
				<Switch>
					<Route path="/:country/services" component={props => <ServicesWithCountry {...props} />} />
					<Skeleton>
						<Switch>
							<Route exact path="/" component={Home} />
							<Route exact path="/country-selector" component={CountrySelectorScene} />
							<Route exact path="/language-selector" component={LanguageSelectorScene} />
							<Route exact path="/:country/search" component={withCountry(Search)} />
							<Route exact path="/:country/categories" component={withCountry(Categories)} />
							<Route path="/:country/:category/:article" component={withCountry(withCategory(Article))} />
							<Route path="/:country/:category" component={withCountry(withCategory(CategoryHome))} />
							<Route path="/:country" component={withCountry(CountryHome)} />
						</Switch>
					</Skeleton>
				</Switch>
			</Router>
		);
	}
}

export default AppRouter;
