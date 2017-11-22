import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import cms from "../content/cms";
import { actions } from "../store";

export function withCountry(WrappedComponent) {
	class CountrySwitcher extends Component {
		state = {
			country: null,
			loaded: false,
		};
		componentWillMount() {
			const { match, onMount, language } = this.props;

			onMount(match.params.country, language).then(c => {
				this.setState({ country: c, loaded: true });
			});
		}
		compomentWillReceiveProps(newProps) {
			const { match, onMount, language } = this.props;

			if (newProps.language !== language) {
				this.setState({ loaded: false });

				onMount(match.params.country, newProps.language).then(c => {
					this.setState({ country: c, loaded: true });
				});
			} else if (newProps.match.params.country !== match.params.country) {
				this.setState({ loaded: false });

				onMount(match.params.country, language).then(c => {
					this.setState({ country: c, loaded: true });
				});
			}
		}

		render() {
			const { country, loaded } = this.state;
			if (!loaded) return null;
			return <WrappedComponent {...{ country, ...this.props }} />;
		}
	}

	CountrySwitcher = connect(
		({ language }) => ({ language }),
		(d, p) => {
			return {
				onMount: (country, language) => {
					return cms.loadCountry(country, language).then(c => {
						console.log(">>?", country, language);
						d(actions.changeCountry(c));
						return Promise.resolve(c);
					});
				},
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
		componentDidMount() {
			const { match, country, onRender } = this.props;

			if (country) {
				const category = _.first(
					_.flattenDeep(country.fields.categories.map(c => [c, c.fields.categories]))
						.filter(_.identity)
						.filter(c => c && c.fields.slug === match.params.category)
				);

				this.setState({ category });
				onRender(category);
			}
		}

		componentWillReceiveProps(nextProps) {
			const { onRender } = this.props;
			const { country, match } = nextProps;

			if (country) {
				const category = _.first(
					_.flattenDeep(country.fields.categories.map(c => [c, c.fields.categories]))
						.filter(_.identity)
						.filter(c => c && c.fields.slug === match.params.category)
				);
				this.setState({ category });
				onRender(category);
			}
		}

		render() {
			const { category } = this.state;
			return <WrappedComponent {...{ category, ...this.props }} />;
		}
	}

	CategorySwitcher = connect(
		(s, p) => {
			return {
				location: s.router.location,
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
