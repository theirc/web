import React from 'react';
import moment from 'moment';
import services from '../backend';
import { actions } from '../store';
import { connect } from 'react-redux'
import {
} from '../components';

class CountryHome extends React.Component {
    constructor() {
        super();

        this.state = {};
    }

    requestLocation() {
        const { geolocation } = global.navigator;
        const { onLocationRequested, country } = this.props;
        console.log(this.props)

        if (geolocation) {
            geolocation.getCurrentPosition((c) => {
                onLocationRequested(c.coords, country);
            })
        }

    }

    componentWillMount() {
        const { firstRequest } = global.window.localStorage;
        if (!firstRequest) {
            global.window.localStorage.firstRequest = moment().toString();
        }
        const { onMount } = this.props;
        onMount();
        this.requestLocation();
    }
    componentWillUpdate() {
        this.requestLocation();
    }

    render() {
        const { currentCoordinates } = this.props;
        return (<div>
            <div>Country Home</div>
            <div>{currentCoordinates && currentCoordinates.latitude}</div>
            <div>{currentCoordinates && currentCoordinates.longitude}</div>
        </div>);
    }
}

const mapState = (s, p) => {
    return {
        articles: s.articles,
        country: s.country,
        currentCoordinates: s.currentCoordinates
    };
};
const mapDispatch = (d, p) => {
    return {
        onMount: () => {
        },
        onLocationRequested: (coords, country) => {
            if (country) {
                d(services.locations.get(`near/${coords.longitude}, ${coords.latitude}`)).then((a) => {
                    if (country.locations.map(l => l.location._id).indexOf(a._id) > -1) {
                        console.log(a);

                    }
                });
            }
        },

    };
};

export default connect(mapState, mapDispatch)(CountryHome);
