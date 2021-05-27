// libs
import React from 'react';
import { withTranslation } from 'react-i18next';
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
		const {t} = this.props;

		return (
			<Skeleton hideFeatures>
				<div className='NotFound'>
					<i className="fa fa-exclamation-triangle"></i>
					<div className='content'>
						<div className='title'>{t('title', NS)}</div>
						<div className='message'>{t('message', NS)}</div>
						<Link to='/'>{t('button', NS)}</Link>
					</div>
				</div>
			</Skeleton>
		);
	}
}

export default withTranslation()(NotFound);
