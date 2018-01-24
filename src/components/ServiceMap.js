import React from "react";
import ReactDOM from "react-dom";
import "./ServiceHome.css";
import { translate } from "react-i18next";
import _ from "lodash";
import HeaderBar from "./HeaderBar";

var tinycolor = require("tinycolor2");

class ServiceMap extends React.Component {

	state = {
		category: {},
		services: [],
		loaded: false,
		errorMessage: null,
	};
	componentDidMount() {
		const { servicesByType } = this.props;
		if (servicesByType) {
			servicesByType()
				.then(({ services, category }) => this.setState({ services, category, loaded: true }))
				.catch(c => this.setState({ errorMessage: c.message, category: null, loaded: true }));
		}
	}
	renderService(s) {
		const { goToService, measureDistance } = this.props;
		const distance = measureDistance && s.location && measureDistance(s.location);

		let iconWithPrefix = vector_icon => vector_icon.split("-")[0] + " " + vector_icon;
		let categoryStyle = color => {
			if (!color) {
				color = "#000";
			} else if (color.indexOf("#") === -1) {
				color = `#${color}`;
			}

			color = tinycolor(color)
				.saturate(30)
				.darken(10)
				.toHexString();

			return {
				color: color,
				borderColor: tinycolor(color).darken(10),
			};
		};

		return (
			<div key={s.id} className="Item" onClick={() => goToService(s.id)}>
				<div className="Icons">
					{s.types.map((t, idx) => (
						<div className="Icon" key={`${s.id}-${idx}`}>
							<i className={iconWithPrefix(t.vector_icon)} style={categoryStyle(t.color)} />
						</div>
					))}
				</div>
				<div className="Info">
					<h1>{s.name}</h1>
					<h2>
						{s.provider.name}{" "}
						<small>
							{s.region.title}
							{distance && ` - ${distance}`}
						</small>
					</h2>
				</div>
				<i className="material-icons" />
			</div>
		);
	}

	componentDidUpdate() {
	  let L = window.Leaflet;
	  if(this.state.loaded) {
	    console.log("SERVICES", this.state.services);
      let map = L.citymaps.map('MapCanvas', null, {
        scrollWheelZoom: true,
        zoomControl: true
      });
      let clusters = L.markerClusterGroup();
      map.setView(this.state.services[0].location.coordinates.reverse(), 8);
      this.state.services.forEach((m, index) => {
        let ll = m.location.coordinates.reverse();
        let marker = L.marker(ll, { title: m.name });
        clusters.addLayer(marker);
        let popupEl = document.createElement('div');
        let content = this.renderService(m);
        ReactDOM.render(content, popupEl);
        let popup = L.popup({ closeButton: false }).setContent(popupEl);
        marker.bindPopup(popup);
      });
      map.addLayer(clusters);
    }
	}

	render() {
		const { services, category, loaded, errorMessage } = this.state;
		const { t, locationEnabled, toggleLocation, nearby } = this.props;

		return (
			<div className="ServiceMap">
				{errorMessage && (
					<div className="Error">
						<em>{errorMessage}</em>
					</div>
				)}
				
				<div className="ServiceMapContainer">
				{ loaded ? (
				  <div id="MapCanvas" style={{ width: "100%", position: "absolute", top: 64, bottom: 56 }}></div>
				) : (
				  <div className="loader" />
				) }
				</div>
			</div>
		);
	}
}
export default translate()(ServiceMap);

