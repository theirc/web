// libs
import React from "react";
import { connect } from "react-redux";
import queryString from "query-string";
import { push } from "react-router-redux";

// local
import config from '../../backend/config';
import servicesApi from "../../backend/servicesApi";
import i18nHelpers from '../../helpers/i18n';
import languages from './languages';
import cmsApi from '../../backend/cmsApi';
import { SearchPage } from "../../components";
import { Skeleton } from "../../scenes";
import instance from '../../backend/settings';

const NS = { ns: 'Search' };

/**
 * @class
 * @description 
 */
class Search extends React.Component {
	state = {
		articles: [],
		services: [],
		searchingArticles: true,
		searchingServices: true,
		term: "",
	};

	constructor() {
		super();
		i18nHelpers.loadResource(languages, NS.ns);
	}

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
		let countryId = instance.countries[country.fields.slug] && instance.countries[country.fields.slug].id;
		const qs = queryString.parse(location.search);
		this.setState({ articles: [], services: [], searchingArticles: true, searchingServices: true, term: qs.q });
		const languageDictionary = config.languageDictionary || {};

		cmsApi().client
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
		servicesApi()
			.fetchAllServices(countryId, language, null, null, null, qs.q)
			.then(response => {
				this.setState({ services: response, searchingServices: false })})
			.catch(e => {
				this.setState({ services: [], searchingServices: false });
			});
	}

	render() {
		const { searchingArticles, searchingServices, articles, services, term } = this.state;
		const { onNavigate, country, language } = this.props;

		return (
			<Skeleton headerColor='light'>
				<div className="SkeletonContainer bg-gray" >
					<SearchPage
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

const mapState = ({ country, router, language }, p) => ({ country, location: router.location, language });

const mapDispatch = (d, p) => ({ onNavigate: (url) => d(push(url)) });

export default connect(mapState, mapDispatch)(Search);
