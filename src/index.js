import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { store } from "./store";
import { Provider } from "react-redux";

//import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onClick
// http://stackoverflow.com/a/34015469/988941
//injectTapEventPlugin();
const document = global.window && global.window.document;
ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById("root")
);
