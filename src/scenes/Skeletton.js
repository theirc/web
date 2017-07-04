import React from 'react';
import services from '../backend';
import { connect } from 'react-redux'
import {
    AppHeader,
    WarningDialog,
    Footer
} from '../components';
import { BottomNavContainer } from '../containers'
import { push, } from 'react-router-redux';

class Skeletton extends React.Component {
    render() {
        const {
            children,
            country,
            match,
            onHomeTap,
            onSearchTap,
            onCountryTap
        } = this.props;

        return (<div>
            <AppHeader country={country}
                onHomeTap={onHomeTap}
                onSearchTap={onSearchTap}
                onCountryTap={onCountryTap}
            />
            {children}
            <Footer />
            <BottomNavContainer match={match} />
        </div>);
    }
}

const mapState = (s, p) => {
    return {
    };
};
const mapDispatch = (d, p) => {
    return {
        onHomeTap: () => {
            d(push(`/${p.match.params.country||''}`))
        },
        onSearchTap: () => {
            d(push(`/${p.match.params.country}/search`))
        },
        onCountryTap: () => {
            d(push(`/country-selector`))
        },
    };
};

export default connect(mapState, mapDispatch)(Skeletton);
