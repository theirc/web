import React, { Component, } from 'react';
import { AppBar, Paper, BottomNavigation, BottomNavigationItem } from 'material-ui';
import { FlatButton, IconButton, FontIcon } from 'material-ui';
import IconLocationOn from 'material-ui-icons';
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
