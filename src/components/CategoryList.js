import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { KeyboardArrowUp, KeyboardArrowDown, Share, ModeEdit } from 'material-ui-icons';

import './CategoryList.css';

export default class CategoryList extends Component {
    static propTypes = {
    }

    render() {
        const { text, country, categories, onNavigate } = this.props;
        console.log(categories);
        return (<div className="CategoryList">
            <ul >
                {categories.filter(c => c && c.fields.slug).map((c, i) => (<li key={c._id}>
                    <hr className="line" />
                    <input type="checkbox" name={"tab"} id={`tab-${i}`} />
                    <div className="container">
                        <i className={c.fields.iconClass || "material-icons"}>{c.fields.iconText || ((!c.fields.iconClass || c.fields.iconClass==='material-icons') && "add") }</i>
                        <label htmlFor={`tab-${i}`}><strong>{c.fields && c.fields.name}</strong></label>
                        <div className="up"><i className="material-icons">keyboard_arrow_up</i></div>
                        <div className="down"><i className="material-icons">keyboard_arrow_down</i></div>
                    </div>

                    <ul>
                        {c.fields.articles && c.fields.articles.map(a => (a.fields &&
                            <li key={a.sys.id}>
                                <div className="inner-container">
                                    <div onClick={() => onNavigate(`/${country.slug}/${c.fields.slug}/${a.fields.slug}`)}> {a.fields.title}</div>
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
