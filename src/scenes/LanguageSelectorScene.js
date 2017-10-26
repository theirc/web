import React from 'react';
import services from '../backend';
import { connect } from 'react-redux';
import { push, } from 'react-router-redux';
import { Redirect } from 'react-router';
import cms from "../content/cms";

import {
    LanguageSelector
} from '../components';
import { actions } from '../store';
import {history} from '../store';

class LanguageSelectorScene extends React.Component {
    constructor() {
        super();
        this.state = { selected: false };
    }
    componentWillMount() {
        const { onMountOrUpdate, language } = this.props;
        onMountOrUpdate();
    }

    selectLanguage(redirect, language) {
        const { onGoTo, onSelectLanguage } = this.props;
        this.setState({ selected: true }, () => {
            setTimeout(() => {
                onSelectLanguage(language);
                onGoTo(redirect);
            }, 300)
        });
    }

    render() {
        const { country, language, countryList, onGoTo, onSelectLanguage } = this.props;
        const { selected } = this.state;
        
		let firstTimeHere = false;
		if (global.window) {
			const { firstRequest } = global.window.localStorage;
			firstTimeHere = !firstRequest;
		}

        const languages = cms.siteConfig.languages;


        if ((!selected) && (firstTimeHere || !language)) {
            if (!country) {
                return <LanguageSelector languages={languages} onSelectLanguage={this.selectLanguage.bind(this, 'country-selector')} />;
            } else {
                return <LanguageSelector languages={languages} onSelectLanguage={this.selectLanguage.bind(this, country.fields.slug)} />;
            }
        } else {
            if (!country) {
                return (<Redirect to={`/country-selector`} />);
            } else {
                return (<Redirect to={`/${country.fields.slug}`} />);
            }
        }

    }
}

const mapState = ({ countryList, country, language }, p) => {
    return {
        countryList,
        country,
        language,
    };
};
const mapDispatch = (d, p) => {
    return {
        onMountOrUpdate: () => {
        },
        onSelectLanguage: (code) => {
            d(actions.changeLanguage(code));
        },
        onGoTo: (slug) => {
            d(push(`/${slug}`))
        }
    };
};

export default connect(mapState, mapDispatch)(LanguageSelectorScene);
