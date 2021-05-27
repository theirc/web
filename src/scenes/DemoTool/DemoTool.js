// libs
import React from "react";
import { connect } from "react-redux";
import { push } from "react-router-redux";

// local
import i18nHelpers from '../../helpers/i18n';
import LocalDemo from "./components/LocalDemo";
import getSessionStorage from "../../shared/sessionStorage";
import Skeleton from '../../components/Skeleton/Skeleton';
import languages from './languages';
const NS = { ns: 'DemoTool' };

/**
 * @class
 * @description 
 */
class DemoTool extends React.Component {
	constructor() {
		super();
		this.state = {};
	}
	componentDidMount(){
		i18nHelpers.loadResource(languages, NS.ns);
	}
	
	componentWillMount() {
		if (global.window) {
			const sessionStorage = getSessionStorage();
			const { firstRequest } = sessionStorage;
			if (!firstRequest) {
				sessionStorage.firstRequest = new Date().toString();
			}
		}
	}

	render() {
		const { country, language } = this.props;

		if (!country || !country.fields.home) {
			return null;
		}

		return (
			<Skeleton>
				<div className="SkeletonContainer">
					<LocalDemo country={country} language={language}></LocalDemo>
				</div>
			</Skeleton>
		);
	}
}

const mapState = ({ country, language }, p) => ({ language, country });

const mapDispatch = (d, p) => ({ onNavigate: path => (d(push(path))) });

export default connect(mapState, mapDispatch)(DemoTool);
