import React from 'react';
import services from '../backend';
import { connect } from 'react-redux'
import {ArticleList} from '../components'
import { push } from "react-router-redux";
import { translate } from "react-i18next";
import PropTypes from "prop-types";

const Remarkable = require("remarkable");

const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

class CategoryHome extends React.Component {  
    state = {};   

    componentWillMount() {        
    }

    render() {
        const { country, category, onNavigate, t } =this.props;

        if(!country || !category) {
            return null;
        }

        return (
            <ArticleList
                country= {country}
                category = {category}
                onNavigate = {onNavigate}
                md = {md}
                t = {t}
            />
        );
    }
}

const mapState = (s, p) => {
    return {
        articles: s.articles,
        country: s.country,
    };
};
const mapDispatch = (d, p) => {
    return {
        onNavigate(url) {
			d(push(url));
		}
    };
};

export default connect(mapState, mapDispatch)(CategoryHome);
