import React, { Component, } from 'react';
import { Paper, } from 'material-ui';
import BottomNavigation, { BottomNavigationButton } from 'material-ui/BottomNavigation';
import PropTypes from 'prop-types';

import { MoreHoriz, Home, Map, List } from 'material-ui-icons';

export default class BottomNav extends Component {
    static PropTypes = {
        classes: PropTypes.object.isRequired,
        onButtonClicked: PropTypes.func,
    }

    constructor() {
        super();

        this.state = {
            selectedIndex: 0,
        };
    }

    select(selectedIndex = 0) {
        const { onButtonClicked } = this.props;
        if (onButtonClicked) {
            onButtonClicked(selectedIndex);
        }
        if (selectedIndex === 3) {
            this.setState({ selectedIndex: -1 });
        } else {
            this.setState({ selectedIndex });
        }

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
