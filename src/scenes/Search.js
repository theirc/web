import React from "react";
import { connect } from "react-redux";
import cmsApi from "../content/cmsApi";
import servicesApi from "../content/servicesApi";
import c from "../content/cms";
import config from "../content/config";
import Promise from "bluebird";
import { SearchPage } from "../components";
import queryString from "query-string";
import { push } from "react-router-redux";

const { siteConfig } = c;
/**
 * Note to future self. refactor this
 */
const cms = cmsApi(siteConfig, config.languageDictionary);
class Search extends React.Component {
	state = {
		articles: [],
		services: [],
		searching: true,
		term: "",
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
		this.setState({ articles: [], services: [], searching: true, term: qs.q });

		setTimeout(s => {
			const articlePromise = cms.client
				.getEntries({
					content_type: "article",
					"fields.country.sys.id": country.sys.id,
					query: qs.q,
					locale: config.languageDictionary[language]
				})
				.then(response => this.setState({ articles: response.items }))
				.catch(console.error);
			const servicePromise = servicesApi.fetchAllServices(country.fields.slug, language, null, qs.q, 20).then(response => this.setState({ services: response.results }));

			Promise.all([articlePromise, servicePromise]).then(() => this.setState({ searching: false }));
		}, 10);
	}
	render() {
		const { searching, articles, services, term } = this.state;
		const { onNavigate, country } = this.props;
		return <SearchPage hideServices={siteConfig.hideServiceMap} country={country} searching={searching} articles={articles} services={services} term={term} onNavigate={onNavigate} />;
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
