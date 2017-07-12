import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter } from 'react-router-dom'

import { Route, Switch, withRouter} from 'react-router';
import { ConnectedRouter, } from 'react-router-redux'
import { Home, Article, Categories, CountryHome, CategoryHome, CountrySelectorScene, LanguageSelectorScene, } from './scenes';
import services from './backend';
import { history, actions } from './store';
import _ from 'lodash';


class CountrySwitcher extends Component {
    componentWillMount() {
        const { match, onMount } = this.props;
        onMount(match.params.country);
    }

    render() {
        return this.props.children || null;
    }
}

CountrySwitcher = connect((s, p) => {
    return {};
}, (d, p) => {
    return {
        onMount: (country) => {
            d(services.countries.get(country)).then((c) => d(actions.changeCountry(c.value)));
        }
    };
})(CountrySwitcher);


class CategorySwitcher extends Component {
    componentDidUpdate() {
        const { match, country, onRender } = this.props;
        if (country) {
            const category = _.first(country.content.filter(c => c.category && c.category.slug === match.params.category));
            onRender(category);
        }
    }

    render() {
        return this.props.children || null;
    }
}

CategorySwitcher = connect((s, p) => {
    return {
        country: s.country,
    };
}, (d, p) => {
    return {
        onRender: (category) => {
            d(actions.selectCategory(category));
        }
    };
})(CategorySwitcher);

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

class Router extends Component {
    render() {
        return (
            <ConnectedRouter history={history}>
                <span >
                    <ScrollToTop />
                    <Route exact path="/" component={Home} />
                    <Switch>
                        <Route exact path="/country-selector" component={CountrySelectorScene} />
                        <Route exact path="/language-selector" component={LanguageSelectorScene} />
                        <Route path="/:country">
                            <div >
                                <Route exact path="/:country/categories" component={Categories} />

                                <Route path="/:country" component={CountrySwitcher} />
                                <Route exact path="/:country" component={CountryHome} />

                                <Route path="/:country/:category">
                                    <div>
                                        <Route path="/:country/:category" component={CategorySwitcher} />
                                        <Switch>
                                            <Route exact path="/:country/search" component={() => <div>Search</div>} />
                                            <Route exact path="/:country/:category" component={CategoryHome} />
                                            <Route exact path="/:country/:category/:article" component={Article} />
                                        </Switch>
                                    </div>
                                </Route>
                            </div>
                        </Route>
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
