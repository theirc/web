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

export default HtmlMarker;