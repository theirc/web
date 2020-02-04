// libs
import React from "react";
import moment from "moment";
import { connect } from "react-redux";
import { push } from "react-router-redux";

// local
import { HomeWidget, HomeWidgetCollection, InstanceMovedWidget } from "../../components";
import i18nHelpers from '../../helpers/i18n';
import instance from '../../backend/settings';
import languages from './languages';
import Skeleton from '../../components/Skeleton/Skeleton';
import getSessionStorage from "../../shared/sessionStorage";

const NS = { ns: 'CountryHome' };

/**
 * @class
 * @description 
 */
class CountryHome extends React.Component {
	constructor() {
		super();
		this.state = {};
		i18nHelpers.loadResource(languages, NS.ns);
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

		if (!country || !country.fields.home) {
			return null;
		}

		const movedToPartner = instance.countries[country.fields.slug].movedToPartner;
		return (
			<div className='CountryHome'>
				<Skeleton hideShareButtons={true} homePage={true}>
					{!movedToPartner &&
						<HomeWidgetCollection key={"HomeWidgetCollection"} className='HomeWidgetCollection'>
							{country.fields.home.map(e => <HomeWidget direction={direction} onNavigate={onNavigate} language={language} country={country} content={e} key={e.sys.id} />)}
						</HomeWidgetCollection>
					}
					{movedToPartner &&
						<InstanceMovedWidget country={country} />
					}
				</Skeleton>
			</div>
		);
	}
}

const mapState = ({ country, direction }, p) => ({ country, direction });

const mapDispatch = (d, p) => ({ onNavigate: path => (d(push(path))) });

export default connect(mapState, mapDispatch)(CountryHome);
