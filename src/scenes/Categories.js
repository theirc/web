import React from "react";
import { connect } from "react-redux";
import { InstanceMovedWidget } from "../components";
import PropTypes from "prop-types";
import { CategoryList } from "../components";
import { history } from "../store";

class Categories extends React.Component {
	static propTypes = {
		match: PropTypes.shape({
			params: PropTypes.shape({
				country: PropTypes.string.isRequired,
			}).isRequired,
		}).isRequired,
		onMount: PropTypes.func.isRequired,
	};

	componentWillMount() {
		this.props.onMount(this.props.match.params.country);
	}

	render() {
		const { country, onNavigate, language } = this.props;
		const instanceMoved = country.fields.slug === 'bulgaria';

		if (!country) {
			return null;
		}

		return (
			<div>
				{ !instanceMoved &&
					<CategoryList categories={country.fields.categories} country={country} onNavigate={onNavigate} language={language} />
				}
				{ instanceMoved &&
					<InstanceMovedWidget country="Bulgaria" link="http://refugeelife.bg/" label="Go to refugeelife.bg" />
				}
			</div>
		);
	}
}

const mapState = (s, p) => {
	return {
		articles: s.articles,
		match: p.match,
		country: s.country,
	};
};
const mapDispatch = (d, p) => {
	return {
		onMount: slug => {},
		onNavigate: path => {
			setTimeout(() => {
				history.push(path);
			}, 200);
		},
	};
};

export default connect(mapState, mapDispatch)(Categories);
