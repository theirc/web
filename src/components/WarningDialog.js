import React, { Component, } from 'react';
import { AppBar, Paper, BottomNavigation, BottomNavigationItem } from 'material-ui';
import { cyan500, black, white } from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { FlatButton, IconButton, FontIcon } from 'material-ui';
import IconLocationOn from 'material-ui/svg-icons/communication/location-on';
import SearchIcon from 'react-material-icons/icons/action/search';

import './WarningDialog.css';

export default class AppHeader extends Component {
    render() {
        const { text, children, type } = this.props;
        const containerClassName = `warning-dialog-container-${type||'yellow'}`;
        return (<div className={containerClassName}>
            <div className="warning-dialog-container-inner">
                {text || children}
            </div>
        </div>);
    }

}
