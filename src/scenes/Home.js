import React from 'react';
import {Redirect} from 'react-router';
import services from '../backend';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import {
} from '../components';

class Home extends React.Component {
    static contextTypes = {
        router: PropTypes.object
    }
    constructor() {
        super();

        this.state = {};
    }

    componentWillUpdate(nextProps) {
        console.log('Update', this.context, JSON.stringify(nextProps.match));
    }
    componentWillMount() {
        console.log('Mount', this.context, JSON.stringify(this.props.match));
    }

    render() {
        const {country} = this.props;
        if(country) {
            return (<Redirect to={`/${country.slug}`} />);
        } else {
            return (<Redirect to={`/language-selector`} />);
        }
        return (<div>
        </div>);
    }
}

const mapState = ({country}, p) => {
    return {
        country
    };
};
const mapDispatch = (d, p) => {
    return {
        onMount: () => {
        }
    };
};

export default connect(mapState, mapDispatch)(Home);
