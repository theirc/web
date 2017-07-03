import React from 'react';
import services from '../backend';
import { connect } from 'react-redux'
import {
    ArticlePage,
    AppHeader,
    BottomNav,
    WarningDialog,
    Footer
} from '../components';

class Home extends React.Component {
    constructor() {
        super();

        this.state = {};
    }

    componentWillMount() {
        this.props.onLoad();
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
            <Footer />
            <BottomNav />
        </div>);
        /* return (); */
    }
}

const mapState = (s, p) => {
    return {
        articles: s.articles
    };
};
const mapDispatch = (d, p) => {
    return {
        onLoad: () => {
            d(services.articles.get('the-title-of-this-article-style-title'));
        }
    };
};

export default connect(mapState, mapDispatch)(Home);
