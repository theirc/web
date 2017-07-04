import React from 'react';
import services from '../backend';
import { connect } from 'react-redux'
import {
} from '../components';
import PropTypes from 'prop-types';
import Skeletton from './Skeletton'

class Categories extends React.Component {
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
        const { match } = this.props;

        return (<div>
            <Skeletton  match={match} >
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
        onLoad: (slug) => {
        }
    };
};

export default connect(mapState, mapDispatch)(Categories);
