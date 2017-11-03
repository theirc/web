import React from "react";
import { connect } from "react-redux";
import { SearchPage } from "../components";

class Search extends React.Component {
	state = {};
	render() {
		return <SearchPage />;
	}
}

const mapState = ({ country }, p) => {
	return {};
};
const mapDispatch = (d, p) => {
	return {};
};

export default connect(mapState, mapDispatch)(Search);
