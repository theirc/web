import React from "react";
import { translate } from "react-i18next";
import './SearchPage.css';

const words = [];
class SearchPage extends React.Component {
	state = { suggestions: [] };

	handleClear() {
		this.setState({
			suggestions: [],
		});
	}

	handleChange(input) {
		this.setState({
			suggestions: words.filter(word => word.startsWith(input)),
		});
	}

	handleSelection(value) {
		if (value) {
			console.info(`Selected "${value}"`);
		}
	}

	handleSearch(value) {
		if (value) {
			console.info(`Searching "${value}"`);
		}
	}

	suggestionRenderer(suggestion, searchTerm) {
		return (
			<span>
				<span>{searchTerm}</span>
				<strong>{suggestion.substr(searchTerm.length)}</strong>
			</span>
		);
	}

	render() {
		return (
			<div className="SearchPage">
			</div>
		);
	}
}

export default translate()(SearchPage);

/*

       
*/
