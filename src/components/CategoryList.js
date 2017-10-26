import React, { Component } from "react";
import PropTypes from "prop-types";
import { KeyboardArrowUp, KeyboardArrowDown, Share, ModeEdit } from "material-ui-icons";

import "./CategoryList.css";

export default class CategoryList extends Component {
	static propTypes = {};

	render() {
		const { text, country, categories, onNavigate } = this.props;
		const showToggle = c => {
			return (c.fields.subCategories && c.fields.subCategories.length) || (c.fields.articles && c.fields.articles.length && c.fields.type !== "News" && !c.fields.overview);
		};

		const showCategory = c => c && !c.fields.hide && c.fields.slug && (c.fields.overview || c.fields.articles);
		const overviewOrFirst = c => c.fields.overview || (c.fields.articles.length && c.fields.articles[0]);

		return (
			<div className="CategoryList">
				<ul>
					{categories.filter(showCategory).map((c, i) => (
						<li key={c.sys.id}>
							<hr className="line" />
							<input type="checkbox" name={"tab"} id={`tab-${i}`} />
							{showToggle(c) && [
								<label key="a-1" htmlFor={`tab-${i}`} className="container">
									<i className={c.fields.iconClass || "material-icons"}>{c.fields.iconText || ((!c.fields.iconClass || c.fields.iconClass === "material-icons") && "add")}</i>
									<strong className="category-name">{c.fields && c.fields.name}</strong>
									<div className="up">
										<i className="material-icons">keyboard_arrow_up</i>
									</div>
									<div className="down">
										<i className="material-icons">keyboard_arrow_down</i>
									</div>
								</label>,
								c.fields.categories && (
									<ul  key="a-2" className="sub-categories">
										{c.fields.categories.map(
											a =>
												a.fields && (
													<li key={a.sys.id} onClick={() => onNavigate(`/${country.fields.slug}/${a.fields.slug}/${overviewOrFirst(a).fields.slug}`)}>
														<div className="inner-container article-title">
															<div> {a.fields.name}</div>
														</div>
													</li>
												)
										)}
									</ul>
								),
								<ul key="a-3">
									{c.fields.articles &&
										c.fields.articles.map(
											a =>
												a.fields && (
													<li key={a.sys.id} onClick={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${a.fields.slug}`)}>
														<div className="inner-container article-title">
															<div> {a.fields.title}</div>
														</div>
													</li>
												)
										)}
								</ul>,
							]}
							{!showToggle(c) &&
								c.fields.overview && (
									<label
										key={c.sys.id}
										htmlFor={`tab-${i}`}
										className="container"
										onClick={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${c.fields.overview.fields.slug}`)}
									>
										<i className={c.fields.iconClass || "material-icons"}>{c.fields.iconText || ((!c.fields.iconClass || c.fields.iconClass === "material-icons") && "book")}</i>
										<strong className="category-name">{c.fields && c.fields.name}</strong>
									</label>
								)}
						</li>
					))}
				</ul>
			</div>
		);
	}
}
