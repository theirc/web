import React from "react";
import { connect } from "react-redux";
import { ArticlePage, ArticleFooter } from "../components";
import PropTypes from "prop-types";
import { actions } from "../store";
import { push } from "react-router-redux";
import Placeholder from "../shared/placeholder";
import _ from "lodash";
const Promise = require("bluebird");

class Article extends React.Component {
	static propTypes = {
		match: PropTypes.shape({
			params: PropTypes.shape({
				country: PropTypes.string.isRequired,
				category: PropTypes.string.isRequired,
				article: PropTypes.string.isRequired,
			}).isRequired,
		}).isRequired,
		onMount: PropTypes.func.isRequired,
	};
	constructor() {
		super();

		this.state = { loading: false };
	}

	componentWillMount() {
		this.setState({ loading: true });

		this.props.onMount(this.props.category, this.props.match.params.article).then(s => {
			return this.setState({ loading: false });
		});
	}

	componentWillUnmount() {}

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
		const { article, direction } = this.props;
		const { category, country, onNavigateTo, onNavigate, language } = this.props;

		if (!article || !category) return null; //<div style={{ height: 100 }} />;

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
			<Placeholder>
				<ArticlePage key={"Article"} direction={direction} category={category} other={other} article={article} loading={loading} onNavigate={onNavigate} />
				<ArticleFooter key={"ArticleFooter"} onNavigateTo={onNavigateTo(category, country)} language={language} {...{ direction, previous, next }} />
			</Placeholder>
		);
	}
}

const mapState = (s, p) => {
	return {
		article: s.article,
		match: p.match,
		country: p.country || s.country,
		direction: s.direction,
		language: s.language,
	};
};
const mapDispatch = (d, p) => {
	return {
		onMount: (category, slug) => {
			if (category && (category.fields.articles || category.fields.overview)) {
				if (category.fields.overview && category.fields.overview.fields.slug === slug) {
					return Promise.resolve(d(actions.selectArticle(category.fields.overview)));
				} else if (category.fields.articles) {
					return Promise.resolve(d(actions.selectArticle(_.first(category.fields.articles.filter(a => a && a.fields).filter(a => a.fields.slug === slug)))));
				}
			}

			return Promise.resolve(true);
		},
		onNavigateTo: (category, country) => slug => {
			console.log('Trying to go to', category, country, slug)
			setTimeout(() => {
				d(push(`/${country.fields.slug}/${category.fields.slug}/${slug}`));
			}, 200);
		},

		onNavigate: path => {
			d(push(path));
		},
	};
};

export default connect(mapState, mapDispatch)(Article);
