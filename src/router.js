// libs
import React, { Component } from "react";
import { Redirect, Route, Switch, withRouter } from "react-router";
import { ConnectedRouter } from "react-router-redux";

// local
import { ArticleDetail, ArticleList, CountryHome, DemoTool,
	Home, NotFound, Search, Selectors, Services, Subscribe, IntegrationServiceMap } from "./scenes";
import { history } from "./shared/redux/store";
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
const IntegrationServicesMapWithCountry = withCountry(IntegrationServiceMap);

class Router extends Component {
	render() {
		return (
			<ConnectedRouter history={history}>
				<Placeholder>
					<ScrollToTop />
					<Switch>
						{/* STATIC ROUTES */}
						<Route exact path="/404" component={NotFound} />
						<Route exact path="/bulgaria/*" render={() => <Redirect to="/bulgaria" />} />
						<Route exact path="/italy/services*" render={() => <Redirect to="/italy" />} />
						<Route exact path="/jordan/services*" render={() => <Redirect to="/jordan" />} />
						<Route exact path="/serbia/*" render={() => <Redirect to="/serbia" />} />
						<Route exact path="/selectors" component={Selectors} />

						{/* DYNAMIC ROUTES */}
						<Route path="/integration/:country/services" component={props => <IntegrationServicesMapWithCountry {...props} />} />
						<Route exact path="/:country/subscribe/:category" component={withCountry(withCategory(Subscribe))} />
						<Route path="/:country/services" component={props => <ServicesWithCountry {...props} />} />
						<Route exact path="/:country/categories" component={withCountry(ArticleList)} />
						<Route exact path="/:country/search" component={withCountry(Search)} />					
						{/* <Route exact path="/:country/demo" component={withCountry(DemoTool)} /> */}
						<Route exact path="/:country/:category/:article" component={withCountry(withCategory(ArticleDetail))} />
						<Route exact path="/:country/:category" component={withCountry(ArticleList)} />
						<Route exact path="/:country" component={withCountry(CountryHome)} />
						<Route exact path="/" component={Home} />
						<Route path="/direct/:article" component={withArticle(ArticleDetail)} />

						{/* DEFAULTING 404 */}
						<Route component={() => <Redirect to='/404' />} />
					</Switch>
				</Placeholder>
			</ConnectedRouter>
		);
	}
}

export default Router;
