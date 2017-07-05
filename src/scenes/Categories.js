import React from 'react';
import services from '../backend';
import { connect } from 'react-redux'
import {
} from '../components';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';
import Skeletton from './Skeletton'


class Categories extends React.Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                country: PropTypes.string.isRequired,
            }).isRequired
        }).isRequired,
        onMount: PropTypes.func.isRequired
    }

    componentWillMount() {
        this.props.onMount(this.props.match.params.country);
    }

    render() {
        const { country, onNavigate } = this.props;

        if (!country) {
            return null;
        }

        return (<ul>
            {country.content.filter(c => c.category && c.category.slug).map(c => (<li key={c._id}>
                {c.category && c.category.name}
                <ul>
                    {c.articles && c.articles.map(a => (
                        <li key={a._id}>
                            <div onTouchTap={() => onNavigate(`/${country.slug}/${c.category.slug}/${a.slug}`)}> {a.title}</div>
                        </li>
                    ))}
                </ul>
            </li>))}
        </ul>);
    }
}

const mapState = (s, p) => {
    return {
        articles: s.articles,
        match: p.match,
        country: s.country
    };
};
const mapDispatch = (d, p) => {
    return {
        onMount: (slug) => {
        },
        onNavigate: (path) => {
            setTimeout(() => {
                d(push(path));
            }, 200);
        }
    };
};

export default connect(mapState, mapDispatch)(Categories);
