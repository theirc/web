// libs
import React from "react";
import moment from "moment";
import { connect } from "react-redux";
import { push } from "react-router-redux";

// local
import { HomeWidget, HomeWidgetCollection} from "../../components";
import { InstanceMovedWidget } from './InstanceMovedWidget';
import Skeleton from '../../components/Skeleton/Skeleton';
import getSessionStorage from "../../shared/sessionStorage";

class CountryHome extends React.Component {
	constructor() {
		super();
		this.state = {};
	}

	requestLocation() {
		const { geolocation } = global.navigator;
		const { onLocationRequested, country } = this.props;

		if (geolocation) {
			geolocation.getCurrentPosition(
				c => {
					onLocationRequested(c.coords, country);
				},
				e => {
					console.log("Error with geolocation", e);
				},
				{
					enableHighAccuracy: true,
					timeout: 5000,
				}
			);
		}
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
		//this.requestLocation();
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

export default connect(mapState, mapDispatch)(CountryHome);
