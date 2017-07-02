import React, { Component } from 'react';
import constants from './constants';
import { withTheme } from 'material-ui/styles'
import createPalette from 'material-ui/styles/palette';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { createMuiTheme } from 'material-ui/styles';

import { Route } from 'react-router'


import { Provider, connect } from 'react-redux'

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'

import { Home } from './scenes';
import store from './store';
import {history} from './config';


const theme = createMuiTheme({
    overrides: {
        MuiBottomNavigationButton: {
            selected: {
                color: '#000000',
            },
        },
    },
});

class ThemedApp extends Component {
    render() {
        const { organization } = this.props;

        return (
            <MuiThemeProvider theme={theme}>
                { /* ConnectedRouter will use the store from Provider automatically */}
                <ConnectedRouter history={history}>
                    <span className={organization}>
                        <Route exact path="/" component={Home} />
                        <Route path="/about" component={() => <div>about</div>} />
                        <Route path="/topics" component={() => <div>topics</div>} />
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
