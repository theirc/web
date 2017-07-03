import React from 'react';
import services from '../backend';
import { connect } from 'react-redux'
import {
    ArticlePage,
    ArticleFooter,
    AppHeader,
    BottomNav,
    WarningDialog,
    Footer
} from '../components';
import PropTypes from 'prop-types';

class Article extends React.Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                country: PropTypes.string.isRequired,
                category: PropTypes.string.isRequired,
                article: PropTypes.string.isRequired,
            }).isRequired
        }).isRequired
    }
    constructor() {
        super();

        this.state = {};
    }

    componentWillMount() {
        this.props.onLoad(this.props.match.params.article);
    }

    render() {
        const { articles } = this.props;
        if (!articles) return (<div />);

        let article = articles.data;
        if (!article) return (<div />);


        return (<div className="">
            <AppHeader />
            <WarningDialog type="red" dismiss={true}>
                This is still just a mockup.
                </WarningDialog>
            <ArticlePage article={article}>
            </ArticlePage>
            <ArticleFooter />
            <Footer />
            <BottomNav />
        </div>);
        /* return (); */
    }
}

const mapState = (s, p) => {
    return {
        articles: s.articles,
        match: p.match
    };
};
const mapDispatch = (d, p) => {
    return {
        onLoad: (slug) => {
            d(services.articles.get(slug));
        }
    };
};

export default connect(mapState, mapDispatch)(Article);
