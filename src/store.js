import { createStore, combineReducers, applyMiddleware, compose } from 'redux'

import reduxThunk from 'redux-thunk';
import reduxPromiseMiddleware from 'redux-promise-middleware';
import reducers from './reducers'; 
import actions from './actions';

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'

import config  from './config';

const middleware = [
    reduxThunk, 
    reduxPromiseMiddleware(), 
    routerMiddleware(history), 
];


export default applyMiddleware(...middleware)(createStore)(
    combineReducers({
        ...reducers,
        router: routerReducer
    }),
    compose(window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
)
