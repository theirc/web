import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Text, Button, Dimensions } from "react-native";
import { BottomNavigation, ThemeProvider } from "react-native-material-ui";
const window = Dimensions.get("window");

class BottomNavContainer extends Component {
	static propTypes = {};
	state = {
		active: "home",
	};

	render() {
		const { t } = this.props;
		return (
			<View style={{ position: "absolute", bottom: 0, width: window.width }}>
				<ThemeProvider
					uiTheme={{
						bottomNavigationAction: {
							iconActive: {
								color: "#ffda1a",
							},
							labelActive: {
								color: "#000",
								fontWeight: 'bold',
							},
						},
					}}
				>
					<BottomNavigation active={this.state.active} hidden={false}>
						<BottomNavigation.Action key="home" icon="home" label={t("Home")} onPress={() => this.setState({ active: "home" })} />
						<BottomNavigation.Action key="categories" icon="assignment" label={t("Categories")} onPress={() => this.setState({ active: "categories" })} />
						<BottomNavigation.Action key="services-list" icon="list" label={t("Service List")} onPress={() => this.setState({ active: "services-list" })} />
					</BottomNavigation>
				</ThemeProvider>
			</View>
		);
	}
}

export default translate()(BottomNavContainer);
