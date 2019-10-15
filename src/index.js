import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { store } from "./store";
import { Provider } from "react-redux";
import * as serviceWorker from './registerServiceWorker';

console.log(process.env.REACT_APP_VERSION);
//serviceWorker.register();
serviceWorker.register();

const document = global.window && global.window.document;
ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById("root")
);
