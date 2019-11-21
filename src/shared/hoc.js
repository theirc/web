// libs
import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import PropTypes from "prop-types";

// local
import { actions } from "./store";
import servicesApi from "../backend/servicesApi";
import { Skeleton } from "../scenes";

export function withCountry(WrappedComponent) {
	class CountrySwitcher extends Component {
		state = {
			country: null,
		};

		static contextTypes = {
			config: PropTypes.object,
			api: PropTypes.object,
		};

		componentWillMount() {
			const {
				match,
				onMount,
				language,
				storeRegions
			} = this.props;
			const {
				api
			} = this.context;

			api.loadCountry(match.params.country, language).then(c => {
				return onMount(c).then(c => {
					servicesApi.fetchRegions(language).then((regionList) => {
						storeRegions(regionList);
						this.setState({
							country: c,
							loaded: true
						});
					});
				});
			});
		}

		compomentWillReceiveProps(newProps) {
			const {
				match,
				onMount,
				language,
				storeRegions
			} = this.props;

			if (newProps.language !== language) {
				onMount(match.params.country, newProps.language).then(c => {
					servicesApi.fetchRegions(language).then((regionList) => {
						storeRegions(regionList);
						this.setState({
							country: c,
							loaded: true
						});
					});
				});
			} else if (newProps.match.params.country !== match.params.country) {
				onMount(match.params.country, language).then(c => {
					servicesApi.fetchRegions(language).then((regionList) => {
						storeRegions(regionList);
						this.setState({
							country: c,
							loaded: true
						});
					});
				});
			}
		}

		render() {
			let country = this.state.country || this.props.country;
			if (!country || !this.state.loaded) return <Skeleton><div className="LoaderContainer"><div className="loader" /></div></Skeleton>;
			return <WrappedComponent {...{ country, ...this.props }} />;
		}
	}

	CountrySwitcher = connect(
		({
			language,
			country
		}) => ({
			language,
			country
		}),
		(d, p) => {
			return {
				onMount: c => {
					d(actions.changeCountry(c));
					return Promise.resolve(c);
				},
				storeRegions: regions => {
					d(actions.storeRegions(regions));
				}
			};
		}
	)(CountrySwitcher);

	return CountrySwitcher;
}

export function withCategory(WrappedComponent) {
	class CategorySwitcher extends Component {
		state = {
			category: null,
		};

		static contextTypes = {
			config: PropTypes.object,
			api: PropTypes.object,
		};

		componentDidMount() {
			const {
				match,
				country,
				onRender
			} = this.props;

			if (country) {
				const category = _.first(
					_.flattenDeep(country.fields.categories.filter(c => c.fields).map(c => [c, c.fields.categories]))
						.filter(_.identity)
						.filter(c => c && c.fields && c.fields.slug && c.fields && c.fields.slug && c.fields.slug === match.params.category)
				);

				this.setState({
					category
				});
				onRender(category);
			}
		}

		componentWillReceiveProps(nextProps) {
			const {
				onRender
			} = this.props;
			const {
				country,
				match
			} = nextProps;

			if (country) {
				const category = _.first(
					_.flattenDeep(country.fields.categories.filter(c => c.fields).map(c => [c, c.fields.categories]))
						.filter(_.identity)
						.filter(c => c && c.fields && c.fields.slug && c.fields.slug === match.params.category)
				);
				this.setState({
					category
				});
				onRender(category);
			}
		}

		render() {
			let category = this.state.category || this.props.category;
			let { match } = this.props;

			if (!category) return null;

			let articleItem = null;

			if (category && (category.fields.articles || category.fields.overview) && match.params.article) {
				if (category.fields.overview && category.fields.overview.fields.slug === match.params.article) {
					articleItem = category.fields.overview;
				} else if (category.fields.articles) {
					articleItem = _.first(category.fields.articles.filter(a => a && a.fields).filter(a => a.fields.slug === match.params.article));
				}
			}

			return <WrappedComponent {...{ category, articleItem, ...this.props }} />;
		}
	}

	CategorySwitcher = connect(
		(s, p) => {
			return {
				location: s.router.location,
				category: s.category,
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

export function withArticle(WrappedComponent) {
	class ArticleSwitcher extends Component {
		state = {
			article: null,
		};

		static contextTypes = {
			config: PropTypes.object,
			api: PropTypes.object,
		};

		componentDidMount() {
			const {
				match
			} = this.props;

			const { api } = this.context;

			api.loadArticle(match.params.article, "es")
				.then(c => {
					if (c) {
						if (c.fields.country) {
							this.props.onMount(c.fields.country);
						}
						this.setState({ article: c });
					}
				})
				.catch(e => {
					console.log("error", e);
					//res.redirect(`/${country}/`);
				});
		}

		render() {
			const articleItem = this.state.article;

			if (articleItem) {
				let category = articleItem.fields.category;
				let country = articleItem.fields.country;
				return <WrappedComponent {...{ category, country, countryItem: country, articleItem, ...this.props }} />;
			}

			return null;

		}
	}

	ArticleSwitcher = connect(
		({
			country
		}) => ({
			country
		}),
		(d, p) => {
			return {
				onMount: c => {
					d(actions.changeCountry(c));
					return Promise.resolve(c);
				},
				onRender: category => {
					d(actions.selectCategory(category));
				},
			};
		}
	)(ArticleSwitcher);

	return ArticleSwitcher;
}
