// libs
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import createHistory from "history/createBrowserHistory";
import { routerMiddleware } from "react-router-redux";
import { routerReducer } from "react-router-redux";
import reduxPromiseMiddleware from "redux-promise-middleware";
import reduxThunk from "redux-thunk";

// local
import reducers from "./reducers"; // Or wherever you keep your reducers
import actions from "./actions";
import instance from '../../backend/settings';
import { analyticsMiddleware } from "../middleware";
import ReactGA from "react-ga";

ReactGA.initialize(instance.env.thirdParty.analytics.gaTracker);

const window = global.window || {};
let history;

if (window && window.document) {
	history = createHistory();
} else {
	history = {
		listen: () => {},
		location: {
			pathname: "",
		},
		push: () => {},
		replace: () => {},
	};
}

let initialState = {};

if (window && window.initialState) {
	initialState = window.initialState;
}

const middleware = [
	reduxThunk, // Thunk middleware for Redux
	reduxPromiseMiddleware(), // Resolve, reject promises with conditional optimistic updates
	routerMiddleware(history), // routerMiddleware(browserHistory), // !! IMPORTANT for location.href changes,
	analyticsMiddleware(ReactGA),
];

const store = applyMiddleware(...middleware)(createStore)(
	combineReducers({
		...reducers,
		router: routerReducer,
	}),
	initialState,
	compose(window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
);

export { store, history, actions };
