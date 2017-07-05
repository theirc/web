import React from 'react';
import services from '../backend';
import { connect } from 'react-redux'
import {
    ArticlePage,
    ArticleFooter,
} from '../components';
import PropTypes from 'prop-types';
import Skeletton from './Skeletton';
import { withRouter } from 'react-router';
import { push, } from 'react-router-redux';
import { history, actions } from '../store';

class Article extends React.Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                country: PropTypes.string.isRequired,
                category: PropTypes.string.isRequired,
                article: PropTypes.string.isRequired,
            }).isRequired
        }).isRequired,
        onMount: PropTypes.func.isRequired,
    }
    constructor() {
        super();

        this.state = { loading: false };
    }

    componentWillMount() {
        this.setState({ loading: true });

        this.props.onMount(this.props.match.params.article).then((s) => {
            return this.setState({ loading: false });
        });
    }

    componentWillUnmount() {
    }

    componentWillUpdate(nextProps, b) {
        if (this.props.match && nextProps.match && this.props.match.params.article != nextProps.match.params.article) {
            this.setState({ loading: true });
            this.props.onMount(nextProps.match.params.article).then((s) => {
                return this.setState({ loading: false });
            });
        }
    }

    render() {
        const { loading } = this.state;
        const { match, article } = this.props;
        const { category, country, onNavigateTo } = this.props;


        if (!article || !category) return (<div style={{height: 100}} />);

        let next = null, previous = null;
        if (category) {
            let index = category.articles.map(a => a.slug).indexOf(article.slug);

            if (index > 0) {
                previous = category.articles[index - 1];
            }

            if ((index + 1) < category.articles.length) {
                next = category.articles[index + 1];
            }
        }

        return (<div>
            <ArticlePage category={category.category} article={article} loading={loading}>
            </ArticlePage>
            <ArticleFooter previous={previous} next={next} onNavigateTo={onNavigateTo(category, country)} />
        </div>);
    }
}

const mapState = (s, p) => {
    return {
        article: s.article,
        match: p.match,
        country: s.country,
        category: s.category,
    };
};
const mapDispatch = (d, p) => {
    return {
        onMount: (slug) => {
            return d(services.articles.get(slug)).then((a) => {
                return d(actions.selectArticle(a.value));
            });
        },
        onNavigateTo: (category, country) => (slug) => {
            setTimeout(() => {
                history.push(`/${country.slug}/${category.category.slug}/${slug}`);
            }, 200);
        }
    };
};

export default connect(mapState, mapDispatch)(withRouter(Article));
