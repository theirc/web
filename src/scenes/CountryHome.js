import React from 'react';
import services from '../backend';
import { connect } from 'react-redux'
import {
} from '../components';

class CountryHome extends React.Component {
    constructor() {
        super();

        this.state = {};
    }

    componentWillMount() {
    }

    render() {

        return (<div>
                <div>Country Home</div>
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
        }
    };
};

export default connect(mapState, mapDispatch)(CountryHome);
