// libs
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

// local
import { store } from "./shared/redux/store";
import App from "./App";
import * as serviceWorker from './registerServiceWorker';

console.log(process.env.REACT_APP_VERSION);
serviceWorker.register();

const document = global.window && global.window.document;
ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById("root")
);
