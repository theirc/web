import React from 'react';
import PropTypes from 'prop-types';
import services from '../backend';
import { connect } from 'react-redux'
import htmlEncode from 'js-htmlencode';
import {
    DetailPage,
    AppHeader,
    BottomNav,
    WarningDialog
} from '../components';
import _ from 'lodash';

class Home extends React.Component {
    static PropTypes = {

    }
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
        let article = _.first((articles.queryResult || []))
        if (!article) return (<div />);


        return (<div>
                <AppHeader />
            <DetailPage title={article.title}>
                <div dangerouslySetInnerHTML={{ __html: article.body }}></div>
            </DetailPage>
            <BottomNav />
        </div>);
        /* return (); */
    }
}

const mapState = (s, p) => {
    console.log(s);
    return {
        articles: s.articles
    };
};
const mapDispatch = (d, p) => {
    return {
        onLoad: () => {
            d(services.articles.find());
        }
    };
};

export default connect(mapState, mapDispatch)(Home);
