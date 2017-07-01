import React, { Component, } from 'react';
import { AppBar, Paper, BottomNavigation, BottomNavigationItem } from 'material-ui';
import { cyan500, black, white } from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { FlatButton, IconButton, FontIcon } from 'material-ui';
import IconLocationOn from 'material-ui/svg-icons/communication/location-on';
import SearchIcon from 'react-material-icons/icons/action/search';
import Headroom from 'react-headrooms';

export default class AppHeader extends Component {
    render() {
        const { changeCountry, search, home } = this.props;
        return (<Headroom tolerance={5} offset={200}>
            <div>
            <AppBar
                className="app-bar"
                title={(
                    <img onClick={home} src="logo.png" className="app-bar-logo" />
                )}
                showMenuIconButton={false}
                style={{
                    position: 'fixed',
                }}
                iconElementRight={
                    <div className="app-bar-container">
                        <FlatButton labelStyle={{ color: white }} onClick={changeCountry}
                            label="Greece">
                        </FlatButton>
                        <div className="app-bar-separator"></div>
                        <IconButton
                            onClick={search}
                            iconStyle={{ color: white }}>
                            <SearchIcon />
                        </IconButton>
                    </div>
                }
            />
            <div style={{ display: 'block', width: '100%', height: 64 }}></div>
</div>
        </Headroom>);
    }

}
