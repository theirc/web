import React, { Component, } from 'react';
import { Button, IconButton, } from 'material-ui';
import SearchIcon from 'react-material-icons/icons/action/search';
import Headroom from 'react-headrooms';
import PropTypes from 'prop-types';

import './AppHeader.css'


export default class AppHeader extends Component {
    static PropTypes = {
        onCountryTap: PropTypes.func, 
        onSearchTap:PropTypes.func, 
        onHomeTap: PropTypes.func, 
        country: PropTypes.string, 
    }
    
    render() {
        const { onCountryTap, onSearchTap, onHomeTap, country } = this.props;
        const noop = () => {console.log('noop')};
        return (
            <div>
                <Headroom tolerance={5} offset={200}>
                    <div className="app-bar">
                        <div className="app-bar-container" onTouchTap={onHomeTap||noop}>
                            <img onClick={onHomeTap} src="logo.png" className="app-bar-logo" alt=" " />
                        </div>
                        <div className="app-bar-container">
                            <div className="app-bar-buttons">
                                <Button color="contrast" onTouchTap={onCountryTap||noop}>{country||" "}</Button>
                                <div className="app-bar-separator"></div>
                                <IconButton color="contrast" onTouchTap={onSearchTap||noop}><SearchIcon /></IconButton>
                            </div>
                        </div>
                    </div>
                </Headroom>
                <div style={{ backgroundColor: '#000000', display: 'block', width: '100%', height: 64 }}></div>
            </div>
        );
    }

}
