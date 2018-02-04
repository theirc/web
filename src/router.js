import React, { Component } from "react";
import { Route, Switch, withRouter } from "react-router";
import { ConnectedRouter } from "react-router-redux";
import { Article, Categories, CountryHome, CategoryHome, CountrySelectorScene, LanguageSelectorScene, Search, Services, Selectors } from "./scenes";
import { history } from "./store";
import { Skeleton } from "./scenes";
import { withCountry, withCategory } from "./shared/hoc";
import Placeholder from "./shared/placeholder";
import PropTypes from "prop-types";

class ScrollToTop extends Component {
	componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location) {
			window.scrollTo(0, 0);
		}
	}

	render() {
		return null;
	}
}

ScrollToTop = withRouter(ScrollToTop);

class Router extends Component {
	static contextTypes = {
		config: PropTypes.object,
	};

	componentDidMount() {
		if (global.window) {
			if (global.window && global.window.document) {
				setTimeout(() => {
					const document = global.window.document;

					var intro = document.querySelector(".intro");
					var root = document.querySelector("#root");

					if (intro) {
						intro.remove();
					}
					root.className = "";
				}, 500);
			}
		}
	}

	render() {
		const ServicesWithCountry = withCountry(Services);
		const { config } = this.context;

		const host = window.location.hostname.split(".")[0];
		const possibleRoots = ["www", (config["key"] || "").split(".")[0], "localhost"];
		const isRoot = possibleRoots.indexOf(host) > -1;

		return (
			<ConnectedRouter history={history}>
				<Placeholder>
					<ScrollToTop />
					<Switch>
						<Route path="/services" component={props => <ServicesWithCountry {...props} />} />
						<Skeleton>
							<div className="SkeletonContainer">
								<Switch>
									<Route exact path="/" component={isRoot ? Selectors : withCountry(CountryHome)} />
									<Route exact path="/selectors" component={Selectors} />
									<Route exact path="/country-selector" component={CountrySelectorScene} />
									<Route exact path="/language-selector" component={LanguageSelectorScene} />
									<Route exact path="/search" component={withCountry(Search)} />
									<Route exact path="/categories" component={withCountry(Categories)} />
									<Route path="/:category/:article" component={withCountry(withCategory(Article))} />
									<Route path="/:category" component={withCountry(withCategory(CategoryHome))} />
								</Switch>
							</div>
						</Skeleton>
					</Switch>
				</Placeholder>
			</ConnectedRouter>
		);
	}
}

export default Router;
