import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { ConnectedRouter, } from 'react-router-redux'
import { Home, Article, Categories, CountryHome, CategoryHome, } from './scenes';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { createMuiTheme } from 'material-ui/styles';
import { store, history, actions } from './store'

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
            d(actions.changeCountry(country))
        }
    };
})(CountrySwitcher);

class ThemedApp extends Component {
    render() {
        const { organization } = this.props;

        return (
            <MuiThemeProvider theme={theme}>
                <ConnectedRouter history={history}>
                    <span className={organization}>
                        <Route exact path="/" component={Home} />
                        <Switch>
                            <Route exact path="/country-selector" component={() => <div />} />
                            <Route exact path="/:country" component={CountryHome} />
                        </Switch>

                        <Route exact path="/:country/:category" component={CategoryHome} />
                        <Route path="/:country" component={CountrySwitcher} />
                        <Route path="/:country/categories" component={Categories} />
                        <Route path="/:country/:category/:article" component={Article} />
                    </span>
                </ConnectedRouter>
            </MuiThemeProvider>
        );
    }
}

ThemedApp = connect(({ organization }) => {
    return {
        organization
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
