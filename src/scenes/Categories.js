import React from 'react';
import { connect } from 'react-redux'
import {
} from '../components';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';
import {CategoryList} from '../components';


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
        const { country, onNavigate } = this.props;

        if (!country) {
            return null;
        }

        return <CategoryList categories={country.content} country={country} onNavigate={onNavigate} />;
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
        },
        onNavigate: (path) => {
            setTimeout(() => {
                d(push(path));
            }, 200);
        }
    };
};

export default connect(mapState, mapDispatch)(Categories);
