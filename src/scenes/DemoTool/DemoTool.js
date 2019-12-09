// libs
import React from "react";
import moment from "moment";
import { connect } from "react-redux";
import { push } from "react-router-redux";

// local
import { LocalDemo } from "./components/LocalDemo";
import getSessionStorage from "../../shared/sessionStorage";
import { Skeleton } from "..";

class DemoTool extends React.Component {
	constructor() {
		super();

		this.state = {};
	}

	componentWillMount() {
		if (global.window) {
			const sessionStorage = getSessionStorage();
			const { firstRequest } = sessionStorage;
			if (!firstRequest) {
				sessionStorage.firstRequest = moment().toString();
			}
		}

		const { onMount } = this.props;
		onMount();
	}

	render() {
		const { country, language } = this.props;

		if (!country || !country.fields.home) {
			return null;
		}

		return (
			<Skeleton>
				<div className="SkeletonContainer">
					<LocalDemo country={country} language={language}></LocalDemo>
				</div>
			</Skeleton>
		);
	}
}

const mapState = (s, p) => {
	return {
		language: s.language,
		country: s.country,
	};
};

const mapDispatch = (d, p) => {
	return {
		onMount: () => { },
		onLocationRequested: (coords, country) => {
			if (country) {
			}
		},
		onNavigate: path => {
			d(push(path));
		},
	};
};

export default connect(mapState, mapDispatch)(DemoTool);
