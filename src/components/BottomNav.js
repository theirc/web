import React, { Component, } from 'react';
import { Paper, } from 'material-ui';
import BottomNavigation, { BottomNavigationButton } from 'material-ui/BottomNavigation';
import PropTypes from 'prop-types';

import { MoreHoriz, Home, Map, List } from 'material-ui-icons';

export default class BottomNav extends Component {
    static propTypes = {
        classes: PropTypes.object,
        onButtonClicked: PropTypes.func,
        onGoToCategories: PropTypes.func,
    }

    constructor(props) {
        super();

        this.state = {
            selectedIndex: (props.category && 1) || 0,
        };
    }

    select(selectedIndex = 0) {
        const { onGoHome, onGoToCategories, onGoToServices, onGoToMore } = this.props;

        if (selectedIndex === 3) {
            this.setState({ selectedIndex: -1 });
        } else {
            this.setState({ selectedIndex });
        }

        if (selectedIndex === 0) {
            if (onGoHome) {
                return onGoHome();
            }
        }
        else if (selectedIndex === 1) {
            if (onGoToCategories) {
                return onGoToCategories();
            }
        }
        else if (selectedIndex === 2) {
            if (onGoToServices) {
                return onGoToServices();
            }
        }
        else if (selectedIndex === 3) {
            if (onGoToMore) {
                return onGoToMore();
            }
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
                        icon={<Home />}
                    />
                    <BottomNavigationButton
                        icon={<List />}
                    />
                    <BottomNavigationButton
                        icon={<Map />}
                    />
                    <BottomNavigationButton
                        icon={<MoreHoriz />}
                    />
                </BottomNavigation>
            </Paper>
        );
    }
}
