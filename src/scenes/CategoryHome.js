import React from 'react';
import { connect } from 'react-redux'
import {ArticleList, InstanceMovedWidget} from '../components'
import { push } from "react-router-redux";

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
		const instanceMoved = country.fields.slug === 'bulgaria';

        if(!country || !category) {
            return null;
        }

        return (
            <div>
                { !instanceMoved &&
                    <ArticleList
                        country= {country}
                        category = {category}
                        onNavigate = {onNavigate}
                        md = {md}
                        t = {t}
                    />
                }
                { instanceMoved &&
					<InstanceMovedWidget link="http://refugeelife.bg/" />
                }
            </div>
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
