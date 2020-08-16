// libs
import React from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router";
import { push } from "react-router-redux";
import measureDistance from "@turf/distance";
import { Redirect } from 'react-router';
import Promise from "bluebird";
import _ from "lodash";

// local
import { EmbedMap } from "./components/EmbedMap";
import actions from "../../shared/redux/actions";
import getSessionStorage from "../../shared/sessionStorage";
import i18nHelpers from '../../helpers/i18n';
import instance from '../../backend/settings';
// import languages from './languages';
// import routes from './routes';
import servicesApi from "../../backend/servicesApi";

const NS = { ns: 'Services' };
var serviceList = require('./data.json'); //with path
console.log(serviceList.results);
/**
 * @class
 * @description Messiest class in the whole project
 */
class IntegrationServiceMap extends React.Component {
	state = {
		country: null,
		region: null,
		city: null,
		category: null,
		countryRegions: null,
	};

	constructor() {
		super();
		// i18nHelpers.loadResource(languages, NS.ns);
	}

	componentWillMount() {
		console.log("Will mount")
	}
		
	sessionStorage = getSessionStorage();
	
	render() {	
		const { match } = this.props;
		
		return (
			<div className='Services'>
				<Switch>
					<Route
						exact
						path={`${match.url}/`}
						component={props => (
							<div>/
								<EmbedMap services={serviceList.results}/>
							</div>
							
						)}
					/>				
				<Route
					exact
					path={`${match.url}/by-category/:categoryId/`}
					component={props => (
						<div>/by-category
							<EmbedMap services={serviceList.results}/>
						</div>
					)}
				/>

				<Route
					exact
					path={`${match.url}/by-location/:location/`}
					component={props => (
						<div>/by-location
							<EmbedMap services={serviceList.results}/></div>
					)}
				/>
				<Route
					exact
					path={`${match.url}/by-category/:categoryId/location/:location`}
					component={props => (							
							<EmbedMap services={serviceList.results}/>
					)}
				/>				
				<Route component={() => <Redirect to={'/404'}/>} />
			</Switch>
			</div>
		);
	}
}

const mapState = ({ country, language, regions }, p) => ({ country, language, regions });

const mapDispatch = (d, p) => ({
	
});

export default connect(mapState, mapDispatch)(IntegrationServiceMap);
