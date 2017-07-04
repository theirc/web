import React from 'react';
import services from '../backend';
import { connect } from 'react-redux'
import {
    ArticlePage,
    ArticleFooter,
} from '../components';
import PropTypes from 'prop-types';
import Skeletton from './Skeletton'

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

        this.state = {};
    }

    componentWillMount() {
        this.props.onMount(this.props.match.params.article);
    }

    render() {
        const { match, articles } = this.props;
        const { country, category } = match.params;
        

        if (!articles) return (<div />);

        let article = articles.data;
        if (!article) return (<div />);

        return (<div>
            <Skeletton country={country} match={match} >
                <ArticlePage article={article}>
                </ArticlePage>
                <ArticleFooter />
            </Skeletton>
        </div>);
    }
}

const mapState = (s, p) => {
    return {
        articles: s.articles,
        match: p.match,
        country: s.country
    };
};
const mapDispatch = (d, p) => {
    return {
        onMount: (slug) => {
            d(services.articles.get(slug));
        }
    };
};

export default connect(mapState, mapDispatch)(Article);
