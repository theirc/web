// libs
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

// local
import { CategoryList } from "../components";
import { history } from "../store";
import { Skeleton } from ".";

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

		if (!country) {
			return null;
		}

		return <Skeleton headerColor='light'>
			<div className="SkeletonContainer bg-gray">
				<CategoryList categories={country.fields.categories} country={country} onNavigate={onNavigate} language={language} />
			</div>
		</Skeleton>
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
		onMount: slug => { },
		onNavigate: path => {
			setTimeout(() => {
				history.push(path);
			}, 200);
		},
	};
};

export default connect(mapState, mapDispatch)(Categories);
