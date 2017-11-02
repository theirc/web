import React from "react";
import { connect } from "react-redux";
import {} from "../components";

class Home extends React.Component {
	state = {};
	render() {
		return <div>Search</div>;
	}
}

const mapState = ({ country }, p) => {
	return {};
};
const mapDispatch = (d, p) => {
	return {};
};

export default connect(mapState, mapDispatch)(Home);
