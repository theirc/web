// libs
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

// local
import ArticleListBody  from "./components/desktop/ArticleListBody";
import i18nHelpers from '../../helpers/i18n';
import languages from './languages.json';
import { history } from "../../shared/redux/store";
import { Skeleton } from "..";

const NS = { ns: 'ArticleList' };

class ArticleList extends React.Component {
	static propTypes = {
		match: PropTypes.shape({
			params: PropTypes.shape({
				country: PropTypes.string.isRequired,
			}).isRequired,
		}).isRequired,
		onMount: PropTypes.func.isRequired,
	};

	componentDidMount() {
		i18nHelpers.loadResource(languages, NS.ns);
	}	

	componentWillMount() {
		this.props.onMount(this.props.match.params.country);
	}

	render() {
		const { country, onNavigate, language } = this.props;

		if (!country) {
			return null;
		}

		return <Skeleton headerColor='light'>
			<div className="SkeletonContainer ArticleList bg-gray">
				<ArticleListBody categories={country.fields.categories} country={country} onNavigate={onNavigate} language={language} />
			</div>
		</Skeleton>
	}
}

const mapState = (s, p) => {
	return {
		articles: s.articles,
		match: p.match,
		country: s.country,
	};
};

const mapDispatch = (d, p) => {
	return {
		onMount: slug => { },
		onNavigate: path => {
			setTimeout(() => {
				history.push(path);
			}, 200);
		},
	};
};

export default connect(mapState, mapDispatch)(ArticleList);
