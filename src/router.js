import React, { Component } from "react";
import { Route, Switch, withRouter } from "react-router";
import { ConnectedRouter } from "react-router-redux";
import { Home, Article, Categories, CountryHome, CategoryHome, CountrySelectorScene, LanguageSelectorScene, Search, Services, Selectors } from "./scenes";
import { history } from "./store";
import { Skeleton } from "./scenes";
import { withCountry, withCategory } from "./shared/hoc";

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
		const Placeholder = props => props.children;
		const ServicesWithCountry = withCountry(Services);
		return (
			<ConnectedRouter history={history}>
				<Placeholder>
					<ScrollToTop />
					<Switch>
						<Route path="/:country/services" component={props => <ServicesWithCountry {...props} />} />
						<Skeleton>
							<div className="SkeletonContainer">
								<Switch>
									<Route exact path="/" component={Home} />
									<Route exact path="/selectors" component={Selectors} />
									<Route exact path="/country-selector" component={CountrySelectorScene} />
									<Route exact path="/language-selector" component={LanguageSelectorScene} />
									<Route exact path="/:country/search" component={withCountry(Search)} />
									<Route exact path="/:country/categories" component={withCountry(Categories)} />
									<Route path="/:country/:category/:article" component={withCountry(withCategory(Article))} />
									<Route path="/:country/:category" component={withCountry(withCategory(CategoryHome))} />
									<Route path="/:country" component={withCountry(CountryHome)} />
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
