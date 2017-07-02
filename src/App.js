import React, { Component } from 'react';
import constants from './constants';
import { withTheme } from 'material-ui/styles'

import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider, connect } from 'react-redux'
import createPalette from 'material-ui/styles/palette';


import createHistory from 'history/createBrowserHistory'
import { Route } from 'react-router'

import reducers from './reducers'; // Or wherever you keep your reducers
import actions from './actions';

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'

import { Home } from './scenes';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { createMuiTheme } from 'material-ui/styles';

import reduxThunk from 'redux-thunk';
import reduxPromiseMiddleware from 'redux-promise-middleware';

const middleware = [
    reduxThunk, // Thunk middleware for Redux
    reduxPromiseMiddleware(), // Resolve, reject promises with conditional optimistic updates
    routerMiddleware(history), // routerMiddleware(browserHistory), // !! IMPORTANT for location.href changes
];


// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory()

// Build the middleware for intercepting and dispatching navigation actions
//const middleware = routerMiddleware(history)

// Add the reducer to your store on the `router` key
// Also apply our middleware for navigating
const store = applyMiddleware(...middleware)(createStore)(
    combineReducers({
        ...reducers,
        router: routerReducer
    }),
    compose(window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
)

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
