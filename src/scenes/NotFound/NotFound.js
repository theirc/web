// libs
import React from 'react';
import { translate } from 'react-i18next';
import { Link } from 'react-router-dom';

// local
import Skeleton from '../../components/Skeleton/Skeleton';
import i18nHelpers from '../../helpers/i18n';
import languages from './languages';
import './NotFound.css';

const NS = { ns: 'NotFound' };

/**
 * @class
 * @description 404 page
 */
class NotFound extends React.Component {

	constructor() {
		super();
		i18nHelpers.loadResource(languages, NS.ns);
	}

	render() {
		return (
			<Skeleton hideFeatures>
				<div className='NotFound'>
					<span></span>
					<div className='content'>
						<br /><br /><br />
						<div className='message'>[404 page placeholder]</div>
						<br /><br />
						<Link to='/'>Go home</Link>
					</div>
				</div>
			</Skeleton>
		);
	}
}

export default translate()(NotFound);
