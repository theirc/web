import { createStore, combineReducers, applyMiddleware, compose } from "redux";

import reducers from "./reducers"; // Or wherever you keep your reducers
import actions from "./actions";

import { routerMiddleware } from "react-router-redux";
import { routerReducer } from "react-router-redux";

import reduxThunk from "redux-thunk";
import reduxPromiseMiddleware from "redux-promise-middleware";
import { analyticsMiddleware } from "./middleware.js";

import createMemoryHistory from "history/createMemoryHistory";

const history = createMemoryHistory();

const middleware = [
//	logMiddleware(),
	reduxThunk, // Thunk middleware for Redux
	reduxPromiseMiddleware(), // Resolve, reject promises with conditional optimistic updates
	routerMiddleware(history), // routerMiddleware(browserHistory), // !! IMPORTANT for location.href changes,
];

const store = applyMiddleware(...middleware)(createStore)(
	combineReducers({
		...reducers,
		router: routerReducer,
	}),
	{},
	compose(window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
);

function logMiddleware() {
	/**
     * This middleware parses all changes in route and sends a pageview to google analytics
     */
	return function middleware(store) {
		return function wrapDispatchToAddLogging(next) {
			return function dispatchAndLog(action) {
				console.log(action.type, action.payload);
				return next(action);
			};
		};
	};
}
export { store, history, actions };
