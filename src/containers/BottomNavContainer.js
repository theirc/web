import React from 'react';
import { connect } from 'react-redux'
import {
    BottomNav,
} from '../components';
import PropTypes from 'prop-types';
import { push, } from 'react-router-redux';
import {history} from '../store';

class BottomNavContainer extends React.Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                country: PropTypes.string,
                category: PropTypes.string,
                article: PropTypes.string,
            }).isRequired
        })
    }
    constructor() {
        super();

        this.state = {};
    }

    componentWillMount() {
    }

    render() {
        const { category, country, onGoToCategories, onGoHome } = this.props;

        return (<BottomNav 
        category={category&&category.fields.slug} 
        country={country&&country.slug} 
        onGoToCategories={()=>onGoToCategories(country.fields.slug)}
        onGoHome={()=>onGoHome(country.fields.slug)}
         />);
    }
}

const mapState = ({ category, country }, p) => {
    return {
        category,
        country
    };
};
const mapDispatch = (d, p) => {
    return {
        onGoToCategories: (country) => {
            d(push(`/${country}/categories`))
        },
        onGoHome: (country) => {
            d(push(`/${country}`))
        }
    };
};

export default connect(mapState, mapDispatch)(BottomNavContainer);
