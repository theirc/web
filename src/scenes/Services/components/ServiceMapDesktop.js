// libs
import React from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import { translate } from "react-i18next";

// local
import "./ServiceHome.css";

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
		const { service, idx, type } = this.props;
		return type ? (
			<div className="Icon" key={`${service.id}-${idx}`}>
				<i className={iconWithPrefix(type.vector_icon)} style={categoryStyle(type.color)} />
			</div>
		) : (
				<div />
			);
	}
}




function HtmlMarker(latlng, map, args) {
	this.latlng = latlng;	
	this.args = args;	
	this.setMap(map);	
}

HtmlMarker.prototype = new global.google.maps.OverlayView();

HtmlMarker.prototype.draw = function() {
	
	var self = this;
	
	var div = this.div;
	
	if (!div) {
	
		div = this.div = document.createElement('div');
		
		div.className = 'html-marker-icon';
		
		div.style.position = 'absolute';
		div.style.cursor = 'pointer';

		div.innerHTML = this.args.html;
		
		if (typeof(self.args.marker_id) !== 'undefined') {
			div.dataset.marker_id = self.args.marker_id;
		}
		
		global.google.maps.event.addDomListener(div, "click", function(event) {			
			global.google.maps.event.trigger(self, "click");
		});
		
		var panes = this.getPanes();
		panes.overlayImage.appendChild(div);
	}
	
	var point = this.getProjection().fromLatLngToDivPixel(this.latlng);
	
	if (point) {
		div.style.left = point.x + 'px';
		div.style.top = point.y + 'px';
	}
};

HtmlMarker.prototype.remove = function() {
	if (this.div) {
		this.div.parentNode.removeChild(this.div);
		this.div = null;
	}	
};

HtmlMarker.prototype.getPosition = function() {
	return this.latlng;	
};







class ServiceItem extends React.Component {
	render() {
		const { service, goToService } = this.props;
		const mainType = service.type ? service.type : service.types[0];
		const types = (service.types || []).filter(t => t.id !== mainType.id);

		return (
			<div key={service.id} className="ServiceItem" onClick={() => goToService(service.id)}>
				<div className="Info">
					<div className="Item-content title">
						<h1>{service.name}</h1>
						<i className="material-icons" id="goToServiceIcon" />
					</div>

					<h2 className="Item-content">{service.provider.name}{" "}</h2>

					<address className="fullAddress Item-content">
						{service.address}
					</address>

					{service.address_city &&
						<address className="regionTitle Item-content">
							{service.address_city}
						</address>
					}
				</div>

				<div className="Icons Item-content">
					{mainType &&
						<ServiceIcon key={`si-${mainType.idx}`} idx={0} isMainType={1} service={service} type={mainType} />
					}
					{types.map((t, idx) => t && <ServiceIcon key={`si-${idx}`} idx={idx} isMainType={0} service={service} type={t} />)}
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
	infoWindow = null;

	componentDidMount() {
	  /*
		const map = L.citymaps.map("MapCanvas", null, {
			scrollWheelZoom: true,
			zoomControl: true,
			// Citymaps will automatically select "global" if language is not supported or undefined.
			language: this.props.i18n.language,
			worldCopyJump: true
		});
		*/

    /*
		let clusters = L.markerClusterGroup({
			maxClusterRadius: 20, // in pixels. Decreasing this will create more, smaller clusters.
			spiderfyDistanceMultiplier: 1.5,
			spiderfyOnMaxZoom: true
		});
		map.addLayer(clusters);
		*/

	  const map = new global.google.maps.Map(document.getElementById('MapCanvas'), {
	    minZoom: 3,
	    maxZoom: 16
	  });

		this.setState({
			loaded: true
		});
    
		if (sessionStorage.serviceMapBounds) {
			const b = sessionStorage.serviceMapBounds.split(",").map(c => parseFloat(c));
			const zoom = sessionStorage.serviceMapZoom;

			map.fitBounds({
				west : b[0],
				north: b[1],
				east : b[2],
				south: b[3]
			});
			//map.setZoom(parseInt(zoom) || 8);
			map.setCenter({
			  lat: 40.74,
			  lng: -74
			});
			map.setZoom(8);
		} else {
      map.setCenter({
        lat: 39,
        lng: 22
      });
      map.setZoom(7);
		}

	  this.map = map;
	}

	componentDidUpdate() {
		const {
			clusters
		} = this;
		let keepPreviousZoom = this.props.keepPreviousZoom;
		if (this.state.loaded) {
			if (this.props.services.length) {
				let locationServices = this.props.services.filter(s => s.location != null);

				console.log("location services", locationServices);

				const markers = locationServices.map((s, index) => {
					let ll = s.location.coordinates;
				  const mainType = s.type ? s.type : s.types[0];

					let markerDiv = ReactDOMServer.renderToString(<ServiceIcon idx={0} service={s} type={mainType} />);

					let popupEl = document.createElement("div");
					ReactDOM.render(<ServiceItem service={s} {...this.props} />, popupEl);

					let marker = new HtmlMarker(new global.google.maps.LatLng(ll[1], ll[0]), this.map, {
					  html: markerDiv
					});

					marker.addListener('click', function() {
					  this.infoWindow.setContent(popupEl);
            this.infoWindow.open(this.map, marker);
          });

					return marker;
				});

		    const clusters = new global.MarkerClusterer(this.map, markers, {
          imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
		    });
		    /*
				if (!keepPreviousZoom) {
					let group = new L.featureGroup(markers);
					this.map.fitBounds(group.getBounds());
				}
				*/
			} else {
				console.warn("no services returned");
			}
		}
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


global.initMap = function() {
  console.log("INIT MAP");
}

export default translate()(ServiceMapDesktop);
