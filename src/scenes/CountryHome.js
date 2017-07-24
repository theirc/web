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

        if (geolocation) {
            geolocation.getCurrentPosition((c) => {
                onLocationRequested(c.coords, country);
            }, (e) => {
                console.log('Error with geolocation', e);
            },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
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
        return (<img style={{
            width: '100%',
            margin: 'auto'
        }} src="/images/mock.jpg" />);
    }
}

const mapState = (s, p) => {
    return {
        articles: s.articles,
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
                        console.log('This is closest to you', a);
                    }
                });
            }
        },

    };
};

export default connect(mapState, mapDispatch)(CountryHome);
