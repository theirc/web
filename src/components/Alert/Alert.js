// libs
import React, { Component } from 'react';
import { Close } from 'material-ui-icons';

// local
import './Alert.css';

/**
 * @class
 * @description 
 */
class Alert extends Component {

	render() {
		const { message, link, onClose } = this.props;

		return (
			<div className='Alert'>
				<div className='Alert--wrapper'>
					<span className='Alert--separator'></span>
					{link ? <a href={link}><p>{message}</p></a> : <p>{message}</p>}
					{onClose && <Close className='Alert--close' color='contrast' size={36} onClick={onClose}/>}
				</div>
			</div>
		);
	}
}

export default Alert;
