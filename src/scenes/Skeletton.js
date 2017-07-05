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
            onGoHome,
            onGoToSearch,
            onChangeLocation,
            onChangeCountry,
            onChangeLanguage,
        } = this.props;

        return (<div>
            <AppHeader country={country}
                onGoHome={onGoHome(country)}
                onGoToSearch={onGoToSearch(country)}
                onChangeCountry={onChangeCountry}
            />
            {children}
            <Footer
                onChangeLocation={onChangeLocation}
                onChangeLanguage={onChangeLanguage} />
            <BottomNavContainer match={match} />
        </div>);
    }
}

const mapState = (s, p) => {
    return {
        country: s.country,
    };
};
const mapDispatch = (d, p) => {
    return {
        onGoHome: (country) => () => {
            d(push(`/${country.slug || ''}`))
        },
        onGoToSearch: (country) => () => {
            d(push(`/${country.slug}/search`))
        },
        onChangeCountry: () => {
            d(push(`/country-selector`))
        },
        onChangeLocation: () => {
            d(push(`/language-selector`))
        },
    };
};

export default connect(mapState, mapDispatch)(Skeletton);
