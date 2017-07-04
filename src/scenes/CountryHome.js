import React from 'react';
import services from '../backend';
import { connect } from 'react-redux'
import {
} from '../components';
import Skeletton from './Skeletton'

class CountryHome extends React.Component {
    constructor() {
        super();

        this.state = {};
    }

    componentWillMount() {
    }

    render() {
        const { match } = this.props;
        const { country } = match.params;

        return (<div>
            <Skeletton country={country} match={match} >
                <div>Country Home</div>
            </Skeletton>
        </div>);
    }
}

const mapState = (s, p) => {
    return {
        articles: s.articles,
        country: s.country
    };
};
const mapDispatch = (d, p) => {
    return {
        onMount: () => {
            d(services.articles.get('the-title-of-this-article-style-title'));
        }
    };
};

export default connect(mapState, mapDispatch)(CountryHome);
