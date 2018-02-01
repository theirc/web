import React, { Component } from "react";
import _ from "lodash";
import { translate } from "react-i18next";
import "./CategoryWidget.css";

const Remarkable = require("remarkable");
const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

class CategoryWidget extends Component {
    render(){
        const { country, onNavigate, t, c } = this.props;	
        let html = md.render(c.fields.description);
        let article = c.fields.overview || _.first(c.fields.articles);
        
        return(
            <div className="Category">
				<h3>{c.fields.name}</h3>
				<p dangerouslySetInnerHTML={{ __html: html }} />
				<s>
					<a
						href="#"
						onClick={() => {
							onNavigate(`/${country.fields.slug}/${c.fields.slug}/${article.fields.slug}`);
							return false;
						}}
					>
						{t("Read More")}
					</a>
				</s>
			</div>
        )
        
    }
}

export default translate()(CategoryWidget);