// libs
import React from "react";
import moment from "moment";
import { connect } from "react-redux";
import { push } from "react-router-redux";

// local
import { HomeWidget, HomeWidgetCollection, InstanceMovedWidget } from "../../components";
import Skeleton from '../../components/Skeleton/Skeleton';
import getSessionStorage from "../../shared/sessionStorage";

class CountryHome extends React.Component {
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
	}

	render() {
		const { country, onNavigate, direction, language } = this.props;
		const instanceMoved = country.fields.slug === 'bulgaria';

		if (!country || !country.fields.home) {
			return null;
		}

		return (
			<Skeleton hideShareButtons={true} homePage={true}>
				{!instanceMoved &&
					<HomeWidgetCollection key={"HomeWidgetCollection"}>
						{country.fields.home.map(e => <HomeWidget direction={direction} onNavigate={onNavigate} language={language} country={country} content={e} key={e.sys.id} />)}
					</HomeWidgetCollection>
				}
				{instanceMoved &&
					<InstanceMovedWidget link="http://refugeelife.bg/" />
				}
			</Skeleton>
		);
	}
}

const mapState = (s, p) => {
	return {
		articles: s.articles,
		country: s.country,
		direction: s.direction,
		currentCoordinates: s.currentCoordinates,
	};
};

const mapDispatch = (d, p) => {
	return {
		onNavigate: path => {
			d(push(path));
		},
	};
};

export default connect(mapState, mapDispatch)(CountryHome);