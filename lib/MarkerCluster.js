//MarkerCluster for WebWorldWind plugin
//created by Simone Battaglia, extended & modified as seen fit for gaIoTa app by Udayanto Dwi Atmojo

 
 //define(['../lib/supercluster.min', '../worldwind.min'], function (supercluster, wwe) {

    /**
     * MarkerCLuster constructor
     * @param globe: The worldwind globe where to insert the cluster
     * @param options: options to customize the creation of the cluster
     * @constructor
     */
    //var MarkerCluster = function (globe, options) {
    function MarkerCluster(globe, options) {

        if (!options) {
            options = {
                maxLevel: 9,
                smooth: false,
                name: "MarkerCluster",
                maxCount: 3000,
                clusterSources: null,
                attributeColor: null,
                radius: 70
            }
        }

        this.options = options;

        this.placemarks = [];
        this.placemarksArray = [];
        var name = options.name || "MarkerCluster";
        this.layer = new WorldWind.RenderableLayer(name);
        this.displayName = name;
        this.globe = globe;
        this.controlLayer = options.controls;
        this.navigator = options.navigator;
        this.zoomLevel = 0;

        //Predefined options
        this.maxCount = options.maxCount || 1000;
        this.smooth = options.smooth || false;
        this.zoomLevels = options.maxLevel || 9;
        this.radius = options.radius || 70;

        this.levels = [];
        this.maxReached = this.zoomLevels;
        this.minReached = 0;
        this.createZoomClusters(this.zoomLevels);
        if (globe) {
            globe.addLayer(this.layer);
            if (globe.controller || globe.navigator) {
                this.bindNavigator(globe.controller);
            }
        }

    };

    /**
     * Turn off the layer containing the markerCluster
     */
    MarkerCluster.prototype.off = function () {
        this.layer.enabled = false;
    };

    /**
     * Turn off the layer containing the markerCluster
     */
    MarkerCluster.prototype.on = function () {
        this.layer.enabled = true;
    };

    /**
     * Attach navigation function to markerCluster
     */
    MarkerCluster.prototype.bindNavigator = function (controller) {

        var navigator = controller || this.globe.navigator;
        var LookAtNavigator = controller || WorldWind.LookAtNavigator;
        var self = this;

        if (!navigator.clusters) {
            navigator.clusters = {};
        }
        navigator.clusters[self.options.name] = self;

        navigator.handleWheelEvent = function (event) {
            if (LookAtNavigator.prototype)
                LookAtNavigator.prototype.handleWheelEvent.apply(this, arguments);
            else
                LookAtNavigator.__proto__.handleWheelEvent.apply(this, arguments);
            var range;
            if (this.lookAt && this.lookAt.range)
                range = this.lookAt.range
            else
                range = this.range;


            if (self.options.smooth) {
                self.globe.goToAnimator.travelTime = 600;
                if (!this.busy) {
                    var normalizedDelta;
                    if (event.deltaMode == WheelEvent.DOM_DELTA_PIXEL) {
                        normalizedDelta = event.deltaY;
                    } else if (event.deltaMode == WheelEvent.DOM_DELTA_LINE) {
                        normalizedDelta = event.deltaY * 40;
                    } else if (event.deltaMode == WheelEvent.DOM_DELTA_PAGE) {
                        normalizedDelta = event.deltaY * 400;
                    }
                    normalizedDelta *= 5;
                    var scale = 1 + (normalizedDelta / 1000);
                    var nav = this;

                    var lat = this.lookAtLocation.latitude;
                    var lng = this.lookAtLocation.longitude;
                    var alt = range * scale;
                    var newPosition = new WorldWind.Position(lat, lng, alt);
                    nav.busy = true;
                    this.worldWindow.goTo(newPosition, function () {
                        setTimeout(function () {
                            nav.busy = false;
                        }, 300)

                    });
                    this.applyLimits();
                    this.worldWindow.redraw();
                }
            }

            for (var key in navigator.clusters) {
                navigator.clusters[key].handleClusterZoom(range)
            }

        };

        navigator.handlePanOrDrag = function (event) {
            if (LookAtNavigator.prototype)
                LookAtNavigator.prototype.handlePanOrDrag.apply(this, arguments);
            else
                LookAtNavigator.__proto__.handlePanOrDrag.apply(this, arguments);
            if (event.state == "ended") {//or changed
                var range;
                if (this.lookAt && this.lookAt.range)
                    range = this.lookAt.range
                else
                    range = this.range;
                for (var key in navigator.clusters) {
                    navigator.clusters[key].handleClusterZoom(range, true)
                }
            }
        };

        if (this.controlLayer) {
            if (!this.controlLayer.clusters) {
                this.controlLayer.clusters = {};
            }
            this.controlLayer.clusters[self.options.name] = self;

            this.controlLayer.handleZoom = function (e, control) {
                self.controlLayer.__proto__.handleZoom.apply(this, arguments);
                if (e.type == "mousedown") {
                    var range;
                    if (this.wwd.navigator.lookAt && this.wwd.navigator.lookAt.range)
                        range = this.wwd.navigator.lookAt.range
                    else
                        range = this.wwd.navigator.range;

                    for (var key in this.clusters) {
                        this.clusters[key].handleClusterZoom(range)
                    }
                }
            }

            this.controlLayer.handlePan = function (e, control) {
                self.controlLayer.__proto__.handlePan.apply(this, arguments);
                if (e.type == "mousedown") {
                    var range;
                    if (this.wwd.navigator.lookAt && this.wwd.navigator.lookAt.range)
                        range = this.wwd.navigator.lookAt.range
                    else
                        range = this.wwd.navigator.range;

                    for (var key in this.clusters) {
                        this.clusters[key].handleClusterZoom(range, true)
                    }
                }

            }
        }
    };

    /**
     * Manage the clusters to show and hide based on the range
     * @param range the range of the navigator (distance from camera to terrain)
     * @param pan: Boolean. If the action is a pan or drag
     */
    MarkerCluster.prototype.handleClusterZoom = function (range, pan) {
        var self = this;
        var ranges = [100000000, 5294648, 4099739, 2032591, 1650505, 800762, 500000, 100000, 7000];

        var res;
        if (range >= ranges[0]) {
            res = 1;
        } else if (range <= ranges[ranges.length - 1]) {
            res = ranges.length;
        } else {
            for (var x = 0; x < ranges.length; x++) {
                if (range <= ranges[x] && range >= ranges[x + 1]) {
                    res = x + 1;
                    break;
                }
            }
        }
        self.oldZoom = self.zoomLevel || 0;
        self.zoomLevel = res;

        if (res < self.minReached) {
            self.hideAllLevels();
            self.showZoomLevel(self.minReached);//possible overhead
        } else if (res > self.maxReached) {
            self.hideAllLevels();
            self.showInRange(self.maxReached, range);
        } else {
            if (self.levels[self.oldZoom] && self.levels[res].length != self.levels[self.oldZoom].length || pan) {
                self.hideAllLevels();
                self.showInRange(res, range);
                self.globe.redraw();
            }

        }
    };

    /**
     * Add listeners for mouseover and click
     */
    MarkerCluster.prototype.picking = function () {
        var self = this;
        var highlightedItems = [];
        var handlePick = function (o) {
            var wwd = self.globe;
            var x = o.clientX,
                y = o.clientY;
            var redrawRequired = highlightedItems.length > 0;

            for (var h = 0; h < highlightedItems.length; h++) {
                highlightedItems[h].attributes.imageScale -= 0.2;
                highlightedItems[h].attributes.labelAttributes.font.size -= 10;
            }
            highlightedItems = [];

            var pickList = wwd.pick(wwd.canvasCoordinates(x, y));
            if (pickList.objects.length > 0) {
                redrawRequired = true;
            }

            if (pickList.objects.length > 0) {
                for (var p = 0; p < pickList.objects.length; p++) {
                    if (!pickList.objects[p].isTerrain) {
                        if (pickList.objects[p].userObject.attributes && pickList.objects[p].userObject.attributes.imageScale) {
                            pickList.objects[p].userObject.attributes.imageScale += 0.2;
                            pickList.objects[p].userObject.attributes.labelAttributes.font.size += 10;
                            highlightedItems.push(pickList.objects[p].userObject);
                        }
                    }
                }
            }

            if (redrawRequired) {
                wwd.redraw(); // redraw to make the highlighting changes take effect on the screen
            }
        };
        var handleClick = function (o) {
            var wwd = self.globe;
            var x = o.clientX,
                y = o.clientY;
            var navigator = self.globe.navigator;
            var pickList = wwd.pick(wwd.canvasCoordinates(x, y));
            if (pickList.objects.length > 0) {
                for (var p = 0; p < pickList.objects.length; p++) {
                    if (!pickList.objects[p].isTerrain) {
                        if (pickList.objects[p].userObject.options.zoomLevel) {
                            if (!navigator.lookAtLocation) {
                                navigator.latitude = pickList.objects[p].userObject.position.latitude;
                                navigator.longitude = pickList.objects[p].userObject.position.longitude;
                                navigator.altitude /= 2;
                            } else {
                                navigator.lookAtLocation.latitude = pickList.objects[p].userObject.position.latitude;
                                navigator.lookAtLocation.longitude = pickList.objects[p].userObject.position.longitude;
                                navigator.range /= 2;
                            }
                            var clusters = navigator.clusters || self.globe.controller.clusters;
                            for (var key in clusters) {
                                clusters[key].handleClusterZoom(navigator.range || navigator.altitude);
                                //self.handleClusterZoom(self.globe.navigator.range, true);
                            }

                            break;
                        }
                    }
                }
            }

        };
        if (!self.globe.eventListeners.addedListeners) {
            self.globe.eventListeners.addedListeners = true;
            self.globe.addEventListener("mousemove", handlePick);
            self.globe.addEventListener("click", handleClick);
        }
    };

    /**
     * Shows the marker in the current area at a certain level
     * @param level: Integer. Current level of the camera (matched clusters levels)
     */
    MarkerCluster.prototype.showInRange = function (level, range) {
        var h = document.getElementById("canvasOne").height;
        var w = document.getElementById("canvasOne").width;
        var wwd = this.globe;
        if (wwd.pickTerrain(new WorldWind.Vec2(w / 2, h / 2)).objects) {

            var center = wwd.pickTerrain(new WorldWind.Vec2(w / 2, h / 2));

            center = center.objects[0].position;

            var l = range / Math.cos(Math.PI / 8);
            var base = Math.sqrt(Math.pow(l, 2) - Math.pow(range, 2));

            base = base / 100000;
            var minLat = center.latitude - base;
            var maxLat = center.latitude + base;
            var minLng = center.longitude - base;
            var maxLng = center.longitude + base;
            var buffer = (maxLat - minLat) / 10;
            var bb = {
                ix: minLat - buffer,
                iy: minLng - buffer,
                ax: maxLat + buffer,
                ay: maxLng + buffer
            };
            var count = 0;
            for (var x = 0; x < this.levels[level].length; x++) {
                var point = this.placemarks[this.levels[level][x]];
                var p = point.position;

                if (bb.ix <= p.latitude && p.latitude <= bb.ax && bb.iy <= p.longitude && p.longitude <= bb.ay) {
                    if (count >= this.maxCount) {
                        return;
                    }
                    this.show(point);
                    count++;
                }
            }
        } else {
            this.showZoomLevel(level);
        }
    };

    /**
     * Generates clusters from placemarks
     */
    MarkerCluster.prototype.generateCluster = function () {
        this.hideAllSingle();
        
        /*
        var myJSON = '{"type": "FeatureCollection","features":[';
        newFeature = function (position, label) {
            return '{"type": "Feature","properties": {"name":"' + label + '"},"geometry": {"type": "Point","coordinates": [' +
                +position.longitude + ',' +
                +position.latitude + ']}}';
        };

        this.placemarks.forEach(function (p, i) {
            myJSON += newFeature(p.position, p.label) + ",";
        });
        myJSON = myJSON.slice(0, -1);
        myJSON += ']}';

        console.log(myJSON);
        */

        //rewriting the creation of GeoJSON function from JSON object, not STRING!!- Udayanto Dwi Atmojo

        var myJSON = {};
        myJSON.type = "FeatureCollection";

        //define array of features
        var features = [];

        for(i=0;i<this.placemarks.length;i++){
            var feature = {};
            var coordinates = [this.placemarks[i].position.longitude,this.placemarks[i].position.latitude];

            feature.type = "Features";

            feature.geometry = {};

            feature.geometry.type = "Point";
            feature.geometry.coordinates = coordinates;

            feature.properties = {};

            feature.properties.name = this.placemarks[i].label;
            feature.properties.params = this.placemarks[i].params;

            features.push(feature);
          
        }

        myJSON.features = features;

        //console.log(myJSON);

        //this.generateJSONCluster(JSON.parse(myJSON));
        this.generateJSONCluster(myJSON);
        this.showZoomLevel(this.zoomLevel);
    };

    /**
     * Generates clusters from placemarks
     */
    MarkerCluster.prototype.generateClusterFromPlacemarksArray = function () {
        //this.hideAllSingle();
        
        /*
        var myJSON = '{"type": "FeatureCollection","features":[';
        newFeature = function (position, label) {
            return '{"type": "Feature","properties": {"name":"' + label + '"},"geometry": {"type": "Point","coordinates": [' +
                +position.longitude + ',' +
                +position.latitude + ']}}';
        };

        this.placemarks.forEach(function (p, i) {
            myJSON += newFeature(p.position, p.label) + ",";
        });
        myJSON = myJSON.slice(0, -1);
        myJSON += ']}';

        console.log(myJSON);
        */

        //rewriting the creation of GeoJSON function from JSON object, not STRING!!- Udayanto Dwi Atmojo

        var myJSON = {};
        myJSON.type = "FeatureCollection";

        //define array of features
        var features = [];

        for(i=0;i<this.placemarksArray.length;i++){
            var feature = {};
            var coordinates = [this.placemarksArray[i].position.longitude,this.placemarksArray[i].position.latitude];

            feature.type = "Features";

            feature.geometry = {};

            feature.geometry.type = "Point";
            feature.geometry.coordinates = coordinates;

            feature.properties = {};

            feature.properties.name = this.placemarksArray[i].label;
            feature.properties.params = this.placemarksArray[i].params;

            feature.properties.params.placemarkAttributes = this.placemarksArray[i].params.placemarkAttributes;
            feature.properties.params.highlightAttributes = this.placemarksArray[i].params.highlightAttributes;

            feature.properties.params.info = this.placemarksArray[i].params.info;
            

            features.push(feature);
          
        }

        myJSON.features = features;

       // console.log(myJSON);

        
        this.generateJSONCluster(myJSON);
        this.showZoomLevel(this.zoomLevel);
    };

    /**
     * Generate clusters from a geojson of points
     * @param geojson
     */

    MarkerCluster.prototype.generateClusterCustomImg = function (geojsonArr) {
        var myJSON = {};
        myJSON.type = "FeatureCollection";

        myJSON.features = geojsonArr;

        this.generateJSONClusterCustomImg(myJSON);
        this.showZoomLevel(this.zoomLevel);
    }

     /**
     * Generate clusters from a geojson of points
     * @param geojson
     */
    
    MarkerCluster.prototype.generateJSONCluster = function (geojson) {
        var self = this;
        cluster = supercluster({
            log: true,
            radius: self.radius,
            extent: 128,
            maxZoom: self.zoomLevels
        }).load(geojson.features);

        this.cluster = cluster;
        var end = this.zoomLevels;

        for (var y = 0; y <= end; y++) {
            var res = cluster.getClusters([-180, -90, 180, 90], y + 1);
            var self = this;

            if (this.minReached == 0 && res.length > 0) {
                this.minReached = y;
            }

            if (res.length == geojson.features.length && y > 0 && res.length > 0 && res.length == this.levels[y - 1].length) {
                this.maxReached = y - 1;
                break;
            } else {
                var label, imageSource;

                var max = 0;
                var min = Infinity;
                res.forEach(function (r) {
                    max = Math.max(max, r.properties.point_count || 0);
                    min = Math.min(max, r.properties.point_count || Infinity);
                });
                res.forEach(function (f) {
                    if (f.properties.cluster) {

                        var normalizedCount;
                        if (self.options.attributeColor) {
                            normalizedCount = self.options.attributeColor;
                        } else {
                            normalizedCount = (f.properties.point_count - min) / (max - min);
                        }
                        var sources;
                        if (self.options.clusterSources) {
                            sources = self.options.clusterSources;
                        } else {
                            sources = ["../images/low.png", "../images/medium.png",
                                "../images/high.png", "../images/vhigh.png"];
                        }


                        switch (true) {
                            case normalizedCount < 0.25:
                                imageSource = sources[0];
                                break;
                            case normalizedCount < 0.55:
                                imageSource = sources[1];
                                break;
                            case normalizedCount < 0.75:
                                imageSource = sources[2];
                                break;
                            default:
                                imageSource = sources[3];
                                break;
                        }

                        label = "" + f.properties.point_count_abbreviated;
                        var offsetText =
                            new WorldWind.Offset(
                                WorldWind.OFFSET_PIXELS, 5,
                                WorldWind.OFFSET_PIXELS, -40);
                        var imageScale = 0.5;
                        var zoomLevel = y + 1;

                        var options = {
                            imageSource: imageSource,
                            enabled: false,
                            label: label,
                            offsetText: offsetText,
                            imageScale: imageScale,
                            zoomLevel: zoomLevel
                        };
                        var coords = [f.geometry.coordinates[1], f.geometry.coordinates[0]];
    
                        var p = self.newPlacemark(coords, null, options);
    
                        self.add(p);
                        self.addToZoom(y, p.index);

                    } else {
                        label = f.properties.name;
                        //imageSource = WorldWind.configuration.baseUrl + "images/pushpins/push-pin-red.png";
                        imageSource = WorldWind.configuration.baseUrl + "images/thing_node.png";
                        var zoomLevel = false;

                        var options = {
                            imageSource: imageSource,
                            enabled: false,
                            label: label,
                            offsetText: offsetText,
                            imageScale: imageScale,
                            zoomLevel: zoomLevel
                        };
                        var coords = [f.geometry.coordinates[1], f.geometry.coordinates[0]];
    
                        if(!!(f.properties.params)){

                            if(!!(f.properties.params.placemarkAttributes)){

                                var p = self.newFinalPlacemark(coords, f.properties.params.placemarkAttributes, options, f.properties.params);
    
                            

                                self.add(p);
                                self.addToZoom(y, p.index);

                            } else {
                                var p = self.newPlacemark(coords, null, options, f.properties.params);
    
                                self.add(p);
                                self.addToZoom(y, p.index);
                            }

                        } else {
                            var p = self.newPlacemark(coords, null, options);
    
                            self.add(p);
                            self.addToZoom(y, p.index);
                        }
    
                    }
                   
                });
            }
        }
        if (!this.maxReached) {
            this.maxReached = end;
        }
        this.picking();
        var range = this.globe.navigator.range || this.globe.navigator.lookAt.range;
        this.handleClusterZoom(range, true)
    };


         /**
     * Generate clusters from a geojson of points, individual points with custom images/icons. Added by Udayanto Dwi Atmojo
     * @param geojson
     */
    
    MarkerCluster.prototype.generateJSONClusterCustomImg = function (geojson) {
        var self = this;
        cluster = supercluster({
            log: true,
            radius: self.radius,
            extent: 128,
            maxZoom: self.zoomLevels
        }).load(geojson.features);

        this.cluster = cluster;
        var end = this.zoomLevels;

        for (var y = 0; y <= end; y++) {
            var res = cluster.getClusters([-180, -90, 180, 90], y + 1);
            var self = this;

            if (this.minReached == 0 && res.length > 0) {
                this.minReached = y;
            }

            if (res.length == geojson.features.length && y > 0 && res.length > 0 && res.length == this.levels[y - 1].length) {
                this.maxReached = y - 1;
                break;
            } else {
                var label, imageSource;

                var max = 0;
                var min = Infinity;
                res.forEach(function (r) {
                    max = Math.max(max, r.properties.point_count || 0);
                    min = Math.min(max, r.properties.point_count || Infinity);
                });
                res.forEach(function (f) {
                    if (f.properties.cluster) {

                        var normalizedCount;
                        if (self.options.attributeColor) {
                            normalizedCount = self.options.attributeColor;
                        } else {
                            normalizedCount = (f.properties.point_count - min) / (max - min);
                        }
                        var sources;
                        if (self.options.clusterSources) {
                            sources = self.options.clusterSources;
                        } else {
                            sources = ["../images/low.png", "../images/medium.png",
                                "../images/high.png", "../images/vhigh.png"];
                        }


                        switch (true) {
                            case normalizedCount < 0.25:
                                imageSource = sources[0];
                                break;
                            case normalizedCount < 0.55:
                                imageSource = sources[1];
                                break;
                            case normalizedCount < 0.75:
                                imageSource = sources[2];
                                break;
                            default:
                                imageSource = sources[3];
                                break;
                        }

                        label = "" + f.properties.point_count_abbreviated;
                        var offsetText =
                            new WorldWind.Offset(
                                WorldWind.OFFSET_PIXELS, 5,
                                WorldWind.OFFSET_PIXELS, -40);
                        var imageScale = 0.5;
                        var zoomLevel = y + 1;

                        var options = {
                            imageSource: imageSource,
                            enabled: false,
                            label: label,
                            offsetText: offsetText,
                            imageScale: imageScale,
                            zoomLevel: zoomLevel
                        };
                        var coords = [f.geometry.coordinates[1], f.geometry.coordinates[0]];
    
                        var p = self.newPlacemark(coords, null, options);
    
                        self.add(p);
                        self.addToZoom(y, p.index);

                    } else {
                        //label = f.properties.name;
                        //imageSource = WorldWind.configuration.baseUrl + "images/pushpins/push-pin-red.png";
                        imageSource = f.properties.icon;
                        var zoomLevel = false;

                        var options = {
                            imageSource: imageSource,
                            enabled: false,
                            //label: label,
                            offsetText: offsetText,
                            imageScale: imageScale,
                            zoomLevel: zoomLevel
                        };
                        var coords = [f.geometry.coordinates[1], f.geometry.coordinates[0]];
    
                        if(!!(f.properties.params)){

                            if(!!(f.properties.params.placemarkAttributes)){

                                var p = self.newFinalPlacemark(coords, f.properties.params.placemarkAttributes, options, f.properties.params);
    
                                self.add(p);
                                self.addToZoom(y, p.index);

                            } else {
                                var p = self.newPlacemark(coords, null, options, f.properties.params);
    
                                self.add(p);
                                self.addToZoom(y, p.index);
                            }

                        } else {
                            var p = self.newPlacemark(coords, null, options);
    
                            self.add(p);
                            self.addToZoom(y, p.index);
                        }
    
                    }
                   
                });
            }
        }
        if (!this.maxReached) {
            this.maxReached = end;
        }
        this.picking();
        var range = this.globe.navigator.range || this.globe.navigator.lookAt.range;
        this.handleClusterZoom(range, true)
    };
    

    /**
     * ORIGINAL Generate clusters from a geojson of points
     * @param geojson
     */
    /*
    MarkerCluster.prototype.generateJSONCluster = function (geojson) {
        var self = this;
        cluster = supercluster({
            log: true,
            radius: self.radius,
            extent: 128,
            maxZoom: self.zoomLevels
        }).load(geojson.features);

        this.cluster = cluster;
        var end = this.zoomLevels;

        for (var y = 0; y <= end; y++) {
            var res = cluster.getClusters([-180, -90, 180, 90], y + 1);
            var self = this;

            if (this.minReached == 0 && res.length > 0) {
                this.minReached = y;
            }

            if (res.length == geojson.features.length && y > 0 && res.length > 0 && res.length == this.levels[y - 1].length) {
                this.maxReached = y - 1;
                break;
            } else {
                var label, imageSource;

                var max = 0;
                var min = Infinity;
                res.forEach(function (r) {
                    max = Math.max(max, r.properties.point_count || 0);
                    min = Math.min(max, r.properties.point_count || Infinity);
                });
                res.forEach(function (f) {
                    if (f.properties.cluster) {

                        var normalizedCount;
                        if (self.options.attributeColor) {
                            normalizedCount = self.options.attributeColor;
                        } else {
                            normalizedCount = (f.properties.point_count - min) / (max - min);
                        }
                        var sources;
                        if (self.options.clusterSources) {
                            sources = self.options.clusterSources;
                        } else {
                            sources = ["../images/low.png", "../images/medium.png",
                                "../images/high.png", "../images/vhigh.png"];
                        }


                        switch (true) {
                            case normalizedCount < 0.25:
                                imageSource = sources[0];
                                break;
                            case normalizedCount < 0.55:
                                imageSource = sources[1];
                                break;
                            case normalizedCount < 0.75:
                                imageSource = sources[2];
                                break;
                            default:
                                imageSource = sources[3];
                                break;
                        }

                        label = "" + f.properties.point_count_abbreviated;
                        var offsetText =
                            new WorldWind.Offset(
                                WorldWind.OFFSET_PIXELS, 5,
                                WorldWind.OFFSET_PIXELS, -40);
                        var imageScale = 0.5;
                        var zoomLevel = y + 1;
                    } else {
                        label = f.properties.name;
                        imageSource = WorldWind.configuration.baseUrl + "images/pushpins/push-pin-red.png";
                        var zoomLevel = false;
                    }
                    var options = {
                        imageSource: imageSource,
                        enabled: false,
                        label: label,
                        offsetText: offsetText,
                        imageScale: imageScale,
                        zoomLevel: zoomLevel
                    };
                    var coords = [f.geometry.coordinates[1], f.geometry.coordinates[0]];
                    var p = self.newPlacemark(coords, null, options);

                    self.add(p);
                    self.addToZoom(y, p.index);
                });
            }
        }
        if (!this.maxReached) {
            this.maxReached = end;
        }
        this.picking();
        var range = this.globe.navigator.range || this.globe.navigator.lookAt.range;
        this.handleClusterZoom(range, true)
    };
    */

    /**
     * Initialize the levels containing the clusters
     * @param n:Integer. The number of levels for the clusters.
     * @returns {Array}. The initialized empty levels
     */
    MarkerCluster.prototype.createZoomClusters = function (n) {
        for (var x = 0; x <= n; x++) {
            this.levels[x] = [];
        }
        return this.levels;
    };

    /**
     * Add a specified index of a marker to a specified level
     * @param level: Integer. Specifies the level that should contain the marker
     * @param index. The identifier for the marker
     */
    MarkerCluster.prototype.addToZoom = function (level, index) {
        this.levels[level].push(index);
    };

    /**
     * Initialize the level corresponding to the markerCluster
     * @param layer. The layer associated to this instance of markerCluster.
     */
    MarkerCluster.prototype.setLayer = function (layer) {
        this.layer = layer;
    };

    /**
     * Add a new placemark or a list of placemarks to the markerlcuster container.
     * @param placemark. The placemark to add or an array of placemarks.
     */
    MarkerCluster.prototype.add = function (placemark) {
        if (Object.prototype.toString.call(placemark) === '[object Array]') {
            var self = this;
            placemark.forEach(function (place) {
                placemark.index = self.placemarks.length;
                self.layer.addRenderable(place);
                self.placemarks.push(place);
            })
        } else {
            placemark.index = this.placemarks.length;
            this.layer.addRenderable(placemark);
            this.placemarks.push(placemark);
        }
    };

    /**
     * Add a new placemark or a list of placemarks only to internal array, but not to the layer. Added by Udayanto Dwi Atmojo
     * @param placemark. The placemark to add or an array of placemarks.
     */
    MarkerCluster.prototype.addToPlacemarkArray = function (placemark) {
        if (Object.prototype.toString.call(placemark) === '[object Array]') {
            var self = this;
            placemark.forEach(function (place) {
                placemark.index = self.placemarksArray.length;
                //self.layer.addRenderable(place);
                self.placemarksArray.push(place);
            })
        } else {
            placemark.index = this.placemarksArray.length;
            //this.layer.addRenderable(placemark);
            this.placemarksArray.push(placemark);
        }
    };

    /**
     * Clear the placemarksArray. Added by Udayanto Dwi Atmojo
     * @param placemark. The placemark to add or an array of placemarks.
     */
    MarkerCluster.prototype.clearPlacemarkArray = function () {
        this.placemarksArray.length = 0;
    };

    
    /**
     * ORIGINAL Generate a standard placemark
     * @param coordinates: Coordinates of the placemark
     * @param placemarkAttributes: Attributes to associate to the placemark
     * @param options: Options to assign to the placemark
     * @returns {*}
     */
    /*
    MarkerCluster.prototype.generatePlacemarks = function (coordinates, placemarkAttributes, options) {
        var lat, lng, alt;
        if (typeof(coordinates[0]) !== "undefined" && typeof(coordinates[1]) !== "undefined") {
            lat = Number(coordinates[0]);
            lng = Number(coordinates[1]);
        } else if (typeof(coordinates.lat) !== "undefined" && typeof(coordinates.lng) !== "undefined") {
            lat = Number(coordinates.lat);
            lng = Number(coordinates.lng);
        } else {
            throw ("Error in coordinates");
        }

        if (!options) {
            options = {};
        }

        alt = coordinates[2] ? coordinates[2] : 0;
        alt = coordinates.alt ? coordinates.alt : alt;

        var position = new WorldWind.Position(lat, lng, alt);


        if (!placemarkAttributes) {
            placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
            placemarkAttributes.imageScale = options.imageScale ? options.imageScale : 1;
            placemarkAttributes.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.3,
                WorldWind.OFFSET_FRACTION, 0.0);

            if (options.offsetText) {
                placemarkAttributes.labelAttributes.offset = options.offsetText;
            } else {
                placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
                    WorldWind.OFFSET_FRACTION, 0.5,
                    WorldWind.OFFSET_FRACTION, 1.0);
            }
            placemarkAttributes.labelAttributes.color = WorldWind.Color.WHITE;
            placemarkAttributes.labelAttributes.font.size = 30;
        }

        var placemark = new WorldWind.Placemark(position, true, null);
        placemark.label = options.label ? options.label : "MyMarker " + lat + " - " + lng;
        placemark.altitudeMode = options.altitudeMode ? options.altitudeMode : WorldWind.RELATIVE_TO_GROUND;
        placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
        placemarkAttributes.imageSource = options.imageSource ? options.imageSource : "images/pushpins/push-pin-red.png";
        placemark.attributes = placemarkAttributes;
        placemark.imageTilt = 5;
        placemark.eyeDistanceScaling = true;
        placemark.eyeDistanceScalingThreshold = 3e6;
        placemark.eyeDistanceScalingLabelThreshold = 1e20;
        placemark.options = options;
        placemark.enabled = false;

        return placemark;
    };
    */

    /**
     * Generate a standard placemark, modified by Udayanto
     * @param coordinates: Coordinates of the placemark
     * @param placemarkAttributes: Attributes to associate to the placemark
     * @param options: Options to assign to the placemark
     * @returns {*}
     */
    
    MarkerCluster.prototype.generatePlacemarks = function (coordinates, placemarkAttributes, options, params) {
        var lat, lng, alt, placemarkAttr;
        if (typeof(coordinates[0]) !== "undefined" && typeof(coordinates[1]) !== "undefined") {
            lat = Number(coordinates[0]);
            lng = Number(coordinates[1]);
        } else if (typeof(coordinates.lat) !== "undefined" && typeof(coordinates.lng) !== "undefined") {
            lat = Number(coordinates.lat);
            lng = Number(coordinates.lng);
        } else {
            throw ("Error in coordinates");
        }

        if (!options) {
            options = {};
        }

        alt = coordinates[2] ? coordinates[2] : 0;
        alt = coordinates.alt ? coordinates.alt : alt;

        var position = new WorldWind.Position(lat, lng, alt);

        //var placemark = new WorldWind.Placemark(position, true, null);
        var placemark;

        if (!placemarkAttributes) {
            placemarkAttr = new WorldWind.PlacemarkAttributes(null);
            placemarkAttr.imageScale = options.imageScale ? options.imageScale : 1;
            placemarkAttr.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.3,
                WorldWind.OFFSET_FRACTION, 0.0);

            if (options.offsetText) {
                placemarkAttr.labelAttributes.offset = options.offsetText;
            } else {
                placemarkAttr.labelAttributes.offset = new WorldWind.Offset(
                    WorldWind.OFFSET_FRACTION, 0.5,
                    WorldWind.OFFSET_FRACTION, 1.0);
            }
            placemarkAttr.labelAttributes.color = WorldWind.Color.WHITE;
            placemarkAttr.labelAttributes.font.size = 30;

            placemarkAttr.imageSource = options.imageSource ? options.imageSource : "images/pushpins/push-pin-red.png";
            
            placemark = new WorldWind.Placemark(position, false, null);

            placemark.label = options.label ? options.label : "MyMarker " + lat + " - " + lng;
            placemark.altitudeMode = options.altitudeMode ? options.altitudeMode : WorldWind.RELATIVE_TO_GROUND;
            
            placemark.attributes = placemarkAttr;
            placemark.imageTilt = 5;
            placemark.eyeDistanceScaling = true;
            placemark.eyeDistanceScalingThreshold = 3e6;
            placemark.eyeDistanceScalingLabelThreshold = 1e20;

        } else {
            placemarkAttr = new WorldWind.PlacemarkAttributes(placemarkAttributes);

            if (options.offsetText) {
                placemarkAttr.labelAttributes.offset = options.offsetText;
            } else {
                placemarkAttr.labelAttributes.offset = new WorldWind.Offset(
                    WorldWind.OFFSET_FRACTION, 0.5,
                    WorldWind.OFFSET_FRACTION, 1.0);
            }
            placemark = new WorldWind.Placemark(position, false, placemarkAttr);
            placemark.altitudeMode = options.altitudeMode ? options.altitudeMode : WorldWind.RELATIVE_TO_GROUND;

            //placemark.attributes = placemarkAttr;
            
        }

        //console.log(options.imageSource);

        
        placemark.options = options;
        placemark.enabled = false;

        if(!!params){

            if(!!params.highlightAttributes){
                placemark.highlightAttributes = params.highlightAttributes;
            }

            if(!!params.info){
                placemark.params={};
                for(var keys in params.info){
                    placemark.params[keys] = params.info[keys];
                }
            }
            
        }

        return placemark;
    };

       /**
     * Generate a initial placemark, added by Udayanto
     * @param coordinates: Coordinates of the placemark
     * @param placemarkAttributes: Attributes to associate to the placemark
     * @param options: Options to assign to the placemark
     * @returns {*}
     */
    
    MarkerCluster.prototype.generateInitPlacemarks = function (coordinates, placemarkAttributes, options, params) {
        var lat, lng, alt, placemarkAttr;
        if (typeof(coordinates[0]) !== "undefined" && typeof(coordinates[1]) !== "undefined") {
            lat = Number(coordinates[0]);
            lng = Number(coordinates[1]);
        } else if (typeof(coordinates.lat) !== "undefined" && typeof(coordinates.lng) !== "undefined") {
            lat = Number(coordinates.lat);
            lng = Number(coordinates.lng);
        } else {
            throw ("Error in coordinates");
        }

        if (!options) {
            options = {};
        }

        alt = coordinates[2] ? coordinates[2] : 0;
        alt = coordinates.alt ? coordinates.alt : alt;

        var position = new WorldWind.Position(lat, lng, alt);

        //var placemark = new WorldWind.Placemark(position, true, null);
        var placemark;

        
        if (!placemarkAttributes) {
            placemarkAttr = new WorldWind.PlacemarkAttributes(null);
            placemarkAttr.imageScale = options.imageScale ? options.imageScale : 1;
            placemarkAttr.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.3,
                WorldWind.OFFSET_FRACTION, 0.0);

            if (options.offsetText) {
                placemarkAttr.labelAttributes.offset = options.offsetText;
            } else {
                placemarkAttr.labelAttributes.offset = new WorldWind.Offset(
                    WorldWind.OFFSET_FRACTION, 0.5,
                    WorldWind.OFFSET_FRACTION, 1.0);
            }
            placemarkAttr.labelAttributes.color = WorldWind.Color.WHITE;
            placemarkAttr.labelAttributes.font.size = 30;

            placemarkAttr.imageSource = options.imageSource ? options.imageSource : "images/pushpins/push-pin-red.png";
            
            placemark = new WorldWind.Placemark(position, false, null);

            placemark.label = options.label ? options.label : "MyMarker " + lat + " - " + lng;
            placemark.altitudeMode = options.altitudeMode ? options.altitudeMode : WorldWind.RELATIVE_TO_GROUND;
            
            placemark.attributes = placemarkAttr;
            placemark.imageTilt = 5;
            placemark.eyeDistanceScaling = true;
            placemark.eyeDistanceScalingThreshold = 3e6;
            placemark.eyeDistanceScalingLabelThreshold = 1e20;

        } else {
            placemarkAttr = new WorldWind.PlacemarkAttributes(placemarkAttributes);

            if (options.offsetText) {
                placemarkAttr.labelAttributes.offset = options.offsetText;
            } else {
                placemarkAttr.labelAttributes.offset = new WorldWind.Offset(
                    WorldWind.OFFSET_FRACTION, 0.5,
                    WorldWind.OFFSET_FRACTION, 1.0);
            }
            placemark = new WorldWind.Placemark(position, false, placemarkAttr);
            placemark.altitudeMode = options.altitudeMode ? options.altitudeMode : WorldWind.RELATIVE_TO_GROUND;

            //placemark.attributes = placemarkAttr;
            
        }

        //console.log(options.imageSource);

        
        placemark.options = options;
        placemark.enabled = false;

        if(!!params){
            placemark.params={};

            if(!!params.highlightAttributes){
                placemark.params.highlightAttributes = params.highlightAttributes;
            }

            if(!!params.placemarkAttributes){
                placemark.params.placemarkAttributes = params.placemarkAttributes;
            }

            if(!!params.info){
                placemark.params.info = {};
                for(var keys in params.info){
                    placemark.params.info[keys] = params.info[keys];
                }
            }
            
        }

        return placemark;
    };

     /**
     * Generate a final placemark, added by Udayanto
     * @param coordinates: Coordinates of the placemark
     * @param placemarkAttributes: Attributes to associate to the placemark
     * @param options: Options to assign to the placemark
     * @returns {*}
     */
    
    MarkerCluster.prototype.generateFinalPlacemarks = function (coordinates, placemarkAttributes, options, params) {
        var lat, lng, alt, placemarkAttr;
        if (typeof(coordinates[0]) !== "undefined" && typeof(coordinates[1]) !== "undefined") {
            lat = Number(coordinates[0]);
            lng = Number(coordinates[1]);
        } else if (typeof(coordinates.lat) !== "undefined" && typeof(coordinates.lng) !== "undefined") {
            lat = Number(coordinates.lat);
            lng = Number(coordinates.lng);
        } else {
            throw ("Error in coordinates");
        }

        if (!options) {
            options = {};
        }

        alt = coordinates[2] ? coordinates[2] : 0;
        alt = coordinates.alt ? coordinates.alt : alt;

        var position = new WorldWind.Position(lat, lng, alt);

        //var placemark = new WorldWind.Placemark(position, true, null);
        var placemark;

        if (!placemarkAttributes) {
            placemarkAttr = new WorldWind.PlacemarkAttributes(null);
            placemarkAttr.imageScale = options.imageScale ? options.imageScale : 1;
            placemarkAttr.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.3,
                WorldWind.OFFSET_FRACTION, 0.0);

            if (options.offsetText) {
                placemarkAttr.labelAttributes.offset = options.offsetText;
            } else {
                placemarkAttr.labelAttributes.offset = new WorldWind.Offset(
                    WorldWind.OFFSET_FRACTION, 0.5,
                    WorldWind.OFFSET_FRACTION, 1.0);
            }
            placemarkAttr.labelAttributes.color = WorldWind.Color.WHITE;
            placemarkAttr.labelAttributes.font.size = 30;

            placemarkAttr.imageSource = options.imageSource ? options.imageSource : "images/pushpins/push-pin-red.png";
            
            placemark = new WorldWind.Placemark(position, false, null);

            placemark.label = options.label ? options.label : "MyMarker " + lat + " - " + lng;
            placemark.altitudeMode = options.altitudeMode ? options.altitudeMode : WorldWind.RELATIVE_TO_GROUND;
            
            placemark.attributes = placemarkAttr;
            placemark.imageTilt = 5;
            placemark.eyeDistanceScaling = true;
            placemark.eyeDistanceScalingThreshold = 3e6;
            placemark.eyeDistanceScalingLabelThreshold = 1e20;

        } else {
            placemarkAttr = new WorldWind.PlacemarkAttributes(placemarkAttributes);

            if (options.offsetText) {
                placemarkAttr.labelAttributes.offset = options.offsetText;
            } else {
                placemarkAttr.labelAttributes.offset = new WorldWind.Offset(
                    WorldWind.OFFSET_FRACTION, 0.5,
                    WorldWind.OFFSET_FRACTION, 1.0);
            }
            placemark = new WorldWind.Placemark(position, false, placemarkAttr);
            placemark.altitudeMode = options.altitudeMode ? options.altitudeMode : WorldWind.RELATIVE_TO_GROUND;

            //placemark.attributes = placemarkAttr;
            
        }

        //console.log(options.imageSource);
        placemark.placemarkAttributes = placemarkAttr;
        
        placemark.options = options;
        placemark.enabled = false;

        if(!!params){

            if(!!params.highlightAttributes){
                placemark.highlightAttributes = params.highlightAttributes;
            }

            if(!!params.info){
                for(var keys in params.info){
                    placemark[keys] = params.info[keys];
                }
            }
            
        }

        return placemark;
    };
    
    /**
     * Create a new initial placemark from a pair of coordinates or a coordinates array, created by Udayanto Dwi Atmojo
     * @param coordinates: The coordinate fot the placemark
     * @param placemarkAttributes: Attributes to associate to the placemark
     * @param options: Options to assign to the placemark
     * @returns {*}
     */
    MarkerCluster.prototype.newInitPlacemark = function (coordinates, placemarkAttributes, options,params) {
        if (!coordinates) {
            throw ("No coordinates provided");
        }
        var placemark;
        if (typeof (coordinates[0]) == "object") {
            placemark = [];
            for (var index in coordinates) {
                if(!!params){
                    placemark.push(this.generateInitPlacemarks(coordinates[index], placemarkAttributes, options,params));
                } else {
                    placemark.push(this.generatePlacemarks(coordinates[index], placemarkAttributes, options));
                }
               
            }
        } else {
            if(!!params){
                placemark = this.generateInitPlacemarks(coordinates, placemarkAttributes, options, params)
            } else {
                placemark = this.generatePlacemarks(coordinates, placemarkAttributes, options)
            }
            
        }
        return placemark;
    };

    /**
     * Create a new initial placemark from a pair of coordinates or a coordinates array, created by Udayanto Dwi Atmojo
     * @param coordinates: The coordinate fot the placemark
     * @param placemarkAttributes: Attributes to associate to the placemark
     * @param options: Options to assign to the placemark
     * @returns {*}
     */
    MarkerCluster.prototype.newFinalPlacemark = function (coordinates, placemarkAttributes, options,params) {
        if (!coordinates) {
            throw ("No coordinates provided");
        }
        var placemark;
        if (typeof (coordinates[0]) == "object") {
            placemark = [];
            for (var index in coordinates) {
                if(!!params){
                    placemark.push(this.generateFinalPlacemarks(coordinates[index], placemarkAttributes, options,params));
                } else {
                    placemark.push(this.generatePlacemarks(coordinates[index], placemarkAttributes, options));
                }
               
            }
        } else {
            if(!!params){
                placemark = this.generateFinalPlacemarks(coordinates, placemarkAttributes, options, params)
            } else {
                placemark = this.generatePlacemarks(coordinates, placemarkAttributes, options)
            }
            
        }
        return placemark;
    };

    /**
     * Create a new placemark from a pair of coordinates or a coordinates array
     * @param coordinates: The coordinate fot the placemark
     * @param placemarkAttributes: Attributes to associate to the placemark
     * @param options: Options to assign to the placemark
     * @returns {*}
     */
    MarkerCluster.prototype.newPlacemark = function (coordinates, placemarkAttributes, options,params) {
        if (!coordinates) {
            throw ("No coordinates provided");
        }
        var placemark;
        if (typeof (coordinates[0]) == "object") {
            placemark = [];
            for (var index in coordinates) {
                if(!!params){
                    placemark.push(this.generatePlacemarks(coordinates[index], placemarkAttributes, options,params));
                } else {
                    placemark.push(this.generatePlacemarks(coordinates[index], placemarkAttributes, options));
                }
               
            }
        } else {
            if(!!params){
                placemark = this.generatePlacemarks(coordinates, placemarkAttributes, options, params)
            } else {
                placemark = this.generatePlacemarks(coordinates, placemarkAttributes, options)
            }
            
        }
        return placemark;
    };

    /**
     * Hides a specified placemark
     * @param placemark: the placemark to hide
     * @returns {*}
     */
    MarkerCluster.prototype.hide = function (placemark) {
        var index = placemark.index;
        this.placemarks[index].enabled = false;
        return placemark;
    };

    /**
     * Shows a specified placemark
     * @param placemark: the placemark to show
     * @returns {*}
     */
    MarkerCluster.prototype.show = function (placemark) {
        var index = placemark.index;
        this.placemarks[index].enabled = true;
        return placemark;
    };

    /**
     * Hides all placemark inserted
     */
    MarkerCluster.prototype.hideAllSingle = function () {
        for (var x = 0; x < this.placemarks.length; x++) {
            this.placemarks[x].enabled = false;
        }
    };

    /**
     * Shows all placemark inserted
     */
    MarkerCluster.prototype.showAllSingle = function () {
        for (var x = 0; x < this.placemarks.length; x++) {
            this.placemarks[x].enabled = true;
        }
    };

    /**
     * Hides all placemark at all zoom levels
     */
    MarkerCluster.prototype.hideAllLevels = function () {
        for (var x = 0; x <= this.zoomLevels && x <= this.maxReached; x++) {
            this.hideZoomLevel(x);
        }
    };

    /**
     * Shows all placemark at all zoom levels
     */
    MarkerCluster.prototype.showAllLevels = function () {
        for (var x = 0; x <= this.zoomLevels && x <= this.maxReached; x++) {
            this.showZoomLevel(x);
        }
    };

    /**
     * Hides the placemarks at a specified zoom level
     * @param level: the level in which the placemark will be hidden
     */
    MarkerCluster.prototype.hideZoomLevel = function (level) {
        if (this.levels[level]) {
            for (var x = 0; x < this.levels[level].length; x++) {
                this.hide(this.placemarks[this.levels[level][x]]);
            }
        }
    };

    /**
     * Shows the placemarks at a specified zoom level
     * @param level: the level in which the placemark will be shown
     */
    MarkerCluster.prototype.showZoomLevel = function (level) {
        if (this.levels[level]) {
            for (var x = 0; x < this.levels[level].length; x++) {
                this.show(this.placemarks[this.levels[level][x]]);
            }
        }
    };

    /**
     * Removes a placemark from the cluster
     * @param placemark: The placemark that needs to be removed
     */
    MarkerCluster.prototype.removePlacemark = function (placemark) {
        this.layer.removeRenderable(placemark);
        this.placemarks.splice(this.placemarks.indexOf(placemark));
    };

    /**
     * Removes all placemarks from the cluster
     * added by Udayanto Dwi Atmojo
     */
    MarkerCluster.prototype.removeAllPlacemarks = function () {
        this.layer.removeAllPlacemarks();
        //this.placemarks.splice(this.placemarks.indexOf(placemark));
        this.placemarks.splice(0, this.placemarks.length);
    };

    /**
     * function to add the cluster Layer
     * added by Udayanto Dwi Atmojo
     */
    MarkerCluster.prototype.addClusterLayer = function () {
        //var self = this;
        this.globe.addLayer(this.layer);
        //this.globe.redraw();
        //this.globe.addLayer(this.layer);
        //this.globe.redraw();
    };

    /**
     * function to remove the cluster Layer
     * added by Udayanto Dwi Atmojo
     */
    MarkerCluster.prototype.removeClusterLayer = function () {
        //var self = this;
        this.globe.removeLayer(this.layer);
        //this.globe.redraw();
        //this.globe.removeLayer(this.layer);
        //this.globe.redraw();
        
    };

    /**
     * function to modify placemark in certain index of the 'final' placemark array
     * added by Udayanto Dwi Atmojo
     */
    MarkerCluster.prototype.modifyPlacemarkInIndex = function (placemarkToAdd,placemarkToRemove,index) {
        
        this.layer.removeRenderable(placemarkToRemove);
        this.placemarks[index] = placemarkToAdd;
        this.layer.addRenderable(placemarkToAdd);
    };

    /**
     * function to get the place
     * added by Udayanto Dwi Atmojo
     */
    MarkerCluster.prototype.getPlacemarkOfIndex = function (index) {
        return this.placemarks[index];
    };


     /**
     * function to get the globe object
     * added by Udayanto Dwi Atmojo
     */
    MarkerCluster.prototype.getGlobe = function(){
        return this.globe;
    }

    /**
     * function to update the globe object
     * added by Udayanto Dwi Atmojo
     */
    MarkerCluster.prototype.updateGlobe = function(globe){
        this.globe = globe;
    }

    

  //  return MarkerCluster;
//});
