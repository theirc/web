import React, { Component, } from 'react';
import { Button, IconButton, } from 'material-ui';
import Headroom from 'react-headrooms';
import PropTypes from 'prop-types';
import { Search } from 'material-ui-icons';

import './AppHeader.css'


export default class AppHeader extends Component {
    static propTypes = {
        onChangeCountry: PropTypes.func, 
        onGoToSearch:PropTypes.func, 
        onGoHome: PropTypes.func, 
        country: PropTypes.object, 
    }
    
    render() {
        const { onChangeCountry, onGoToSearch, onGoHome, country } = this.props;
        const noop = () => {console.log('noop')};
        return (
            <div>
                <Headroom tolerance={5} offset={200}>
                    <div className="app-bar">
                        <div className="app-bar-container" onTouchTap={onGoHome||noop}>
                            <img onClick={onGoHome} src="/logo.png" className="app-bar-logo" alt=" " />
                        </div>
                        <div className="app-bar-container">
                            <div className="app-bar-buttons">
                                <Button color="contrast" onTouchTap={onChangeCountry||noop}>{(country&&country.name)||" "}</Button>
                                <div className="app-bar-separator"></div>
                                <IconButton color="contrast" onTouchTap={onGoToSearch||noop}><Search /></IconButton>
                            </div>
                        </div>
                    </div>
                </Headroom>
                <div style={{ backgroundColor: '#000000', display: 'block', width: '100%', height: 64 }}></div>
            </div>
        );
    }

}
