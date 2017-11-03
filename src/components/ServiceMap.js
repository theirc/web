/* global window */
import React, { Component, PureComponent } from "react";
import MapGL, { NavigationControl, Marker } from "react-map-gl";
import _ from "lodash";
import "mapbox-gl/dist/mapbox-gl.css";

const turf = require("@turf/turf");

const MAPBOX_TOKEN = "pk.eyJ1IjoicmV5cm9kcmlndWVzIiwiYSI6ImNpbHA5d3BqdzA4a3d1Y2tuNnF6aGJlN2QifQ.j1WVzYEdyGfNuSDv9nuf1Q"; // Set your mapbox token here

const navStyle = {
	position: "absolute",
	top: 0,
	left: 0,
	padding: "10px",
};

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
C20.1,15.8,20.2,15.8,20.2,15.7z`;

const pinStyle = {
	cursor: "pointer",
	fill: "#d00",
	stroke: "none",
};

class CityPin extends PureComponent {
	render() {
		const { size = 20, onClick } = this.props;

		return (
			<svg height={size} viewBox="0 0 24 24" style={{ ...pinStyle, transform: `translate(${-size / 2}px,${-size}px)` }} onClick={onClick}>
				<path d={ICON} />
			</svg>
		);
	}
}

export default class App extends Component {
	state = {
		mapStyle: "",
		viewport: {
			latitude: 0,
			longitude: 0,
			zoom: 4,
			bearing: 0,
			pitch: 0,
			width: 100,
			height: 100,
		},
	};

	componentDidMount() {
		window.addEventListener("resize", this._resize);

		this._resize();
    }
    
	componentWillReceiveProps(nextProps) {
		if (nextProps.services !== this.props.services) {
			const { services } = nextProps;

			let features = turf.featureCollection(
				services
					.map(s => s.location)
					.filter(_.identity)
					.map(s => turf.point(s.coordinates))
			);
			let center = turf.center(features);
			let [long, lat] = center.geometry.coordinates;
			this.setState({
				viewport: {
					...this.state.viewport,
					latitude: lat,
					longitude: long,
				},
			});
		}
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._resize);
	}

	_resize = () => {
		this.setState({
			viewport: {
				...this.state.viewport,
				width: this.props.width || window.innerWidth,
				height: this.props.height || window.innerHeight - (64 + 56),
			},
		});
	};

	_onViewportChange = viewport => this.setState({ viewport });

	_onStyleChange = mapStyle => this.setState({ mapStyle });

	_renderMarker = (item, index) => {
		const [long, lat] = item.location.coordinates;
		return (
			<Marker key={`marker-${index}`} longitude={long} latitude={lat}>
				<CityPin size={20} onClick={() => 0} />
			</Marker>
		);
	};

	render() {
		const { viewport,  } = this.state;
		const { services } = this.props;

		return (
			<MapGL {...viewport} onViewportChange={this._onViewportChange} mapboxApiAccessToken={MAPBOX_TOKEN}>
				{services.filter(s => s.location).map(this._renderMarker)}
				<div className="nav" style={navStyle}>
					<NavigationControl onViewportChange={this._onViewportChange} />
				</div>
			</MapGL>
		);
	}
}
