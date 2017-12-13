import React from "react";
import { connect } from "react-redux";
import servicesApi from "../content/servicesApi";
import c from "../content/cms";
import { SearchPage } from "../components";
import queryString from "query-string";
import { push } from "react-router-redux";
import PropTypes from "prop-types";

/**
 * Note to future self. refactor this
 */
class Search extends React.Component {
	state = {
		articles: [],
		services: [],
		searchingArticles: true,
		searchingServices: true,
		term: "",
	};

	static contextTypes = {
		config: PropTypes.object,
		api: PropTypes.object,
	};

	componentDidMount() {
		if (this.props.location.search) {
			this.search(this.props);
		}
	}
	componentWillReceiveProps(nextProps) {
		if (!this.props.location || !nextProps.location) {
			return;
		}
		if (this.props.location.search !== nextProps.location.search) {
			this.search(nextProps);
		}
	}

	search(props) {
		const { location, country, language } = props;
		const qs = queryString.parse(location.search);
		this.setState({ articles: [], services: [], searchingArticles: true, searchingServices: true, term: qs.q });
		const { api, config } = this.context;

		setTimeout(s => {
			api.client
				.getEntries({
					content_type: "article",
					"fields.country.sys.id": country.sys.id,
					query: qs.q,
					locale: config.languageDictionary[language] || language,
				})
				.then(response => this.setState({ articles: response.items, searchingArticles: false }))
				.catch(e => {
					this.setState({ articles: [], searchingArticles: false });
				});
			servicesApi
				.fetchAllServices(country.fields.slug, language, null, qs.q, 20)
				.then(response => this.setState({ services: response.results, searchingServices: false }))
				.catch(e => {
					this.setState({ services: [], searchingServices: false });
				});
		}, 10);
	}
	render() {
		const { searchingArticles, searchingServices, articles, services, term } = this.state;
		const { onNavigate, country } = this.props;
		const {  config } = this.context;
		
		return (
			<SearchPage
				hideServices={config.hideServiceMap}
				country={country}
				searchingArticles={searchingArticles}
				searchingServices={searchingServices}
				articles={articles}
				services={services}
				term={term}
				onNavigate={onNavigate}
			/>
		);
	}
}

const mapState = ({ country, router, language }, p) => {
	return {
		country,
		location: router.location,
		language,
	};
};
const mapDispatch = (d, p) => {
	return {
		onNavigate(url) {
			d(push(url));
		},
	};
};

export default connect(mapState, mapDispatch)(Search);
