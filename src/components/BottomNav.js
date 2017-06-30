import React, { Component, } from 'react';
import { AppBar, Paper, BottomNavigation, BottomNavigationItem } from 'material-ui';
import { cyan500, black, white } from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { FlatButton, IconButton, FontIcon } from 'material-ui';

import {CommunicationLocationOn, ActionHome, ActionSearch} from 'material-ui/svg-icons';


export default class BottomNav extends Component {
    constructor() {
        super();

        this.state = {
            selectedIndex: 0,
        };
    }

    select(selectedIndex = 0) {
        this.setState({ selectedIndex });
    }

    render() {
        return (
            <Paper zDepth={1} style={{
                position: 'fixed',
                bottom: 0,
                width: '100%',
            }}>
                <BottomNavigation selectedIndex={this.state.selectedIndex}>
                    <BottomNavigationItem
                        label="Home"
                        icon={<ActionHome />}
                        onTouchTap={() => this.select(0)}
                    />
                    <BottomNavigationItem
                        label="Search"
                        icon={<ActionSearch />}
                        onTouchTap={() => this.select(1)}
                    />
                    <BottomNavigationItem
                        label="Nearby"
                        icon={<CommunicationLocationOn />}
                        onTouchTap={() => this.select(2)}
                    />
                </BottomNavigation>
            </Paper>
        );
    }
}