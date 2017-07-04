import React from 'react';
import services from '../backend';
import { connect } from 'react-redux'
import {
    BottomNav,
} from '../components';
import PropTypes from 'prop-types';
import { push, } from 'react-router-redux';

class BottomNavContainer extends React.Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                country: PropTypes.string,
                category: PropTypes.string,
                article: PropTypes.string,
            }).isRequired
        }).isRequired
    }
    constructor() {
        super();

        this.state = {};
    }

    componentWillMount() {
    }

    render() {
        const { match, onGoToCategories } = this.props;
        const {country, category, article} = match.params;

        return (<BottomNav category={category} country={country} onGoToCategories={onGoToCategories} />);
    }
}

const mapState = (s, p) => {
    return {
    };
};
const mapDispatch = (d, p) => {
    return {
        onGoToCategories: () => {
            const {country} = p.match.params;

            d(push(`/${country}/categories`))
        }
    };
};

export default connect(mapState, mapDispatch)(BottomNavContainer);
