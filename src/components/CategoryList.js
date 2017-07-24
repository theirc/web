import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { KeyboardArrowUp, KeyboardArrowDown, Share, ModeEdit } from 'material-ui-icons';

import './CategoryList.css';

export default class CategoryList extends Component {
    static propTypes = {
    }

    render() {
        const { text, country, categories, onNavigate } = this.props;
        return (<div className="CategoryList">
            <ul >
                {categories.filter(c => c.category && c.category.slug).map((c, i) => (<li key={c._id}>
                    <hr className="line" />
                    <input type="checkbox" name={"tab"} id={`tab-${i}`} />
                    <div className="container">
                        <i className={c.category.iconClass || "material-icons"}>{c.category.iconText || ((!c.category.iconClass || c.category.iconClass==='material-icons') && "add") }</i>
                        <label htmlFor={`tab-${i}`}><strong>{c.category && c.category.name}</strong></label>
                        <div className="up"><i className="material-icons">keyboard_arrow_up</i></div>
                        <div className="down"><i className="material-icons">keyboard_arrow_down</i></div>
                    </div>

                    <ul>
                        {c.articles && c.articles.map(a => (
                            <li key={a._id}>
                                <div className="inner-container">
                                    <div onTouchTap={() => onNavigate(`/${country.slug}/${c.category.slug}/${a.slug}`)}> {a.title}</div>
                                </div>
                            </li>
                        ))}
                    </ul>

                </li>))}
            </ul>
        </div>
        );
    }

}
