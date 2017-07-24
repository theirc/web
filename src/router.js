import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Route, Switch, withRouter, } from 'react-router';
import { HashRouter, BrowserRouter } from 'react-router-dom';

import { ConnectedRouter, } from 'react-router-redux'
import { Home, Article, Categories, CountryHome, CategoryHome, CountrySelectorScene, LanguageSelectorScene, } from './scenes';
import services from './backend';
import { history, actions } from './store';
import _ from 'lodash';



class ScrollToTop extends Component {
    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            window.scrollTo(0, 0)
        }
    }

    render() {
        return null;
    }
}

ScrollToTop = withRouter(ScrollToTop)

function withCountry(WrappedComponent) {
    class CountrySwitcher extends Component {
        constructor() {
            super();

            this.state = { loaded: false };
        }
        componentWillMount() {
            const { match, onMount } = this.props;
            onMount(match.params.country).then(c => {
            });
        }

        componentWillUpdate(newProps) {
            const { match, onMount } = this.props;
            if (newProps.match.params.country !== match.params.country) {
                onMount(match.params.country).then(c => {
                });
            }
        }

        render() {
            const { loaded } = this.state;
            return <WrappedComponent {...this.props} />;
        }
    }

    CountrySwitcher = connect(({ country }, p) => {
        return { country };
    }, (d, p) => {
        return {
            onMount: (country) => {
                return d(services.countries.get(country)).then((c) => {
                    d(actions.changeCountry(c.value));
                    return Promise.resolve(c.value);
                });
            }
        };
    })(CountrySwitcher);

    return CountrySwitcher;
}

function withCategory(WrappedComponent) {
    class CategorySwitcher extends Component {
        componentDidMount() {
            const { match, country, onRender } = this.props;


            if (country) {

                
                const category = _.first(country.content.filter(c => c.category && c.category.slug === match.params.category));
                onRender(category);
            }
        }

        componentWillUpdate(nextProps) {
            const {  onRender } = this.props;
            const { country, match } = nextProps;
            
            if (country) {
                const category = _.first(country.content.filter(c => c.category && c.category.slug === match.params.category));
                onRender(category);
            }
        }

        render() {
            return <WrappedComponent {...this.props} />;
        }
    }

    CategorySwitcher = connect((s, p) => {
        return {
            category: p.category || s.category,
        };
    }, (d, p) => {
        return {
            onRender: (category) => {
                d(actions.selectCategory(category));
            }
        };
    })(CategorySwitcher);

    return CategorySwitcher
}

class Router extends Component {
    render() {
        return (
            <ConnectedRouter history={history}>
                <span>
                    <ScrollToTop />
                    <Switch>
                        <Route exact path="/" component={(Home)} />
                        <Route exact path="/country-selector" component={CountrySelectorScene} />
                        <Route exact path="/:country/search" component={() => <div>Search</div>} />
                        <Route exact path="/language-selector" component={LanguageSelectorScene} />
                        <Route exact path="/:country/categories" component={withCountry(Categories)} />
                        <Route path="/:country/:category/:article" component={withCountry(withCategory(Article))} />
                        <Route path="/:country/:category" component={withCountry(withCategory(CategoryHome))} />
                        <Route path="/:country" component={withCountry(CountryHome)} />
                    </Switch>
                </span>
            </ConnectedRouter>
        );
    }
}

Router = connect(({ organization }) => {
    return {
        organization,
    }
})(Router);


export default Router;
