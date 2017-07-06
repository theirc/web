import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { Skeletton,  } from './scenes';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { createMuiTheme } from 'material-ui/styles';
import { store,  } from './store';
import _ from 'lodash';
import Router from './router';

const theme = createMuiTheme({
    overrides: {
        MuiBottomNavigationButton: {
            selected: {
                color: '#000000',
            },
        },
    },
});

class ThemedApp extends Component {
    render() {
        const { organization } = this.props;

        return (
            <MuiThemeProvider theme={theme}>
                <span className={organization}>
                    <Skeletton>
                        <Router />
                    </Skeletton>
                </span>
            </MuiThemeProvider >
        );
    }
}

ThemedApp = connect(({ organization, match }) => {
    return {
        organization,
    }
})(ThemedApp);

class App extends Component {
    render() {

        return (
            <Provider store={store}>
                <ThemedApp />
            </Provider>
        );
    }
}

export default App;
