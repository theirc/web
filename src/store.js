import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import createHistory from 'history/createBrowserHistory'

import reducers from './reducers'; // Or wherever you keep your reducers
import actions from './actions';

import {  routerReducer, routerMiddleware } from 'react-router-redux'

import reduxThunk from 'redux-thunk';
import reduxPromiseMiddleware from 'redux-promise-middleware';

const history = createHistory();

const middleware = [
    reduxThunk, // Thunk middleware for Redux
    reduxPromiseMiddleware(), // Resolve, reject promises with conditional optimistic updates
    routerMiddleware(history), // routerMiddleware(browserHistory), // !! IMPORTANT for location.href changes
];

const store = applyMiddleware(...middleware)(createStore)(
    combineReducers({
        ...reducers,
        router: routerReducer
    }),
    compose(window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
)

export {
    store,
    history,
    actions
}