// libs
import React from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router";
import { Redirect } from 'react-router';

// local
import { EmbedMap } from "./components/EmbedMap";
import getSessionStorage from "../../shared/sessionStorage";
// import languages from './languages';
// import routes from './routes';

//var serviceList = require('./data.json'); //with path


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
		serviceList: []
	};

	constructor() {
		super();
		// i18nHelpers.loadResource(languages, NS.ns);
	}

	componentWillMount() {
		console.log("Will mount")
	}

	componentDidMount() {
		let country = "colombia";
		let BACKEND_URL =  'https://signpost-cms-qa.azurewebsites.net/api/services/zd/';
		
		fetch(BACKEND_URL+country, {
			"headers": {
				"accept": "*/*",
				"accept-language": "es",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-site"
			},
			"referrer": "https://www.cuentanos.org/el-salvador/services/all/",
			"referrerPolicy": "no-referrer-when-downgrade",
			"body": null,
			"method": "GET",
			"mode": "cors",
			"credentials": "omit"
		})
			.then(res => res.json())
			.then(response => {
				let services = response;
				console.log(services);
				this.setState({serviceList: services});
			})
			.catch((err) => {
				console.log("error", err);				
				return;
			});

	}
		
	sessionStorage = getSessionStorage();
	
	render() {	
		const { match } = this.props;
		const { serviceList } = this.state;
		return ( 
			<div className='Services'>
				{serviceList && serviceList.length > 0 && 
	
				<Switch>
					<Route
						exact
						path={`${match.url}/all`}
						component={() => (
							<div>
								<EmbedMap services={serviceList}/>
							</div>
							
						)}
					/>				
				<Route
					exact
					path={`${match.url}/by-category/:categoryId/`}
					component={() => (
						<div>
							<EmbedMap services={serviceList}/>
						</div>
					)}
				/>

				<Route
					exact
					path={`${match.url}/by-location/:location/`}
					component={props => (
						<div>
							<EmbedMap {...props} services={serviceList}/></div>
					)}
				/>
				<Route
					exact
					path={`${match.url}/by-category/:categoryId/location/:location`}
					component={() => (							
							<EmbedMap services={serviceList}/>
					)}
				/>				
				<Route component={() => <Redirect to={'/404'}/>} />
			</Switch>
			}
			{!serviceList || serviceList.length === 0 &&
				<div>Loading</div>
			}
			</div>
			

		);
	}
}

const mapState = ({ country, language, regions }) => ({ country, language, regions });

const mapDispatch = () => ({
	
});

export default connect(mapState, mapDispatch)(IntegrationServiceMap);
