import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { Route, Switch, withRouter, } from 'react-router';
import { ConnectedRouter, } from 'react-router-redux'
import { Skeletton, Home, Article, Categories, CountryHome, CategoryHome, } from './scenes';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { createMuiTheme } from 'material-ui/styles';
import services from './backend';
import { store, history, actions } from './store';
import _ from 'lodash';

const theme = createMuiTheme({
    overrides: {
        MuiBottomNavigationButton: {
            selected: {
                color: '#000000',
            },
        },
    },
});

class CountrySwitcher extends Component {
    componentWillMount() {
        const { match, onMount } = this.props;

        onMount(match.params.country);
    }

    render() {
        return null;
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
            const category = _.first(country.content.filter(c => c.category && c.category.slug == match.params.category));
            onRender(category);
        }
    }

    render() {
        return null;
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

class ThemedApp extends Component {
    render() {
        const { organization } = this.props;

        return (
            <MuiThemeProvider theme={theme}>
                <span className={organization}>
                    <Skeletton>
                        <ConnectedRouter history={history}>
                            <span >
                                <ScrollToTop />
                                <Route exact path="/" component={Home} />
                                <Switch>
                                    <Route exact path="/country-selector" component={() => <div />} />
                                    <Route exact path="/language-selector" component={() => <div />} />
                                    <Route exact path="/:country" component={CountryHome} />
                                </Switch>

                                <Route path="/:country" component={CountrySwitcher} />
                                <Route path="/:country/:category" component={CategorySwitcher} />

                                <Switch>
                                    <Route exact path="/:country/categories" component={Categories} />
                                    <Route exact path="/:country/search" component={() => <div>Search</div>} />
                                    <Route exact path="/:country/:category" component={CategoryHome} />
                                    <Route exact path="/:country/:category/:article" component={Article} />
                                </Switch>
                            </span>

                        </ConnectedRouter>
                    </Skeletton>
                </span>
            </MuiThemeProvider>
        );
    }
}

ThemedApp = connect(({ organization, match }) => {
    return {
        organization,
    }
})(ThemedApp);

class App extends Component {
    render() {

        return (
            <Provider store={store}>
                <ThemedApp />
            </Provider>
        );
    }
}

export default App;
