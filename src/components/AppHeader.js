import React, { Component } from "react";
import { Button, IconButton } from "material-ui";
import Headroom from "react-headrooms";
import PropTypes from "prop-types";
import { Search } from "material-ui-icons";
import { translate } from "react-i18next";

import "./AppHeader.css";

class AppHeader extends Component {
	static propTypes = {
		onChangeCountry: PropTypes.func,
		onGoToSearch: PropTypes.func,
		onGoHome: PropTypes.func,
		country: PropTypes.object,
		language: PropTypes.string,
	};

	render() {
		const { onChangeCountry, onGoToSearch, onGoHome, country, language } = this.props;
		const noop = () => {
			console.log("noop");
		};
		return (
			<div>
				<Headroom tolerance={5} offset={200}>
					<div className="app-bar">
						<div
							className={[
								"app-bar-container",
								!(country && language) ? "logo-centered" : "",
							].join(" ")}
							onClick={onGoHome || noop}
						>
							<img
								onClick={onGoHome}
								src={this.props.logo || "/logo.svg"}
								className="app-bar-logo"
								alt=" "
							/>
						</div>
						{country &&
							language && (
								<div className="app-bar-container">
									<div className="app-bar-buttons">
										<Button color="contrast" onClick={onChangeCountry || noop}>
											{(country && country.fields.name) || " "}
										</Button>
										<div className="app-bar-separator" />
										<IconButton color="contrast" onClick={onGoToSearch || noop}>
											<Search />
										</IconButton>
									</div>
								</div>
							)}
					</div>
				</Headroom>
				<div
					style={{
						backgroundColor: "#000000",
						display: "block",
						width: "100%",
						height: 64,
					}}
				/>
			</div>
		);
	}
}

export default translate()(AppHeader);
