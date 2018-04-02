import React, {
    Component
} from "react";
import {
    connect
} from "react-redux";
import {
    push
} from "react-router-redux";
import {
    CountrySelector,
    LanguageSelector,
    DetectLocationSelector
} from "../components";
import {
    Redirect
} from "react-router";
import {
    actions
} from "../store";
import servicesApi from "../content/servicesApi";
import measureDistance from "@turf/distance";
import _ from "lodash";
import getSessionStorage from "../shared/sessionStorage";
import PropTypes from "prop-types";

class Selectors extends Component {
    state = {
        currentPage: 1,
        countryList: null,
        country: null,
        language: null,
        redirect: "",
        regionList: null,
    };

    static contextTypes = {
        config: PropTypes.object,
        api: PropTypes.object,
    };

    componentWillMount() {
        let {
            language
        } = this.props;
        const sessionStorage = getSessionStorage();

        const {
            config
        } = this.context;
        const {
            languages
        } = config;

        if (languages.length === 1) {
            language = languages[0][0];
        }

        if (language && (!!sessionStorage.firstRequest || languages.length === 1)) {
            this.selectLanguage(language, 0);
        }
    }

    selectLanguage(language, timeout = 200) {
        const func = () => {
            const {
                onSelectLanguage,
                country,
                onGoTo
            } = this.props;
            const {
                api
            } = this.context;

            onSelectLanguage(language);
            this.setState({
                language,
                countryList: null,
                currentPage: 2,
            });
            if (country) {
                const sessionStorage = getSessionStorage();
                if (sessionStorage && sessionStorage.redirect) {
                    let {
                        redirect
                    } = sessionStorage;
                    delete sessionStorage.redirect;
                    if (/^\//.test(redirect)) {
                        redirect = redirect.substr(1);
                    }
                    onGoTo(redirect);
                } else {
                    this.selectCountry(country.fields.slug);
                }
            } else {
                servicesApi.fetchRegions(language).then((regionList) => {
                    api
                        .listCountries(language)
                        .then(e => e.items.map(a => ({
                            id: a.sys.id,
                            ...a.fields,
                            ...a
                        })))
                        .then(countryList => this.setState({
                            countryList,
                            regionList
                        }));
                })

            }
        };
        if (timeout) setTimeout(func, timeout);
        else func();
    }
    selectCountry(country, timeout = 200) {
        setTimeout(() => {
            if (country !== "detect-me") {
                this.setState({
                    currentPage: -1,
                    redirect: `/${country}`,
                });
            } else {
                this.setState({
                    currentPage: 3
                });
            }
        }, timeout);
    }

    backToLanguage() {
        this.setState({
            currentPage: 1,
            countryList: null,
            regionList: 1,
            country: null
        });
    }

    lookupCoordinates(l) {
        const {
            countryList
        } = this.state;
        const {
            coords
        } = l;
        const currentGeoJSON = {
            type: "Point",
            coordinates: [coords.longitude, coords.latitude],
        };

        let first = _.first(
            _.sortBy(countryList, country => {
                if (!country.coordinates) {
                    return 1e10;
                } else {
                    const {
                        lon,
                        lat
                    } = country.coordinates;
                    const countryGeoJSON = {
                        type: "Point",
                        coordinates: [lon, lat],
                    };

                    return measureDistance(countryGeoJSON, currentGeoJSON);
                }
            })
        );

        this.selectCountry(first.slug);
    }

    logError(l) {
        console.log(l);
    }

    render() {
        const {
            currentPage,
            countryList,
            regionList
        } = this.state;
        const {
            config
        } = this.context;
        const {
            languages
        } = config;
        const {
            language
        } = this.props

        switch (currentPage) {
            case 1:
                return (
                    <LanguageSelector
						languages={languages}
						onSelectLanguage={l => {
							this.selectLanguage(l);
						}}
					/>
                );
            case 2:
                if (!countryList) return null;
                if (countryList.length === 1) {
                    this.selectCountry(countryList[0].slug);
                    return null;
                } else {
                    return (
                        <CountrySelector
							onGoTo={slug => {
								this.selectCountry(slug);
							}}
							countryList={countryList}
							regionList={regionList}
							language={language}
							backToLanguage={this.backToLanguage.bind(this)}
						/>
                    );
                }
            case 3:
                return <DetectLocationSelector onBackToList={() => this.setState({ currentPage: 2 })} onLocationFound={l => this.lookupCoordinates(l)} onLocationError={l => this.logError(l)} />;
            case -1:
                return <Redirect to={this.state.redirect} />;
            default:
                return null;
        }
    }
}

const mapState = ({
    countryList,
    country,
    language
}, p) => {
    return {
        language,
        country,
    };
};
const mapDispatch = (d, p) => {
    return {
        onMountOrUpdate: language => {},

        onSelectLanguage: code => {
            d(actions.changeLanguage(code));
        },

        onGoTo: slug => {
            d(push(`/${slug}`));
        },
    };
};

export default connect(mapState, mapDispatch)(Selectors);
