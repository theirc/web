// libs
import React, { Component } from 'react';
// import { Close } from 'material-ui-icons';

// local
import './Alert.css';

/**
 * @class
 * @description 
 */
class Alert extends Component {

	render() {
		const { bgColor, fontColor, header, message, link, onClose } = this.props;

		return (
			<div className='Alert' style={{backgroundColor: bgColor || undefined}}>
				<div className='Alert--wrapper'>
					<span className='Alert--separator' style={{borderRightColor: fontColor || 'inherit'}}></span>
					<div>
						{header && <p>{header}</p>}
						{link ? <a href={link}><p style={{color: fontColor || 'inherit'}}>{message}</p></a> : <p style={{color: fontColor || 'inherit'}}>{message}</p>}
					</div>
					{/* {onClose && <Close className='Alert--close' color='contrast' size={36} onClick={onClose}/>} */}
				</div>
			</div>
		);
	}
}

export default Alert;
