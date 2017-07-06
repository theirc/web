import React from 'react';
import services from '../backend';
import { connect } from 'react-redux'
import {
} from '../components';

class Home extends React.Component {
    constructor() {
        super();

        this.state = {};
    }

    componentWillMount() {
    }

    render() {
        return (<div>
        </div>);
    }
}

const mapState = (s, p) => {
    return {
        articles: s.articles,
    };
};
const mapDispatch = (d, p) => {
    return {
        onMount: () => {
            d(services.articles.get('the-title-of-this-article-style-title'));
        }
    };
};

export default connect(mapState, mapDispatch)(Home);
