import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Button, StyleSheet, Image, TouchableOpacity } from "react-native";
import HeaderBar from "./HeaderBar";
import PropTypes from "prop-types";
import Text from "./Text";

class CategoryList extends Component {
	static propTypes = {};

	static contextTypes = {
		theme: PropTypes.object,
	};

	state = {
		open: [],
	};
	render() {
		const { country, categories, onNavigate, t } = this.props;
		const { open } = this.state;
		const showToggle = c => {
			return (c.fields.subCategories && c.fields.subCategories.length) || (c.fields.articles && c.fields.articles.length && c.fields.type !== "News" && !c.fields.overview);
		};

		let showCategory = c => c && c.fields && !c.fields.hide && c.fields.slug && (c.fields.overview || c.fields.articles);
		const overviewOrFirst = c => c.fields.overview || (c.fields.articles.length && c.fields.articles[0]);

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
							<TouchableOpacity
								style={styles.topLevel}
								key={c.sys.id}
								onPress={() =>
									this.setState({
										open: [c.sys.id, ...open],
									})
								}
							>
								<Text>{c.fields && c.fields.name}</Text>
							</TouchableOpacity>,

							c.fields.categories &&
								open.indexOf(c.sys.id) > -1 && (
									<View key="a-2">
										{c.fields.categories.map(
											a =>
												a.fields && (
													<TouchableOpacity key={a.sys.id} onPress={() => onNavigate(`/${country.fields.slug}/${a.fields.slug}/${overviewOrFirst(a).fields.slug}`)}>
														<Text>{a.fields.name}</Text>
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
													<TouchableOpacity key={a.sys.id} onPress={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${a.fields.slug}`)}>
														<Text> {a.fields.title}</Text>
													</TouchableOpacity>
												)
										)}
								</View>
							),
						]}
						{!showToggle(c) &&
							overviewOrFirst(c) && (
								<TouchableOpacity style={styles.topLevel} key={c.sys.id} onPress={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${overviewOrFirst(c).fields.slug}`)}>
									<Text> {overviewOrFirst(c).fields.title}</Text>
								</TouchableOpacity>
							)}
					</View>
				))}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	topLevel: {
		flex: 1,
		minHeight: 50,
		justifyContent: "center",
	},
});

export default translate()(CategoryList);
