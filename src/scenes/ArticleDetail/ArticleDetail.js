// libs
import React from "react";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import PropTypes from "prop-types";

// local
import ArticleDetailBody from "./components/ArticleDetailBody";
import ArticleDetailFooter from "./components/ArticleDetailFooter";
import Placeholder from "../../shared/placeholder";
import i18nHelpers from '../../helpers/i18n';
import languages from './languages';
import { actions } from "../../shared/redux/store";
import { Skeleton } from "..";

const NS = { ns: 'ArticleDetail' };
const Promise = require("bluebird");

/**
 * @class
 * @description 
 */
class ArticleDetail extends React.Component {
	static propTypes = {
		match: PropTypes.shape({
			params: PropTypes.shape({
				country: PropTypes.string,
				category: PropTypes.string,
				article: PropTypes.string.isRequired,
			}).isRequired,
		}).isRequired,
		onMount: PropTypes.func.isRequired,
	};

	constructor() {
		super();
		this.state = { loading: false };
		
		i18nHelpers.loadResource(languages, NS.ns);
	}

	componentWillMount() {
		if (!this.props.articleItem) {
			this.setState({ loading: true });
			this.props.onMount(this.props.category, this.props.match.params.article).then(s => {
				return this.setState({ loading: false });
			});
		}
	}
	
	componentWillUpdate(nextProps, b) {
		const articleChanged = this.props.match && nextProps.match && this.props.match.params.article !== nextProps.match.params.article;
		const categoryChanged = this.props.category !== nextProps.category;
		
		if (articleChanged || categoryChanged) {
			this.setState({ loading: true });
			this.props.onMount(nextProps.category, nextProps.match.params.article).then(s => {
				return this.setState({ loading: false });
			});
		}
	}

	render() {
		const { loading } = this.state;
		const { articleItem, direction } = this.props;
		const { category, country, onNavigateTo, onNavigate, language } = this.props;
		
		// const categoryId = category && category.sys.id;
		// const categorySlug  = category && category.fields.slug;
		let article = articleItem;

		if (!article || !category) return null;

		let next = null;
		let previous = null;

		const articles = ([category.fields.overview].concat(category.fields.articles) || []).filter(a => a && a.fields);

		if (category) {
			let index = articles.map(a => a.fields.slug).indexOf(article.fields.slug);

			if (index > 0) {
				previous = articles[index - 1];
			}

			if (index + 1 < articles.length) {
				next = articles[index + 1];
			}
		}

		const other = articles.filter(a => a.sys.id === article.sys.id);

		return (
			<Skeleton headerColor='light'>
				<div className="SkeletonContainer">
					<Placeholder>
						<ArticleDetailBody key={"ArticleDetailBody"} direction={direction} category={category} language={language} other={other} article={article} loading={loading} onNavigate={onNavigate} />
						<ArticleDetailFooter key={"ArticleDetailFooter"} onNavigateTo={onNavigateTo(category, country)} language={language} {...{ category, direction, previous, next, article, country }} />
					</Placeholder>
				</div>
			</Skeleton>
		);
	}
}

const mapState = (s, p) => ({
	article: s.article,
	match: p.match,
	country: p.country || s.country,
	direction: s.direction,
	language: s.language,
});

const mapDispatch = (d, p) => {
	return {
		onMount: (category, slug) => {
			if (category && (category.fields.articles || category.fields.overview)) {
				if (category?.fields?.overview?.fields?.slug === slug) {
					return Promise.resolve(d(actions.selectArticle(category.fields.overview)));
				} else if (category.fields.articles) {
					return Promise.resolve(d(actions.selectArticle(category.fields.articles.filter(a => a && a.fields).filter(a => a.fields.slug === slug)[0])));
				}
			}

			return Promise.resolve(true);
		},

		onNavigateTo: (category, country) => slug => {
			setTimeout(() => d(push(`/${country.fields.slug}/${category.fields.slug}/${slug}`)), 0);
		},

		onNavigate: path => d(push(path))
	};
};

export default connect(mapState, mapDispatch)(ArticleDetail);
