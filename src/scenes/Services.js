import React from "react";
import { connect } from "react-redux";
import { ServiceMap } from "../components";
const request = require("superagent");

class Services extends React.Component {
	state = {
		services: [],
	};
	componentWillReceiveProps(nextProps) {
		const { country } = nextProps;

		request
			.get(`https://admin.next.refugee.info/e/production/v2/services/search/?filter=relatives&geographic_region=${country.fields.slug}&page=1&page_size=1000&type_numbers=`)
			.end((err, res) => {
				this.setState({ services: res.body.results });
			});
	}

	render() {
		const { services } = this.state;
		return <ServiceMap services={services} />;
	}
}

const mapState = ({ country }, p) => {
	return { country };
};
const mapDispatch = (d, p) => {
	return {};
};

export default connect(mapState, mapDispatch)(Services);
