// libs
import React from "react";
import { connect } from "react-redux";
import queryString from "query-string";
import { push } from "react-router-redux";
import PropTypes from "prop-types";

// local
import servicesApi from "../../content/servicesApi";
import { SearchPage } from "../../components";
import { Skeleton } from "../../scenes";

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
		const languageDictionary = config.languageDictionary || {};

		setTimeout(s => {
			api.client
				.getEntries({
					content_type: "article",
					"fields.country.sys.id": country.sys.id,
					query: qs.q,
					locale: languageDictionary[language] || language,
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
		const { searchingArticles, searchingServices, language, articles, services, term } = this.state;
		const { onNavigate, country } = this.props;
		const { config } = this.context;

		return (
			<Skeleton headerColor='light'>
				<div className="SkeletonContainer bg-gray" >
					<SearchPage
						hideServices={config.hideServiceMap}
						country={country}
						searchingArticles={searchingArticles}
						searchingServices={searchingServices}
						articles={articles}
						services={services}
						term={term}
						onNavigate={onNavigate}
						language={language}
					/>
				</div>
			</Skeleton>
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
