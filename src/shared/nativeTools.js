import { Linking } from "react-native";
export default {
	wrapHTML(direction = "ltr", theme = "", css = "", html = "") {
		return `<html dir="${direction}"><head><meta name="viewport" content="width=device-width, initial-scale=1"/>
		<link rel="stylesheet" href="https://www.refugee.info/css/app.css" /> </head>
		<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
		<link href="https://afeld.github.io/emoji-css/emoji.css" rel="stylesheet" />
		<style>
		${css}
		</style>
		</head>
		<body dir="${direction}">
			<div id="root">
				<span class="${direction} ${theme}"><div class="Skeleton"><div class="ArticlePage"><article >${html}</article></div></div></span>
			</div>
		</body>
		</html>`;
	},
	navigationStateChange(internalFunction, state, ref) {
		if (state.navigationType === "click") {
			ref.stopLoading();

			if (state.url.indexOf("/") === 0) {
				if (typeof internalFunction === "function") {
					internalFunction(state.url);
				}
			} else {
				Linking.openURL(state.url);
			}

			return false;
		}
		return true;
	},
};
