// libs
import React, { Component } from "react";
import { Redirect, Route, Switch, withRouter } from "react-router";
import { ConnectedRouter } from "react-router-redux";

// local
import { ArticleDetail, ArticleList, CategoryHome, CountryHome, DemoTool, Home, Search, Selectors, Services, Subscribe } from "./scenes";
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

class Router extends Component {
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
						<Route exact path="/:country/categories" component={withCountry(ArticleList)} />
						<Route exact path="/:country/search" component={withCountry(Search)} />
						<Route exact path="/:country/demo" component={withCountry(DemoTool)} />
						<Route path="/:country/:category/:article" component={withCountry(withCategory(ArticleDetail))} />
						<Route path="/:country/:category" component={withCountry(withCategory(CategoryHome))} />
						<Route exact path="/selectors" component={Selectors} />
						<Route exact path="/:country" component={withCountry(CountryHome)} />
						<Route exact path="/" component={Home} />
						<Route path="/direct/:article" component={withArticle(ArticleDetail)} />
					</Switch>
				</Placeholder>
			</ConnectedRouter>
		);
	}
}

export default Router;
