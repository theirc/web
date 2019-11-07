/*jshint ignore:start*/
/*eslint-disable*/
export function analyticsMiddleware(ga) {
	/**
     * This middleware parses all changes in route and sends a pageview to google analytics
     */
	return function middleware(store) {
		return function wrapDispatchToAddLogging(next) {
			return function dispatchAndLog(action) {
				switch (action.type) {
					case "@@router/LOCATION_CHANGE":
						ga.pageview(window.location.pathname + window.location.search);
						break;
				}
				return next(action);
			};
		};
	};
}
/*eslint-enable*/
/*jshint ignore:end*/
