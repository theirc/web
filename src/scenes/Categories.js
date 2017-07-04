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
            }).isRequired
        }).isRequired,
        onMount: PropTypes.func.isRequired
    }

    componentWillMount() {
        this.props.onMount(this.props.match.params.country);
    }

    render() {
        const { match } = this.props;

        return (<div>
            <Skeletton  match={match} >
                <div>List of categories</div>
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
        }
    };
};

export default connect(mapState, mapDispatch)(Categories);
