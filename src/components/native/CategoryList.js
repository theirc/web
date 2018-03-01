import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Button, StyleSheet, Image, TouchableOpacity } from "react-native";
import HeaderBar from "./HeaderBar";
import PropTypes from "prop-types";
import Text from "./Text";
import _ from "lodash";
import MDIcon from "react-native-vector-icons/MaterialIcons";
import FAIcon from "react-native-vector-icons/FontAwesome";
import nativeColors from "../../shared/nativeColors";

class CategoryList extends Component {
	static propTypes = {};

	static contextTypes = {
		theme: PropTypes.object,
		direction: PropTypes.string,
		flexDirection: PropTypes.object,
	};

	state = {
		open: [],
	};
	toggleCategory(id) {
		const { open } = this.state;
		if (open.indexOf(id) === -1) {
			this.setState({
				open: [id, ...open],
			});
		} else {
			this.setState({
				open: [...open.filter(i => i !== id)],
			});
		}
	}
	render() {
		let { categories } = this.props;
		const { country, onNavigate, t } = this.props;
		const { open } = this.state;
		const { direction, flexDirection } = this.context;

		const showToggle = c => {
			return (c.fields.subCategories && c.fields.subCategories.length) || (c.fields.articles && c.fields.articles.length && c.fields.type !== "News" && !c.fields.overview);
		};

		let showCategory = c => c && c.fields && !c.fields.hide && c.fields.slug && (c.fields.overview || c.fields.articles);
		const overviewOrFirst = c => c.fields.overview || (c.fields.articles.length && c.fields.articles[0]);

		const renderIcon = c => {
			const { iconClass, iconText } = c.fields;
			if (iconClass) {
				let classWithoutPrefix = iconClass.substr(iconClass.indexOf("-") + 1);
				let prefix = iconClass.indexOf(" ") ? _.first(iconClass.split(" ")) : _.first(iconClass.split("-"));
				return <FAIcon style={[styles.icon]} size={20} name={classWithoutPrefix} color="#000" />;
			} else if (iconText) {
				return <MDIcon style={styles.icon} size={20} name={iconText.replace("_", "-")} color="#000" />;
			}

			return <MDIcon style={styles.icon} size={20} name="add" color="#000" />;
		};

		categories = categories.filter(c => c.fields);

		return (
			<View
				style={{
					backgroundColor: "#ffffff",
				}}
			>
				<HeaderBar title={t("Categories").toUpperCase()} />

				{(categories || []).filter(showCategory).map((c, i) => (
					<View key={c.sys.id}>
						{i > 0 && <View style={[styles.line]} />}
						{showToggle(c) && [
							<TouchableOpacity key={c.sys.id} style={[styles.item, flexDirection.row]} onPress={() => this.toggleCategory(c.sys.id)}>
								{renderIcon(c)}
								<Text style={styles.title}>{c.fields.name}</Text>
								<MDIcon style={styles.icon} name={open.indexOf(c.sys.id) > -1 ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={20} color="#000" />
							</TouchableOpacity>,
							c.fields.categories &&
								open.indexOf(c.sys.id) > -1 && (
									<View key="a-2">
										{c.fields.categories.map(
											a =>
												a.fields && (
													<TouchableOpacity
														style={[styles.item, styles.article]}
														key={a.sys.id}
														onPress={() => onNavigate(`/${a.fields.slug}/${overviewOrFirst(a).fields.slug}`)}
													>
														<Text style={styles.articleTitle}>{a.fields.name}</Text>
													</TouchableOpacity>
												)
										)}
									</View>
								),
							open.indexOf(c.sys.id) > -1 && (
								<View key="a-3">
									{c.fields.articles &&
										c.fields.articles.map(
											a =>
												a.fields && (
													<TouchableOpacity
														style={[styles.item, styles.article]}
														key={a.sys.id}
														onPress={() => onNavigate(`/${c.fields.slug}/${a.fields.slug}`)}
													>
														<Text style={styles.articleTitle}>{a.fields.title}</Text>
													</TouchableOpacity>
												)
										)}
								</View>
							),
						]}
						{!showToggle(c) &&
							overviewOrFirst(c) && (
								<TouchableOpacity
									style={[styles.item, flexDirection.row]}
									key={c.sys.id}
									onPress={() => onNavigate(`/${c.fields.slug}/${overviewOrFirst(c).fields.slug}`)}
								>
									{renderIcon(c)}
									<Text style={styles.title}>{overviewOrFirst(c).fields.title}</Text>
								</TouchableOpacity>
							)}
					</View>
				))}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		justifyContent: "center",
		minHeight: 60,
	},
	item: {
		minHeight: 60,
		alignItems: "center",
		paddingHorizontal: 10,
		flex: 1,
		flexDirection: "row",
	},
	icon: {
		width: 30,
		marginHorizontal: 5,
	},
	article: {
		paddingHorizontal: 50,
	},
	title: {
		flex: 1,
		fontSize: 18,
		fontWeight: "bold",
		color: "#000",
	},
	articleTitle: {
		flex: 1,
		color: "#000",
	},
	line: {
		width: "95%",
		backgroundColor: nativeColors.lighten(nativeColors.dividerColor, 30),
		alignSelf: "center",
		height: 1,
	},
});

export default translate()(CategoryList);
