import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Text, Button, StyleSheet, Image, TouchableHighlight } from "react-native";
import HeaderBar from "./HeaderBar";
import PropTypes from "prop-types";

class CategoryList extends Component {
	static propTypes = {};

	static contextTypes = {
		theme: PropTypes.object,
	};
	render() {
		const { country, categories, onNavigate, t } = this.props;
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
							<View key={c.sys.id}>
								<Text>{c.fields && c.fields.name}</Text>
							</View>,

							c.fields.categories && (
								<View key="a-2">
									{c.fields.categories.map(
										a =>
											a.fields && (
												<TouchableHighlight key={a.sys.id} onPress={() => onNavigate(`/${country.fields.slug}/${a.fields.slug}/${overviewOrFirst(a).fields.slug}`)}>
													<Text> {a.fields.name}</Text>
												</TouchableHighlight>
											)
									)}
								</View>
							),
							<View key="a-3">
								{c.fields.articles &&
									c.fields.articles.map(
										a =>
											a.fields && (
												<TouchableHighlight key={a.sys.id} onPress={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${a.fields.slug}`)}>
													<Text> {a.fields.title}</Text>
												</TouchableHighlight>
											)
									)}
							</View>,
						]}
						{!showToggle(c) &&
							overviewOrFirst(c) && (
								<View key={c.sys.id}>
									<Text>{c.fields && c.fields.name}</Text>
								</View>
							)}
					</View>
				))}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	line: {},
});

export default translate()(CategoryList);
