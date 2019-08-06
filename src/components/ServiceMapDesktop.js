import React from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import "./ServiceHome.css";
import {
	translate
} from "react-i18next";
import circle from "@turf/circle";
import getSessionStorage from "../shared/sessionStorage";

var tinycolor = require("tinycolor2");
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

class ServiceIcon extends React.Component {
	render() {
		let s = this.props.service;
		let idx = this.props.idx;
		let type = this.props.type;	
		return type ? (
			<div className="Icon" key={`${s.id}-${idx}`}>
				<i className={iconWithPrefix(type.vector_icon)} style={categoryStyle(type.color)} />
			</div>
		) : (
				<div />
			);
	}
}

class ServiceItem extends React.Component {
	render() {
		const s = this.props.service;
		const {
			goToService,
			// measureDistance
		} = this.props;
		// const distance = measureDistance && s.location && measureDistance(s.location);
		const mainType = s.type ? s.type : s.types[0];
		
		const types = (s.types || []).filter(t => t.id !== mainType.id);
		
		return (
			<div key={s.id} className="Item" onClick={() => goToService(s.id)}>
				<div className="Info">
					<div className="Item-content title">
						<h1>{s.name}</h1>
						<i className="material-icons" id="goToServiceIcon"/>
					</div>
					<h2 className="Item-content">{s.provider.name}{" "}</h2>
					<address className="fullAddress Item-content">
						{s.address}
					</address>
					{s.address_city &&
						<address className="regionTitle Item-content">
							{s.address_city}
						</address>
					}
				</div>
				<div className="Icons Item-content">
					{mainType &&
							<ServiceIcon key={`si-${mainType.idx}`} idx={0} isMainType={1} service={s} type={mainType} />
					}
					{types.map((t, idx) => t && <ServiceIcon key={`si-${idx}`} idx={idx} isMainType={0} service={s} type={t} />)}
				</div>
			</div>
		);
	}
}

class ServiceMapDesktop extends React.Component {
	state = {
		loaded: false,
		errorMessage: null,
	};

	map = null;
	clusters = null;
	bounds = null;

	componentDidMount() {
		const L = window.Leaflet;
		
		

		const map = L.citymaps.map("MapCanvas", null, {
			scrollWheelZoom: true,
			zoomControl: true,
			// Citymaps will automatically select "global" if language is not supported or undefined.
			language: this.props.i18n.language,
			worldCopyJump: true
		});

		let clusters = L.markerClusterGroup({
			maxClusterRadius: 20, // in pixels. Decreasing this will create more, smaller clusters.
			spiderfyDistanceMultiplier: 1.5,
			spiderfyOnMaxZoom: true
		});
		map.addLayer(clusters);
		// var locate = L.control.locate();
		// locate.addTo(map);


        this.setState({
            loaded: true
        });

		if (sessionStorage.serviceMapBounds) {
			const b = sessionStorage.serviceMapBounds.split(",").map(c => parseFloat(c));
			const zoom = sessionStorage.serviceMapZoom;
			
			map.fitBounds([
				[b[1], b[0]],
				[b[3], b[2]]
			]);
			map.setZoom(zoom);
			
			setTimeout(() => {
				map.invalidateSize();
			  }, 500);
		}
		
		this.clusters = clusters;
		this.map = map;
	}

	componentDidUpdate() {
		const L = window.Leaflet;
		const {
			// map,
			clusters
		} = this;
		// const {
		// 	defaultLocation,
		// 	findServicesInLocation
		// } = this.props;
		let keepPreviousZoom = this.props.keepPreviousZoom;
		if (this.state.loaded) {
			if (this.props.services.length) {
				let locationServices = this.props.services.filter(s => s.location != null);
				const markers = locationServices.map((s, index) => {					
					let ll = s.location.coordinates.slice().reverse();
					const mainType = s.type ? s.type : s.types[0];
					let markerDiv = ReactDOMServer.renderToString(<ServiceIcon idx={0} service={s} type={mainType} />);
					let icon = L.divIcon({
						html: markerDiv,
						iconAnchor: [20, 20],
						popupAnchor: [0, -16],
					});
					let marker = L.marker(ll, {
						title: s.name,
						icon: icon
					});
					
					let popupEl = document.createElement("div");
					ReactDOM.render(<ServiceItem service={s} {...this.props} />, popupEl);
					let popup = L.popup({
						closeButton: false
					}).setContent(popupEl);
					marker.bindPopup(popup);

					return marker;										
				});				
				clusters.clearLayers();
				clusters.addLayers(markers);
				if (!keepPreviousZoom){
					let group = new L.featureGroup(markers);
					this.map.fitBounds(group.getBounds());
				}
				
			} else {
				console.warn("no services returned");
			}
		}
	}

	componentWillUnmount() {
		// Cleaning up.
		this.map.off();
		this.map.remove();
	}

	render() {
		const {
			loaded,
			errorMessage
		} = this.state;
		
        /*
      Very small tweak on the render. toggling the visibility so we can run the L.map on didMount
    */

		return (
			<div className="ServiceMap">
				{errorMessage && (
					<div className="Error">
						<em>{errorMessage}</em>
					</div>
				)}
				<div className="ServiceMapContainer">
					<div id="MapCanvas" style={{ width: "100%", position: "relative", height: 500, visibility: loaded ? "visible" : "hidden" }} />
					{!loaded && <div className="loader" />}
					
				</div>
			</div>
		);
	}
}

export default translate()(ServiceMapDesktop);
