// libs
import React from 'react';
import { connect } from 'react-redux'
import { push } from "react-router-redux";

// local
import { ArticleListOOD } from '../../components'
import { Skeleton } from "..";

/**
 * @class
 * @description 
 */
class CategoryHome extends React.Component {
	state = {};

	render() {
		const { country, category, onNavigate, t } = this.props;

		if (!country || !category) {
			return null;
		}

		return (
			<Skeleton headerColor='light' className='CategoryHome'>
				<div className="SkeletonContainer">
					<ArticleListOOD
						country={country}
						category={category}
						onNavigate={onNavigate}
						t={t}
					/>
				</div>
			</Skeleton>
		);
	}
}

const mapState = ({ country }, p) => ({ country });

const mapDispatch = (d, p) => ({ onNavigate: (url) => d(push(url)) });

export default connect(mapState, mapDispatch)(CategoryHome);
