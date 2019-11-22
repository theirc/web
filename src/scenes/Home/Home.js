// libs
import React from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

// local
import { } from '../../components';

class Home extends React.Component {
	static contextTypes = {
		router: PropTypes.object
	}

	constructor() {
		super();
		this.state = {};
	}

	render() {
		const { country } = this.props;

		if (country) {
			return (<Redirect to={`/${country.fields.slug}`} />);
		} else {
			return (<Redirect to={`/selectors`} />);
		}
	}
}

const mapState = ({ country }, p) => {
	return {
		country
	};
};

const mapDispatch = (d, p) => {
	return {
		onMount: () => {
		}
	};
};

export default connect(mapState, mapDispatch)(Home);
