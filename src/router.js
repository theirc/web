import React, { Component } from "react";
import { connect } from "react-redux";

import { Route, Switch, withRouter } from "react-router";

import { ConnectedRouter } from "react-router-redux";
import { Home, Article, Categories, CountryHome, CategoryHome, CountrySelectorScene, LanguageSelectorScene, Search, Services } from "./scenes";
import cms from "./content/cms";
import { history, actions } from "./store";
import _ from "lodash";

import { Skeleton } from "./scenes";
const Promise = require("bluebird");

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

function withCountry(WrappedComponent) {
	class CountrySwitcher extends Component {
		constructor() {
			super();

			this.state = { loaded: false };
		}
		componentWillMount() {
			const { match, onMount, language } = this.props;

			onMount(match.params.country, language).then(c => {});
		}
		compomentWillReceiveProps(newProps) {
			const { match, onMount, language } = this.props;

			if (newProps.language !== language) {
				onMount(match.params.country, newProps.language).then(c => {});
			} else if (newProps.match.params.country !== match.params.country) {
				onMount(match.params.country, language).then(c => {});
			}
		}

		render() {
			if (!this.props.country) return null;
			return <WrappedComponent {...this.props} />;
		}
	}

	CountrySwitcher = connect(
		({ country, language }, p) => {
			return { country, language };
		},
		(d, p) => {
			return {
				onMount: (country, language) => {
					return cms.loadCountry(country, language).then(c => {
						d(actions.changeCountry(c));
						return Promise.resolve(c);
					});
				},
			};
		}
	)(CountrySwitcher);

	return CountrySwitcher;
}

function withCategory(WrappedComponent) {
	class CategorySwitcher extends Component {
		componentDidMount() {
			const { match, country, onRender } = this.props;
			if (country) {
				const category = _.first(
					_.flattenDeep(country.fields.categories.map(c => [c, c.fields.categories]))
						.filter(_.identity)
						.filter(c => c && c.fields.slug === match.params.category)
				);
				onRender(category);
			}
		}

		compomentWillReceiveProps(nextProps) {
			const { onRender } = this.props;
			const { country, match } = nextProps;

			if (country) {
				const category = _.first(
					_.flattenDeep(country.fields.categories.map(c => [c, c.fields.categories]))
						.filter(_.identity)
						.filter(c => c && c.fields.slug === match.params.category)
				);
				onRender(category);
			}
		}

		render() {
			return <WrappedComponent {...this.props} />;
		}
	}

	CategorySwitcher = connect(
		(s, p) => {
			return {
				category: p.category || s.category,
			};
		},
		(d, p) => {
			return {
				onRender: category => {
					d(actions.selectCategory(category));
				},
			};
		}
	)(CategorySwitcher);

	return CategorySwitcher;
}

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
		const ServicesWithCountry = withCountry(Services);
		return (
			<ConnectedRouter history={history}>
				<div>
					<ScrollToTop />

					<Switch>
						<Route path="/:country/services" component={props => <ServicesWithCountry {...props} />} />
						<Skeleton>
							<div className="SkeletonContainer">
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
							</div>
						</Skeleton>
					</Switch>
				</div>
			</ConnectedRouter>
		);
	}
}

export default Router;
