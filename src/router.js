// libs
import React, { Component } from "react";
import { Redirect, Route, Switch, withRouter } from "react-router";
import { ConnectedRouter } from "react-router-redux";

// local
import { Home, Article, Categories, CountryHome, CategoryHome, Search, Services, Selectors, Subscribe } from "./scenes";
import { DemoTool } from "./scenes";
import { history } from "./shared/store";
import { Skeleton } from "./scenes";
import { withCountry, withCategory, withArticle } from "./shared/hoc";
import Placeholder from "./shared/placeholder";

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
const ServicesWithCountry = withCountry(Services);

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
		
		return (
			<ConnectedRouter history={history}>
				<Placeholder>
					<ScrollToTop />
					<Switch>
						<Route exact path="/bulgaria/*" render={() => <Redirect to="/bulgaria" />} />
						<Route exact path="/italy/services*" render={() => <Redirect to="/italy" />} />
						<Route exact path="/jordan/services*" render={() => <Redirect to="/jordan" />} />
						<Route exact path="/:country/subscribe/:category" component={withCountry(withCategory(Subscribe))} />
						<Route path="/:country/services" component={props => <ServicesWithCountry {...props} />} />
						<Route exact path="/:country/categories" component={withCountry(Categories)} />
						<Route exact path="/:country/search" component={withCountry(Search)} />
						<Route path="/:country/:category/:article" component={withCountry(withCategory(Article))} />
						<Route path="/:country/:category" component={withCountry(withCategory(CategoryHome))} />
						<Route exact path="/selectors" component={props => <Skeleton {...props}><Selectors /></Skeleton>} />
						<Route exact path="/:country" component={withCountry(CountryHome)} />
						<Route exact path="/:country/demo" component={withCountry(DemoTool)} />

						<Route exact path="/" component={Home} />
						<Route path="/direct/:article" component={withArticle(Article)} />

					</Switch>
				</Placeholder>
			</ConnectedRouter>
		);
	}
}

export default Router;
