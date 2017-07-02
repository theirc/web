import React, { Component, } from 'react';
import { AppBar, Paper, } from 'material-ui';
import BottomNavigation, { BottomNavigationButton } from 'material-ui/BottomNavigation';
import { withStyles, createStyleSheet } from 'material-ui/styles';
import PropTypes from 'prop-types';

import { MoreHoriz, Home, Map, List } from 'material-ui-icons';

export default class BottomNav extends Component {
    static PropTypes = {
        classes: PropTypes.object.isRequired
    }
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
            <Paper style={{
                position: 'fixed',
                bottom: 0,
                width: '100%',
            }}>
                <BottomNavigation index={this.state.selectedIndex} onChange={(e, i) => this.select(i)}>
                    <BottomNavigationButton
                        label="Home"
                        icon={<Home />}
                    />
                    <BottomNavigationButton
                        label="Categories"
                        icon={<List />}
                    />
                    <BottomNavigationButton
                        label="Services"
                        icon={<Map />}
                    />
                    <BottomNavigationButton
                        label="More"
                        icon={<MoreHoriz />}
                    />
                </BottomNavigation>
            </Paper>
        );
    }
}
