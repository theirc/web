import React, { Component, } from 'react';
import { AppBar, Paper, BottomNavigation, BottomNavigationItem } from 'material-ui';
import { white } from 'material-ui/styles/colors';
import { Button, IconButton, FontIcon, } from 'material-ui';
import { IconLocationOn } from 'material-ui-icons';
import SearchIcon from 'react-material-icons/icons/action/search';
import Headroom from 'react-headrooms';
import Toolbar from 'material-ui/Toolbar';
import {connect} from 'react-redux';
import actions from '../actions';

import './AppHeader.css'


class AppHeader extends Component {
    render() {
        const { changeCountry, search, home } = this.props;
        return (
            <div>
                <Headroom tolerance={5} offset={200}>
                    <div className="app-bar">
                        <div className="app-bar-container">
                            <img onClick={home} src="logo.png" className="app-bar-logo" />

                        </div>
                        <div className="app-bar-container">
                            <div className="app-bar-buttons">
                                <Button color="contrast">Greece</Button>

                                <div className="app-bar-separator"></div>
                                <IconButton color="contrast"><SearchIcon /></IconButton>

                            </div>
                        </div>
                    </div>
                </Headroom>
                <div style={{ backgroundColor: '#000000', display: 'block', width: '100%', height: 64 }}></div>
            </div>
        );
    }

}

export default AppHeader;