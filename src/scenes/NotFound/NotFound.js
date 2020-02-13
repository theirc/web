// libs
import React from 'react';
import {Link} from 'react-router-dom';

// local
import Skeleton from '../../components/Skeleton/Skeleton';

/**
 * @class
 * @description 404 page
 */
class NotFound extends React.Component {

	constructor() {
		super();
		this.state = {};
	}

	render() {
		return (
			<Skeleton hideFeatures>
				<div style={{minHeight: 'calc(100vh)', textAlign: 'center'}}>
					<br /><br /><br /><div>[404 page placeholder]</div><br /><br />
					<Link to='/' style={{textDecoration: 'underline'}}>Go home</Link>
				</div>
			</Skeleton>
		);
	}
}

export default NotFound;
