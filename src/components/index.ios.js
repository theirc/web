import LanguageSelector from "./native/LanguageSelector";
import AppHeader from "./native/AppHeader";
import CountrySelector from "./native/CountrySelector";
import React from "react";
import { View, Text, Button } from "react-native";

/*
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";
import WarningDialog from "./WarningDialog";
import Footer from "./Footer";
import ArticlePage from "./ArticlePage";
import ArticleFooter from "./ArticleFooter";
import CategoryList from "./CategoryList";
import CountrySelector from "./CountrySelector";
import HomeWidget from "./HomeWidget";
import HomeWidgetCollection from "./HomeWidgetCollection";
import SearchPage from "./SearchPage";
import ServiceMap from "./ServiceMap";
import ServiceCategoryList from "./ServiceCategoryList";
import ServiceList from "./ServiceList";
import ServiceDetail from "./ServiceDetail";

export {
	AppHeader,
	BottomNav,
	WarningDialog,
	Footer,
	ArticlePage,
	ArticleFooter,
	CategoryList,
	CountrySelector,
	LanguageSelector,
	HomeWidget,
	HomeWidgetCollection,
	SearchPage,
	ServiceMap,
	ServiceCategoryList,
	ServiceList,
	ServiceDetail,
};
*/

module.exports = {
	AppHeader,
	BottomNav: () => <View />,
	WarningDialog: () => <View />,
	Footer: () => <View />,
	ArticlePage: () => <View />,
	ArticleFooter: () => <View />,
	CategoryList: () => <View />,
	CountrySelector,
	LanguageSelector,
	HomeWidget: () => <View />,
	HomeWidgetCollection: props => (
		<View>
			<Text>{props.children.length}</Text>
		</View>
	),
	SearchPage: () => <View />,
	ServiceMap: () => <View />,
	ServiceCategoryList: () => <View />,
	ServiceList: () => <View />,
	ServiceDetail: () => <View />,
};
