import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'


import createHistory from 'history/createBrowserHistory'
import { Route } from 'react-router'

import reducers from './reducers' // Or wherever you keep your reducers

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'

import { Home } from './scenes';

import { colors } from 'material-ui/styles';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import reduxThunk from 'redux-thunk';
import reduxPromiseMiddleware from 'redux-promise-middleware';

const middleware = [
  reduxThunk, // Thunk middleware for Redux
  reduxPromiseMiddleware(), // Resolve, reject promises with conditional optimistic updates
  routerMiddleware(history), // routerMiddleware(browserHistory), // !! IMPORTANT for location.href changes
];

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: colors.black,
  },
  appBar: {
  },
});


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


class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <MuiThemeProvider muiTheme={muiTheme}>
          { /* ConnectedRouter will use the store from Provider automatically */}
          <ConnectedRouter history={history}>
            <span>
              <Route exact path="/" component={Home} />
              <Route path="/about" component={() => <div>about</div>} />
              <Route path="/topics" component={() => <div>topics</div>} />
            </span>
          </ConnectedRouter>
        </MuiThemeProvider>
      </Provider>
    );
  }
}

export default App;
