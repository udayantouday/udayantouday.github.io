//Written by Udayanto Dwi Atmojo


var wwd;
var layers; // array of layers

var allThingsDB=[];

var topPickedObject;

var copyToPass={};

var placemarkLayerAllDev= new WorldWind.RenderableLayer("All Things Placemark");

var placemarkLayerDevByLoc=new WorldWind.RenderableLayer("Filtered Placemarks");



var placemarkLayerDevByRadius =new WorldWind.RenderableLayer("Filtered by Radius Placemarks");

var placemarkLayerDevByKeywords =new WorldWind.RenderableLayer("Filtered by Keywords Placemarks");



var placemarkMobThLayer;

var polygonsLayer = new WorldWind.RenderableLayer();

var timeSeriesLayer = new WorldWind.RenderableLayer();


var mobThingsList = [];


var ts_var;

var time_step=0;

var markerCluster;


var markerClusterMobTh;

var previousUserObj;

var mobileThingsDB=[];

var mobileThingsQueryProm=[];


var mobThToVisList={};

var mobThToVisTimeSeries=[];

var ThingsListSearchByRadius=[];

var ThingsListSearchByKeywords=[];


async function StartWorldWind() {
    // Create a WorldWindow for the canvas.
    wwd = new WorldWind.WorldWindow("canvasOne");
    // Add some image layers to the WorldWindow's globe.
    layers = [
        // Imagery layers.
        
        //{layer: new WorldWind.StarFieldLayer(),enabled: true},
        //{layer: new WorldWind.BMNGLayer(), enabled: true},
        //{layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
        //{layer: new WorldWind.BingAerialLayer(null), enabled: false},
        {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true},
        //{layer: new WorldWind.BingRoadsLayer(null), enabled: false},
        {layer: new WorldWind.OpenStreetMapImageLayer(null), enabled: false},
        // Add atmosphere layer on top of all base layers.
        {layer: new WorldWind.AtmosphereLayer(), enabled: true},
        // WorldWindow UI layers.
        {layer: new WorldWind.CompassLayer(), enabled: true},
        {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
        //{layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
    ];

    for (var l = 0; l < layers.length; l++) {
        layers[l].layer.enabled = layers[l].enabled;
        wwd.addLayer(layers[l].layer);
    }

    

    // The common pick-handling function.
    var handlePick = function(o) {
    // The input argument is either an Event or a TapRecognizer. Both have the same properties for determining
    // the mouse or tap location.
    var x = o.clientX,
        y = o.clientY;

    // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
    // relative to the upper left corner of the canvas rather than the upper left corner of the page.
    var pickList = wwd.pick(wwd.canvasCoordinates(x, y));

    // Report the top picked object, if any.
    topPickedObject = pickList.topPickedObject();
    
    if (topPickedObject && topPickedObject.isTerrain) {
       // var pickResult = document.getElementById("pick-result");

       /*
       if(!typeof previousUserObj == 'undefined'){
            var placemarkToRemove = markerCluster.getPlacemarkOfIndex(previousUserObj);

            var placemarkToAdd = $.extend(true,{},placemarkToRemove);
    
            placemarkToAdd.placemarkAttributes.imageSource = "images/thing_node.png";
            placemarkToAdd.placemarkAttributes.imageScale = 0.22;
    
            markerCluster.modifyPlacemarkInIndex(placemarkToAdd,placemarkToRemove,previousUserObj);
    
            wwd.redraw();
    
            delete previousUserObj;
       }
       
      */


       
       

       if(!!(document.getElementById("existingThingsSummary"))){
            var existingEl = document.getElementById("existingThingsSummary");
            existingEl.parentNode.removeChild(existingEl);
       }
       // pickResult.textContent = topPickedObject.position;
       if(document.getElementById("StationaryOrMobile").options[(document.getElementById("StationaryOrMobile")).selectedIndex].value == "S")
       {    
           removeOptions(document.getElementById("selectSensor"));
           document.getElementById('startTime').disabled = true;
           document.getElementById('endTime').disabled = true;
           document.getElementById('spanTimeNum').disabled = true;
           document.getElementById('spanTimeUnit').disabled = true;
           document.getElementById('submitStartEndDateTime').disabled = true;
       } 
       else if(document.getElementById("StationaryOrMobile").options[(document.getElementById("StationaryOrMobile")).selectedIndex].value == "M")
       {
           document.getElementById('spanTimeNum').disabled = true;
           document.getElementById('spanTimeUnit').disabled = true;
       }

    } else if (topPickedObject) {
        //console.log("element obj id: " +document.getElementById(topPickedObject.userObject.displayName));
        
        

        /*
        var drpDown = document.getElementById('selectSensor');
        if(drpDown.childNodes.length>0){
            for(i=0;i<drpDown.childNodes.length;i++){
                drpDown.removeChild(drpDown.childNodes[i]);
            }   
        }
        */
       console.log(topPickedObject);

       if(!!(topPickedObject.userObject.placemarkType)){

        if(document.getElementById("StationaryOrMobile").options[(document.getElementById("StationaryOrMobile")).selectedIndex].value == "S")
        {
            //future development

        }

            if(topPickedObject.userObject.placemarkType== "iothings"){
                removeOptions(document.getElementById("selectSensor"));
            }
            

            if(topPickedObject.userObject.providerID === "smartcanada"){

                //Future updates

            } else if(topPickedObject.userObject.providerID === "bcncat"){

                if(!!(document.getElementById("existingThingsSummary"))){
                    var existingEl = document.getElementById("existingThingsSummary");
                    existingEl.parentNode.removeChild(existingEl);
                }

                //var str_to_form = "Name: " +topPickedObject.userObject.displayName+ "<br> Provider: Ajuntament de Barcelona <br><br>";

                var prom = QueryBCNCat(topPickedObject.userObject.displayName);

                Promise.all([prom]).then(function(values){


                    
                    var str_to_form = "Name: " +values[0].componentName+"<br> Description: "+values[0].componentDesc+ "<br> Last Update: "+values[0].lastUpdateTimeMessage+"<br> Provider: Ajuntament de Barcelona <br><br>";
                    //str_to_form = clone(str_to_form+"Last Seen: "+values[0].feeds[0]["created_at"]+"<br><br>");

                    document.getElementById('selectSensor').disabled = false;

                    for(i=0;i<values[0].sensorLastObservations.length;i++){

                        if(values[0].sensorLastObservations[i].found == true){


                           

                            str_to_form = clone(str_to_form+"Sensor: " +values[0].sensorLastObservations[i].sensor+"<br> Description: "+values[0].sensorLastObservations[i].sensorType+"<br> Last Value: "+values[0].sensorLastObservations[i].value+" "+values[0].sensorLastObservations[i].unit+"<br> Last Update: "+values[0].sensorLastObservations[i].timestamp+"<br><br>");
                        
                            //document.getElementById('selectSensor').options[i] = document.createElement('option').option.values[0].data.sensors[i];
                            //document.getElementById('selectSensor').options[i].text = values[0].data.sensors[i].id;
                            var newContent=document.createElement('option');
                            newContent.id = "sensorOption"+i;

                            newContent.yAxisLabelType = values[0].sensorLastObservations[i].sensorType;
                            newContent.yAxisLabelUnit = values[0].sensorLastObservations[i].unit;

                            newContent.value = values[0].sensorLastObservations[i].sensor;
                            newContent.innerHTML = values[0].sensorLastObservations[i].sensor+" ("+values[0].sensorLastObservations[i].sensorType+") ";
                            document.getElementById('selectSensor').appendChild(newContent);

                        }

                        
                    }


                    var newContent = document.createElement("div");
                    newContent.id = "existingThingsSummary";
                    newContent.className ="thingsSummary";
                    newContent.innerHTML = str_to_form;
                    
                    document.getElementById('thingsSummaryID').appendChild(newContent);

                    /*
                    document.getElementById('startTime').disabled = false;
                    document.getElementById('endTime').disabled = false;
                    document.getElementById('spanTimeNum').disabled = true;
                    document.getElementById('spanTimeUnit').disabled = true;
                    document.getElementById('selectSensor').disabled = false;
                    document.getElementById('submitStartEndDateTime').disabled = false;
                    document.getElementById('submitStartEndDateTimeTimeSeries').disabled = false;
                    */
                
                });

            } else if (topPickedObject.userObject.providerID === "opensensemap"){
                
                
                if(!!(document.getElementById("existingThingsSummary"))){
                    var existingEl = document.getElementById("existingThingsSummary");
                    existingEl.parentNode.removeChild(existingEl);
                }
            
                var sensorListArr = topPickedObject.userObject.sensorList;
                var StrToForm = "Device Name: " +topPickedObject.userObject.displayName+ "<br> Provider: openSenseMap <br>";
                var StrToAdd = "";
                for(i=0;i<sensorListArr.length;i++){
                    for(var keys in sensorListArr[i]){

                        if(!(keys === "sensorID")){
                            StrToAdd = clone(StrToAdd+""+keys+": " +sensorListArr[i][keys]+ "<br>");
                        }
                    
                    }
                    var newContent=document.createElement('option');
                    newContent.id = "sensorOption"+i;
                    newContent.yAxisLabelType = sensorListArr[i].Type;
                    newContent.yAxisLabelUnit = sensorListArr[i].Unit;
                    newContent.value = sensorListArr[i]["sensorID"];
                    newContent.innerHTML = sensorListArr[i].Type;
                    document.getElementById('selectSensor').appendChild(newContent);

                    StrToAdd = clone(StrToAdd+"<br>");
                }

                StrToForm = clone(StrToForm+StrToAdd);
                var newContent = document.createElement("div");
                    newContent.className ="thingsSummary";
                    newContent.id = "existingThingsSummary";
                    newContent.innerHTML = StrToForm;
                    document.getElementById('thingsSummaryID').appendChild(newContent);

                    /*
                    document.getElementById('startTime').disabled = false;
                    document.getElementById('endTime').disabled = false;
                    document.getElementById('selectSensor').disabled = false;
                    document.getElementById('submitStartEndDateTime').disabled = false;
                    document.getElementById('spanTimeNum').disabled = false;
                    document.getElementById('spanTimeUnit').disabled = false;
                    document.getElementById('submitStartEndDateTimeTimeSeries').disabled = false;
                    */

            }  else if (topPickedObject.userObject.providerID === "smartcitizen"){


                if(!!(document.getElementById("existingThingsSummary"))){
                    var existingEl = document.getElementById("existingThingsSummary");
                    existingEl.parentNode.removeChild(existingEl);
                }

                var prom = QuerySCFeed(topPickedObject.userObject.channelID);

                Promise.all([prom]).then(function(values){

                    
                    var str_to_form = "Device Name: " +topPickedObject.userObject.displayName+ "<br> Last Seen: "+new Date(topPickedObject.userObject.lastSeen).toUTCString()+"<br> Provider: Smart Citizen <br><br>";
                    //str_to_form = clone(str_to_form+"Last Seen: "+values[0].feeds[0]["created_at"]+"<br><br>");

                    document.getElementById('selectSensor').disabled = false;

                    for(i=0;i<values[0].data.sensors.length;i++){

                        str_to_form = clone(str_to_form+"Sensor: " +values[0].data.sensors[i].name+"<br> Description: "+values[0].data.sensors[i].description+"<br> Last Value: "+values[0].data.sensors[i].value+" "+values[0].data.sensors[i].unit+"<br><br>");
                        
                        //document.getElementById('selectSensor').options[i] = document.createElement('option').option.values[0].data.sensors[i];
                        //document.getElementById('selectSensor').options[i].text = values[0].data.sensors[i].id;
                        var newContent=document.createElement('option');
                        newContent.id = "sensorOption"+i;
                        
                        newContent.value = values[0].data.sensors[i].id;
                        newContent.innerHTML = values[0].data.sensors[i].name;
                        document.getElementById('selectSensor').appendChild(newContent);
                    }


                    var newContent = document.createElement("div");
                    newContent.id = "existingThingsSummary";
                    newContent.className ="thingsSummary";
                    newContent.innerHTML = str_to_form;
                    
                    document.getElementById('thingsSummaryID').appendChild(newContent);

                    /*
                    document.getElementById('startTime').disabled = false;
                    document.getElementById('endTime').disabled = false;
                    document.getElementById('spanTimeNum').disabled = true;
                    document.getElementById('spanTimeUnit').disabled = true;
                    document.getElementById('selectSensor').disabled = false;
                    document.getElementById('submitStartEndDateTime').disabled = false;
                    document.getElementById('submitStartEndDateTimeTimeSeries').disabled = false;
                    */
                
                });

            } else if (topPickedObject.userObject.providerID === "netherlandssmartemission"){

                if(!!(document.getElementById("existingThingsSummary"))){
                    var existingEl = document.getElementById("existingThingsSummary");
                    existingEl.parentNode.removeChild(existingEl);
                }

                var prom = QueryNethSEFeed(topPickedObject.userObject.stationID);

                Promise.all([prom]).then(function(values){
    
                    var str_to_form = "Station Name: " +topPickedObject.userObject.displayName+ "<br> Last Seen: "+new Date(values[0].feeds[0]["created_at"]).toUTCString()+"<br> Provider: Netherlands Smart Emission Project <br><br>";
                    //str_to_form = clone(str_to_form+"Last Seen: "+values[0].feeds[0]["created_at"]+"<br><br>");

                    for(i=0;i<values[0].length;i++){

                        str_to_form = clone(str_to_form+"Sensor: " +values[0][i].id+"<br>Description: "+values[0][i].label+"<br> Last Value: "+values[0][i].lastValue.value+" "+values[0][i].uom+"<br><br>");
                    
                    }

                    var newContent = document.createElement("div");
                    newContent.id = "existingThingsSummary";
                    newContent.className ="thingsSummary";
                    newContent.innerHTML = str_to_form;
                    
                    document.getElementById('thingsSummaryID').appendChild(newContent);

                    /*
                    document.getElementById('startTime').disabled = true;
                    document.getElementById('endTime').disabled = true;
                    document.getElementById('selectSensor').disabled = true;
                    document.getElementById('submitStartEndDateTime').disabled = true;
                    document.getElementById('spanTimeNum').disabled = true;
                    document.getElementById('spanTimeUnit').disabled = true;
                    document.getElementById('submitStartEndDateTimeTimeSeries').disabled = true;
                    */
                
                });

            } else if (topPickedObject.userObject.providerID === "openaq"){
                
                if(!!(document.getElementById("existingThingsSummary"))){
                    var existingEl = document.getElementById("existingThingsSummary");
                    existingEl.parentNode.removeChild(existingEl);
                }

                var str_to_form = "Observer Name: " +topPickedObject.userObject.displayName+ "<br> Provider: OpenAQ <br><br>";

                for(i=0;i<topPickedObject.userObject.measurements.length;i++){

                    str_to_form = clone(str_to_form+"Sensor: " +topPickedObject.userObject.measurements[i].parameter+"<br>Value: "
                    +topPickedObject.userObject.measurements[i].value+" "+topPickedObject.userObject.measurements[i].unit+"<br>Last Update: "
                    +new Date (topPickedObject.userObject.measurements[i].lastUpdated).toUTCString()+"<br>Averaging Period: "+topPickedObject.userObject.measurements[i].averagingPeriod.value+
                    " "+topPickedObject.userObject.measurements[i].averagingPeriod.unit+
                    "<br> Source: " +topPickedObject.userObject.measurements[i].sourceName+"<br><br>");

                    
                    var newContent=document.createElement('option');
                    newContent.id = "sensorOption"+i;
                    newContent.value = topPickedObject.userObject.measurements[i].parameter;
                    newContent.innerHTML = topPickedObject.userObject.measurements[i].parameter;
                    document.getElementById('selectSensor').appendChild(newContent);
                
                }

                var newContent = document.createElement("div");
                newContent.id = "existingThingsSummary";
                newContent.className ="thingsSummary";
                newContent.innerHTML = str_to_form;
                document.getElementById('thingsSummaryID').appendChild(newContent);

            
                /*
                    document.getElementById('startTime').disabled = false;
                    document.getElementById('endTime').disabled = false;
                    document.getElementById('selectSensor').disabled = false;
                    document.getElementById('submitStartEndDateTime').disabled = false;
                    document.getElementById('spanTimeNum').disabled = true;
                    document.getElementById('spanTimeUnit').disabled = true;
                    document.getElementById('submitStartEndDateTimeTimeSeries').disabled = false;
                */
            
            } else if (topPickedObject.userObject.providerID === "thingspeak"){

                if(!!(document.getElementById("existingThingsSummary"))){
                    var existingEl = document.getElementById("existingThingsSummary");
                    existingEl.parentNode.removeChild(existingEl);
                }

                var prom = QueryTSFeed(topPickedObject.userObject.channelID);

                Promise.all([prom]).then(function(values){

                    var filt_res={};
                    var str_to_form = "Device Name: " +topPickedObject.userObject.displayName+ "<br> Provider: ThingSpeak <br><br>";
                    i=1;
                    for(var keys in values[0].channel){
                        
                        if(keys.toLowerCase().indexOf("field")>=0){
                            //console.log(values[0].channel);
                            str_to_form = clone(str_to_form+"Sensor: "+values[0].channel[keys]+"<br> Last Value: "+new Date(values[0].feeds[values[0].feeds.length-1][keys]).toUTCString()+"<br><br>");

                            
                            var newContent=document.createElement('option');
                            newContent.id = "sensorOption"+i;
                            newContent.value = i;
                            newContent.innerHTML = values[0].channel[keys];
                            document.getElementById('selectSensor').appendChild(newContent);
                            i++;
                        }
                    }

                    str_to_form = clone(str_to_form+"Last Seen: "+new Date (values[0].feeds[values[0].feeds.length-1]["created_at"])).toUTCString();

                    var newContent = document.createElement("div");
                    newContent.id = "existingThingsSummary";
                    newContent.className ="thingsSummary";
                    newContent.innerHTML = str_to_form;
                    
                    document.getElementById('thingsSummaryID').appendChild(newContent);

                    /*
                    document.getElementById('startTime').disabled = false;
                    document.getElementById('endTime').disabled = false;
                    document.getElementById('selectSensor').disabled = false;
                    document.getElementById('submitStartEndDateTime').disabled = false;
                    document.getElementById('spanTimeNum').disabled = true;
                    document.getElementById('spanTimeUnit').disabled = true;
                    document.getElementById('submitStartEndDateTimeTimeSeries').disabled = false;
                    */
                    
                        
                        
                
                });


            } else if (topPickedObject.userObject.providerID === "smartsantander"){
            
            // incomplete

                if(!!(document.getElementById("existingThingsSummary"))){
                    var existingEl = document.getElementById("existingThingsSummary");
                    existingEl.parentNode.removeChild(existingEl);
                }

                    var newContent = document.createElement("div");
                    newContent.id = "existingThingsSummary";
                    
                    newContent.innerHTML = topPickedObject.userObject.content;
                    document.getElementById('thingsSummaryID').appendChild(newContent);
                

            } else if (topPickedObject.userObject.providerID === "safecast"){
                
                if(!!(document.getElementById("existingThingsSummary"))){
                    var existingEl = document.getElementById("existingThingsSummary");
                    existingEl.parentNode.removeChild(existingEl);
                }


                if(topPickedObject.userObject.placemarkType == "iothings"){
                    var sensorListArr = topPickedObject.userObject.sensorList;
                    var StrToForm = "Device Name: " +topPickedObject.userObject.displayName+ "<br> Provider: Safecast <br>";
                    var StrToAdd = "";

                    for(i=0;i<sensorListArr.length;i++){
                        for(var keys in sensorListArr[i]){

                            if((keys == "name") || (keys == "Last Seen") || (keys == "Last Value") || (keys == "unit")){
                                StrToAdd = clone(StrToAdd+""+keys+": " +sensorListArr[i][keys]+ "<br>");
                            }
                        
                        }
                        var newContent=document.createElement('option');
                        newContent.id = "sensorOption"+i;
                        newContent.yAxisLabelType = sensorListArr[i].name;
                        newContent.yAxisLabelUnit = sensorListArr[i].unit;
                        newContent.value = sensorListArr[i].name;
                        newContent.innerHTML = sensorListArr[i].name;
                        document.getElementById('selectSensor').appendChild(newContent);

                        StrToAdd = clone(StrToAdd+"<br>");
                    }

                    StrToForm = clone(StrToForm+StrToAdd);
                    var newContent = document.createElement("div");
                        newContent.className ="thingsSummary";
                        newContent.id = "existingThingsSummary";
                        newContent.innerHTML = StrToForm;
                        document.getElementById('thingsSummaryID').appendChild(newContent);

                        /*
                        document.getElementById('spanTimeNum').disabled = true;
                        document.getElementById('spanTimeUnit').disabled = true;
                        document.getElementById('startTime').disabled = false;
                        document.getElementById('endTime').disabled = false;
                        document.getElementById('selectSensor').disabled = false;
                        document.getElementById('submitStartEndDateTime').disabled = false;
                        */

                } else if (topPickedObject.userObject.placemarkType == "mobiothings"){

                    var StrToForm = "ID: " +topPickedObject.userObject.displayName+ " (nuclear radiation) <br> Provider: Safecast <br>"
                                    +"Counts per minute value: "+topPickedObject.userObject.cpmValue+" <br>"
                                    +"Sievert value: "+topPickedObject.userObject.sievert+" "+topPickedObject.userObject.sievertUnit+" <br>"
                                    +"Time: "+topPickedObject.userObject.time+"<br>";

                                    var newContent = document.createElement("div");
                                    newContent.className ="thingsSummary";
                                    newContent.id = "existingThingsSummary";
                                    newContent.innerHTML = StrToForm;
                                    document.getElementById('thingsSummaryID').appendChild(newContent);
                    

                }

                

                
            } else if (topPickedObject.userObject.providerID === "engfloodenv"){


                if(!!(document.getElementById("existingThingsSummary"))){
                    var existingEl = document.getElementById("existingThingsSummary");
                    existingEl.parentNode.removeChild(existingEl);
                }

                if(!!(topPickedObject.userObject.measures)){

                    var measurementArr = topPickedObject.userObject.measures;

                    var measurementPromArr = [];

                    var str_to_form = "Name: " +topPickedObject.userObject.displayName+ "<br> Provider: UK Environment Agency <br><br>";

                    for(j=0;j<measurementArr.length;j++){
                        var measurementUrl = measurementArr[j]["@id"];

                        var prom = QueryEngFloodEnv(measurementUrl);

                        measurementPromArr.push(prom);

                    }

                    Promise.all(measurementPromArr).then(function(values){


                        for(i=0;i<values.length;i++){

                           
                            str_to_form = str_to_form+"Sensor: " +values[i].items.parameterName+"<br> Description: "+values[i].items.qualifier;
                            
                            if((!!(values[i].items.latestReading.value)) || (!!(values[i].items.latestReading.dateTime))){
                                str_to_form = str_to_form+"<br> Last Value: "+values[i].items.latestReading.value+" "+values[i].items.unitName+
                                "<br> Last Seen: "+new Date(values[i].items.latestReading.dateTime).toUTCString()+"<br><br>";
                            } else {
                                str_to_form = str_to_form+"<br> Sensor status: OFFLINE <br><br>";
                            }
                            
                            //document.getElementById('selectSensor').options[i] = document.createElement('option').option.values[0].data.sensors[i];
                            //document.getElementById('selectSensor').options[i].text = values[0].data.sensors[i].id;
                           
                        }


                        var newContent = document.createElement("div");
                        newContent.id = "existingThingsSummary";
                        newContent.className ="thingsSummary";
                        newContent.innerHTML = str_to_form;
                        
                        document.getElementById('thingsSummaryID').appendChild(newContent);

                        /*
                        document.getElementById('startTime').disabled = true;
                        document.getElementById('endTime').disabled = true;
                        document.getElementById('selectSensor').disabled = true;
                        document.getElementById('submitStartEndDateTime').disabled = true;
                        document.getElementById('spanTimeNum').disabled = true;
                        document.getElementById('spanTimeUnit').disabled = true;
                        document.getElementById('submitStartEndDateTimeTimeSeries').disabled = true;
                        */
                    
                    });


                }

                

            } else {

                

                if(!!(document.getElementById("existingThingsSummary"))){
                    var existingEl = document.getElementById("existingThingsSummary");
                    existingEl.parentNode.removeChild(existingEl);
                }

                if(document.getElementById("StationaryOrMobile").options[(document.getElementById("StationaryOrMobile")).selectedIndex].value == "S")
                {
                    //future development
                    document.getElementById('spanTimeNum').disabled = true;
                    document.getElementById('spanTimeUnit').disabled = true;
                    document.getElementById('selectSensor').disabled = true;
                    document.getElementById('submitStartEndDateTime').disabled = true;

                    var newContent = document.createElement("div");
                    newContent.id = "existingThingsSummary";
                    newContent.className ="thingsSummary";
                    newContent.innerHTML= "Device Name: " +topPickedObject.userObject.displayName+ "<br> Last Seen: " +topPickedObject.userObject.lastSeen;
                    document.getElementById('thingsSummaryID').appendChild(newContent);

                }

               

                    //document.getElementById('startTime').disabled = true;
                    //document.getElementById('endTime').disabled = true;
                    
            }

       }

      
        //pickResult.style.cursor = "pointer";
        //pickResult.style.left = o.pageX;
        //pickResult.style.top = o.pageY;
        //console.log("left/x pos: " +pickResult.style.left);
        //console.log("top/y pos: " +pickResult.style.top);

      

        //console.log("event handler x,y: " +x+","+y);
        //console.log("mouse location x,y: " +o.pageX+ "," +o.pageY);
        //console.log("element location offset x,y: " +offset(pickResult).top+ "," +offset(pickResult).left);
        //console.log("element location getPosition x,y: " +getPosition(pickResult).x+ "," +getPosition(pickResult).y);
        //pickResult.style.cursor = "pointer";
           
            
        } else {

            /*
            if(!typeof previousUserObj == 'undefined'){
                var placemarkToRemove = markerCluster.getPlacemarkOfIndex(previousUserObj);
    
                var placemarkToAdd = $.extend(true,{},placemarkToRemove);

                placemarkToAdd.placemarkAttributes.imageSource = "images/thing_node.png";
                placemarkToAdd.placemarkAttributes.imageScale = 0.22;
        
                markerCluster.modifyPlacemarkInIndex(placemarkToAdd,placemarkToRemove,previousUserObj);
        
                wwd.redraw();
        
                delete previousUserObj;
           }
           */

          

            
            

            if(!!(document.getElementById("existingThingsSummary"))){
                var existingEl = document.getElementById("existingThingsSummary");
                existingEl.parentNode.removeChild(existingEl);
            }

            //var pickResult = document.getElementById("pick-result");
            //pickResult.textContent = "Nothing Selected";
            //pickResult.cursor = "default";

            if(document.getElementById("StationaryOrMobile").options[(document.getElementById("StationaryOrMobile")).selectedIndex].value == "S")
            {
                removeOptions(document.getElementById("selectSensor"));
                document.getElementById('startTime').disabled = true;
                document.getElementById('endTime').disabled = true;
                document.getElementById('spanTimeNum').disabled = true;
                document.getElementById('spanTimeUnit').disabled = true;
                document.getElementById('submitStartEndDateTime').disabled = true;
            } 
            else if(document.getElementById("StationaryOrMobile").options[(document.getElementById("StationaryOrMobile")).selectedIndex].value == "M")
            {
                document.getElementById('spanTimeNum').disabled = true;
                document.getElementById('spanTimeUnit').disabled = true;
            }

            
        }
    };

    /*
    var handleMove = function(o) {
        // The input argument is either an Event or a TapRecognizer. Both have the same properties for determining
        // the mouse or tap location.
        var x = o.clientX,
            y = o.clientY;
    
        // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
        // relative to the upper left corner of the canvas rather than the upper left corner of the page.
        var pickList = wwd.pick(wwd.canvasCoordinates(x, y));
    
        // Report the top picked object, if any.
        var topPickedObject = pickList.topPickedObject();

        if (topPickedObject) {
            hoverResult.cursor = "pointer";
        } else {
            hoverResult.cursor = "context-menu";
        }
        };
*/

    // Listen for mouse moves and touch taps.
    wwd.addEventListener("click", handlePick);
    //wwd.addEventListener("mousemove", handleMove);

    var tapRecognizer = new WorldWind.TapRecognizer(wwd, handlePick);
    //window.addEventListener("scroll", updatePosition, false);
    //window.addEventListener("resize", updatePosition, false);
    
}


//get eye view distance from the globe, output in meters.
function getViewingRange(){

    
    return wwd.navigator.range;
    
}


async function CreateWWDIoTRadialMark(ThingsLocationArr){
    
    placemarkLayerAllDev.removeAllRenderables();

    allThingsDB = clone(ThingsLocationArr);
    // Set placemark attributes.
    var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
    // Wrap the canvas created above in an ImageSource object to specify it as the placemarkAttributes image source.
    //placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);
    //placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/thing_node.png";
    placemarkAttributes.imageSource = "images/thing_node.png";
    // Define the pivot point for the placemark at the center of its image source.
    placemarkAttributes.imageOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.5);
    placemarkAttributes.imageScale = 0.22;
    
    placemarkAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
    placemarkAttributes.outlineColor = WorldWind.Color.BLUE;
    placemarkAttributes.applyLighting = true;

    // Set placemark highlight attributes.
    // Note that the normal attributes are specified as the default highlight attributes so that all properties
    // are identical except the image scale. You could instead vary the color, image, or other property
    // to control the highlight representation.
    var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
    highlightAttributes.imageScale = 0.3;
    //highlightAttributes.imageSource = WorldWind.configuration.baseUrl + "images/thing_node_highlight.png";
    highlightAttributes.imageSource = "images/thing_node_highlight.png";
    
    highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 1);
    highlightAttributes.applyLighting = false;

    placemarkLayerAllDev = new WorldWind.RenderableLayer("Things Placemark");

    for(i=0;i<ThingsLocationArr.length;i++){
        
        /*
        var lat = parseFloat(ThingsLocationArr[i].latitude);
        var lon = parseFloat(ThingsLocationArr[i].longitude);

        // Create the placemark with the attributes defined above.
        var placemarkPosition = new WorldWind.Position(lat, lon, 0);
        var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
        // Draw placemark at altitude defined above.
        placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
        // Assign highlight attributes for the placemark.
        placemark.highlightAttributes = highlightAttributes;
        placemark.displayName = ThingsLocationArr[i].name;
        placemark.providerID = ThingsLocationArr[i].providerID;

        placemark.latitude = allThingsDB[i].latitude;
        placemark.longitude = allThingsDB[i].longitude;
        */

        if(ThingsLocationArr[i].providerID === "smartsantander"){


            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);
    
            // Create the placemark with the attributes defined above.
            var placemarkPosition = new WorldWind.Position(lat, lon, 0);
            var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
            // Draw placemark at altitude defined above.
            placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
            // Assign highlight attributes for the placemark.
            placemark.highlightAttributes = highlightAttributes;
            placemark.displayName = ThingsLocationArr[i].name;
            placemark.providerID = ThingsLocationArr[i].providerID;
    
            placemark.latitude = allThingsDB[i].latitude;
            placemark.longitude = allThingsDB[i].longitude;

            placemark.content = ThingsLocationArr[i].content;

            placemark.thingTag = ThingsLocationArr[i].thingTag;

            // Create the renderable layer for placemarks.
            placemark.placemarkType = "iothings";
            
            // Add the placemark to the layer.
            placemarkLayerAllDev.addRenderable(placemark);

        } else if(ThingsLocationArr[i].providerID === "opensensemap"){

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);
    
            // Create the placemark with the attributes defined above.
            var placemarkPosition = new WorldWind.Position(lat, lon, 0);
            var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
            // Draw placemark at altitude defined above.
            placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
            // Assign highlight attributes for the placemark.
            placemark.highlightAttributes = highlightAttributes;
            placemark.displayName = ThingsLocationArr[i].name;
            placemark.providerID = ThingsLocationArr[i].providerID;
    
            placemark.latitude = allThingsDB[i].latitude;
            placemark.longitude = allThingsDB[i].longitude;

            placemark.sensorList = ThingsLocationArr[i].sensorList;
            placemark.channelID = ThingsLocationArr[i].channelID;

            placemark.thingTag = ThingsLocationArr[i].thingTag;

             // Create the renderable layer for placemarks.
             placemark.placemarkType = "iothings";
            
             // Add the placemark to the layer.
             placemarkLayerAllDev.addRenderable(placemark);
            
        } else if(ThingsLocationArr[i].providerID === "openaq"){

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);
    
            // Create the placemark with the attributes defined above.
            var placemarkPosition = new WorldWind.Position(lat, lon, 0);
            var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
            // Draw placemark at altitude defined above.
            placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
            // Assign highlight attributes for the placemark.
            placemark.highlightAttributes = highlightAttributes;
            placemark.displayName = ThingsLocationArr[i].name;
            placemark.providerID = ThingsLocationArr[i].providerID;

            placemark.thingTag = ThingsLocationArr[i].thingTag;
    
            placemark.latitude = allThingsDB[i].latitude;
            placemark.longitude = allThingsDB[i].longitude;

            placemark.measurements = ThingsLocationArr[i].measurements;

             // Create the renderable layer for placemarks.
             placemark.placemarkType = "iothings";
            
             // Add the placemark to the layer.
             placemarkLayerAllDev.addRenderable(placemark);
            
        } else if(ThingsLocationArr[i].providerID === "netherlandssmartemission"){

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);
    
            // Create the placemark with the attributes defined above.
            var placemarkPosition = new WorldWind.Position(lat, lon, 0);
            var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
            // Draw placemark at altitude defined above.
            placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
            // Assign highlight attributes for the placemark.
            placemark.highlightAttributes = highlightAttributes;
            placemark.displayName = ThingsLocationArr[i].name;
            placemark.providerID = ThingsLocationArr[i].providerID;
    
            placemark.latitude = allThingsDB[i].latitude;
            placemark.longitude = allThingsDB[i].longitude;

            placemark.thingTag = ThingsLocationArr[i].thingTag;

            placemark.stationID = ThingsLocationArr[i].stationID;
            placemark.lastSeen = ThingsLocationArr[i].lastSeen;

             // Create the renderable layer for placemarks.
             placemark.placemarkType = "iothings";
            
             // Add the placemark to the layer.
             placemarkLayerAllDev.addRenderable(placemark);

        } else if(ThingsLocationArr[i].providerID === "thingspeak"){

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);
    
            // Create the placemark with the attributes defined above.
            var placemarkPosition = new WorldWind.Position(lat, lon, 0);
            var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
            // Draw placemark at altitude defined above.
            placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
            // Assign highlight attributes for the placemark.
            placemark.highlightAttributes = highlightAttributes;
            placemark.displayName = ThingsLocationArr[i].name;
            placemark.providerID = ThingsLocationArr[i].providerID;
    
            placemark.latitude = allThingsDB[i].latitude;
            placemark.longitude = allThingsDB[i].longitude;

            placemark.channelID = ThingsLocationArr[i].id;
            placemark.description = ThingsLocationArr[i].description;

            placemark.thingTag = ThingsLocationArr[i].thingTag;

             // Create the renderable layer for placemarks.
             placemark.placemarkType = "iothings";
            
             // Add the placemark to the layer.
             placemarkLayerAllDev.addRenderable(placemark);
            
        } else if(ThingsLocationArr[i].providerID === "smartcitizen"){

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);
    
            // Create the placemark with the attributes defined above.
            var placemarkPosition = new WorldWind.Position(lat, lon, 0);
            var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
            // Draw placemark at altitude defined above.
            placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
            // Assign highlight attributes for the placemark.
            placemark.highlightAttributes = highlightAttributes;
            placemark.displayName = ThingsLocationArr[i].name;
            placemark.providerID = ThingsLocationArr[i].providerID;

            placemark.thingTag = ThingsLocationArr[i].thingTag;
    
            placemark.latitude = allThingsDB[i].latitude;
            placemark.longitude = allThingsDB[i].longitude;

            placemark.channelID = ThingsLocationArr[i].deviceID;
            placemark.lastSeen = ThingsLocationArr[i].lastSeen;

             // Create the renderable layer for placemarks.
             placemark.placemarkType = "iothings";
            
             // Add the placemark to the layer.
             placemarkLayerAllDev.addRenderable(placemark);
            
        } else if(ThingsLocationArr[i].providerID === "safecast"){

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);
    
            // Create the placemark with the attributes defined above.
            var placemarkPosition = new WorldWind.Position(lat, lon, 0);
            var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
            // Draw placemark at altitude defined above.
            placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
            // Assign highlight attributes for the placemark.
            placemark.highlightAttributes = highlightAttributes;
            placemark.displayName = ThingsLocationArr[i].name;
            placemark.providerID = ThingsLocationArr[i].providerID;
    
            placemark.latitude = allThingsDB[i].latitude;
            placemark.longitude = allThingsDB[i].longitude;

            placemark.sensorList = ThingsLocationArr[i].sensorList;

            placemark.thingTag = ThingsLocationArr[i].thingTag;

         
            placemark.placemarkType = "iothings";

             // Create the renderable layer for placemarks.
            
            
             // Add the placemark to the layer.
             placemarkLayerAllDev.addRenderable(placemark);
            
        } else {

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);
    
            // Create the placemark with the attributes defined above.
            var placemarkPosition = new WorldWind.Position(lat, lon, 0);
            var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
            // Draw placemark at altitude defined above.
            placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
            // Assign highlight attributes for the placemark.
            placemark.highlightAttributes = highlightAttributes;
            placemark.displayName = ThingsLocationArr[i].name;
            placemark.providerID = ThingsLocationArr[i].providerID;
    
            placemark.latitude = allThingsDB[i].latitude;
            placemark.longitude = allThingsDB[i].longitude;

            placemark.lastSeen = ThingsLocationArr[i].lastSeen;

             // Create the renderable layer for placemarks.
             placemark.placemarkType = "iothings";
            
             // Add the placemark to the layer.
             placemarkLayerAllDev.addRenderable(placemark);

        }

    }

    // Add the placemarks layer to the WorldWindow's layer list.
    wwd.addLayer(placemarkLayerAllDev);
    wwd.redraw();
    // Now set up to handle highlighting.
    var highlightController = new WorldWind.HighlightController(wwd);

    EnableSearchByLocation();

}


async function CreateClusteredThings(ThingsLocationArr){

    if(!(typeof markerCluster == 'undefined')){
       // markerCluster.hideAllLevels();
       // markerCluster.hideAllSingle();
        markerCluster.updateGlobe(wwd);
        markerCluster.removeClusterLayer();
        wwd = markerCluster.getGlobe();
        wwd.redraw();
        
        delete markerCluster;
    }

   // if (typeof markerCluster == 'undefined') {
        markerCluster = new MarkerCluster(wwd, {
                maxLevel: 7,
                smooth: false,
                name: "All Things Cluster",
                maxCount: 3000,
                //clusterSources: null,
                //attributeColor: null,
                radius: 45
        });
   // }
    //delete wwd;
    wwd = markerCluster.getGlobe();
    //placemarkLayerAllDev.removeAllRenderables();

    allThingsDB = clone(ThingsLocationArr);
    // Set placemark attributes.
    var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
    // Wrap the canvas created above in an ImageSource object to specify it as the placemarkAttributes image source.
    //placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);
    //placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/thing_node.png";
    placemarkAttributes.imageSource = "images/thing_node.png";
    // Define the pivot point for the placemark at the center of its image source.
    placemarkAttributes.imageOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.5);
    placemarkAttributes.imageScale = 0.22;
    
    placemarkAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
    placemarkAttributes.outlineColor = WorldWind.Color.BLUE;
    placemarkAttributes.applyLighting = true;

    // Set placemark highlight attributes.
    // Note that the normal attributes are specified as the default highlight attributes so that all properties
    // are identical except the image scale. You could instead vary the color, image, or other property
    // to control the highlight representation.
    var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
    highlightAttributes.imageScale = 0.3;
    //highlightAttributes.imageSource = WorldWind.configuration.baseUrl + "images/thing_node_highlight.png";
    highlightAttributes.imageSource = "images/thing_node_highlight.png";
    
    highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 1);
    highlightAttributes.applyLighting = false;

    //placemarkLayerAllDev = new WorldWind.RenderableLayer("Things Placemark");

    for(i=0;i<ThingsLocationArr.length;i++){
        
        
        /*
        // Create the placemark with the attributes defined above.
        var placemarkPosition = new WorldWind.Position(lat, lon, 0);
        var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
        // Draw placemark at altitude defined above.
        placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
        // Assign highlight attributes for the placemark.
        placemark.highlightAttributes = highlightAttributes;
        placemark.displayName = ThingsLocationArr[i].name;
        placemark.providerID = ThingsLocationArr[i].providerID;

        placemark.latitude = allThingsDB[i].latitude;
        placemark.longitude = allThingsDB[i].longitude;
        

        if(ThingsLocationArr[i].providerID === "smartsantander"){
            placemark.content = ThingsLocationArr[i].content;
        } else if(ThingsLocationArr[i].providerID === "opensensemap"){
            placemark.sensorList = ThingsLocationArr[i].sensorList;
            placemark.channelID = ThingsLocationArr[i].channelID;
            
        } else if(ThingsLocationArr[i].providerID === "openaq"){
            placemark.measurements = ThingsLocationArr[i].measurements;
            
        } else if(ThingsLocationArr[i].providerID === "netherlandssmartemission"){
            placemark.stationID = ThingsLocationArr[i].stationID;
            placemark.lastSeen = ThingsLocationArr[i].lastSeen;
        } else if(ThingsLocationArr[i].providerID === "thingspeak"){
            placemark.channelID = ThingsLocationArr[i].id;
            placemark.description = ThingsLocationArr[i].description;
            
        } else if(ThingsLocationArr[i].providerID === "smartcitizen"){
            placemark.channelID = ThingsLocationArr[i].deviceID;
            placemark.lastSeen = ThingsLocationArr[i].lastSeen;
            
        } else {
            placemark.lastSeen = ThingsLocationArr[i].lastSeen;
        }

        placemark.placemarkType = "iothings";
        */
        // Create the renderable layer for placemarks.
        

        
        

        if(ThingsLocationArr[i].providerID === "smartsantander"){

            var params = {};

            params.placemarkAttributes = placemarkAttributes;
            params.highlightAttributes = highlightAttributes;

            params.info = {};

            params.info.displayName = ThingsLocationArr[i].name;
            params.info.providerID = ThingsLocationArr[i].providerID;

            params.info.latitude = ThingsLocationArr[i].latitude;
            params.info.longitude = ThingsLocationArr[i].longitude;

            params.info.content = ThingsLocationArr[i].content;

            params.info.thingTag = ThingsLocationArr[i].thingTag;

            params.info.placemarkType = "iothings";

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);

            var placemark = markerCluster.newInitPlacemark([lat, lon], placemarkAttributes,{
                imageSource: "images/thing_node.png", 
                label: ""
            }, params);

            markerCluster.addToPlacemarkArray(placemark);

        } else if(ThingsLocationArr[i].providerID === "opensensemap"){

            var params = {};

            params.placemarkAttributes = placemarkAttributes;
            params.highlightAttributes = highlightAttributes;

            params.info = {};

            params.info.displayName = ThingsLocationArr[i].name;
            params.info.providerID = ThingsLocationArr[i].providerID;

            params.info.latitude = ThingsLocationArr[i].latitude;
            params.info.longitude = ThingsLocationArr[i].longitude;

            params.info.thingTag = ThingsLocationArr[i].thingTag;

            params.info.sensorList = ThingsLocationArr[i].sensorList;
            params.info.channelID = ThingsLocationArr[i].channelID;

            params.info.placemarkType = "iothings";


            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);

            var placemark = markerCluster.newInitPlacemark([lat, lon], placemarkAttributes,{
                imageSource: "images/thing_node.png", 
                label: ""
            }, params);

            markerCluster.addToPlacemarkArray(placemark);
            
        } else if(ThingsLocationArr[i].providerID === "openaq"){

            var params = {};

            params.placemarkAttributes = placemarkAttributes;
            params.highlightAttributes = highlightAttributes;

            params.info = {};

            params.info.displayName = ThingsLocationArr[i].name;
            params.info.providerID = ThingsLocationArr[i].providerID;

            params.info.thingTag = ThingsLocationArr[i].thingTag;

            params.info.latitude = ThingsLocationArr[i].latitude;
            params.info.longitude = ThingsLocationArr[i].longitude;

            params.info.measurements = ThingsLocationArr[i].measurements;

            params.info.placemarkType = "iothings";


            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);

            var placemark = markerCluster.newInitPlacemark([lat, lon], placemarkAttributes,{
                imageSource: "images/thing_node.png", 
                label: ""
            }, params);

            markerCluster.addToPlacemarkArray(placemark);
            
        } else if(ThingsLocationArr[i].providerID === "netherlandssmartemission"){

            var params = {};

            params.placemarkAttributes = placemarkAttributes;
            params.highlightAttributes = highlightAttributes;

            params.info = {};

            params.info.displayName = ThingsLocationArr[i].name;
            params.info.providerID = ThingsLocationArr[i].providerID;

            params.info.latitude = ThingsLocationArr[i].latitude;
            params.info.longitude = ThingsLocationArr[i].longitude;

            params.info.thingTag = ThingsLocationArr[i].thingTag;

            params.info.stationID = ThingsLocationArr[i].stationID;
            params.info.lastSeen = ThingsLocationArr[i].lastSeen;

            params.info.placemarkType = "iothings";


            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);

            var placemark = markerCluster.newInitPlacemark([lat, lon], placemarkAttributes,{
                imageSource: "images/thing_node.png", 
                label: ""
            }, params);

            markerCluster.addToPlacemarkArray(placemark);
            
        } else if(ThingsLocationArr[i].providerID === "thingspeak"){

            var params = {};

            params.placemarkAttributes = placemarkAttributes;
            params.highlightAttributes = highlightAttributes;

            params.info = {};

            params.info.displayName = ThingsLocationArr[i].name;
            params.info.providerID = ThingsLocationArr[i].providerID;

            params.info.thingTag = ThingsLocationArr[i].thingTag;

            params.info.latitude = ThingsLocationArr[i].latitude;
            params.info.longitude = ThingsLocationArr[i].longitude;

            params.info.channelID = ThingsLocationArr[i].id;
            params.info.description = ThingsLocationArr[i].description;

            params.info.placemarkType = "iothings";

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);

            var placemark = markerCluster.newInitPlacemark([lat, lon], placemarkAttributes,{
                imageSource: "images/thing_node.png", 
                label: ""
            }, params);

            markerCluster.addToPlacemarkArray(placemark);
            
        } else if(ThingsLocationArr[i].providerID === "smartcitizen"){

            var params = {};

            params.placemarkAttributes = placemarkAttributes;
            params.highlightAttributes = highlightAttributes;

            params.info = {};

            params.info.displayName = ThingsLocationArr[i].name;
            params.info.providerID = ThingsLocationArr[i].providerID;

            params.info.latitude = ThingsLocationArr[i].latitude;
            params.info.longitude = ThingsLocationArr[i].longitude;

            params.info.channelID = ThingsLocationArr[i].deviceID;
            params.info.lastSeen = ThingsLocationArr[i].lastSeen;

            params.info.thingTag = ThingsLocationArr[i].thingTag;

            params.info.placemarkType = "iothings";

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);

            var placemark = markerCluster.newInitPlacemark([lat, lon], placemarkAttributes,{
                imageSource: "images/thing_node.png", 
                label: ""
            }, params);

            markerCluster.addToPlacemarkArray(placemark);
            
        }  else if(ThingsLocationArr[i].providerID === "safecast"){


            var params = {};

            params.placemarkAttributes = placemarkAttributes;
            params.highlightAttributes = highlightAttributes;

            params.info = {};

            params.info.displayName = ThingsLocationArr[i].name;
            params.info.providerID = ThingsLocationArr[i].providerID;

            params.info.latitude = ThingsLocationArr[i].latitude;
            params.info.longitude = ThingsLocationArr[i].longitude;

            params.info.lastSeen = ThingsLocationArr[i].lastSeen;

            params.info.thingTag = ThingsLocationArr[i].thingTag;

            params.info.sensorList = ThingsLocationArr[i].sensorList;
           
            params.info.placemarkType = "iothings";

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);

            var placemark = markerCluster.newInitPlacemark([lat, lon], placemarkAttributes,{
                imageSource: "images/thing_node.png", 
                label: ""
            }, params);

            markerCluster.addToPlacemarkArray(placemark);

        }   else if(ThingsLocationArr[i].providerID === "bcncat"){
            
            var params = {};

            params.placemarkAttributes = placemarkAttributes;
            params.highlightAttributes = highlightAttributes;

            params.info = {};

            params.info.displayName = ThingsLocationArr[i].name;
            params.info.providerID = ThingsLocationArr[i].providerID;

            params.info.latitude = ThingsLocationArr[i].latitude;
            params.info.longitude = ThingsLocationArr[i].longitude;
            
            params.info.placemarkType = "iothings";

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);

            var placemark = markerCluster.newInitPlacemark([lat, lon], placemarkAttributes,{
                imageSource: "images/thing_node.png", 
                label: ""
            }, params);

            markerCluster.addToPlacemarkArray(placemark);
           
        } else if(ThingsLocationArr[i].providerID === "engfloodenv"){

            var params = {};

            params.placemarkAttributes = placemarkAttributes;
            params.highlightAttributes = highlightAttributes;

            params.info = ThingsLocationArr[i];

            params.info.displayName = ThingsLocationArr[i].name;

            delete params.info.name;
            //params.info.providerID = ThingsLocationArr[i].providerID;

            //params.info.latitude = ThingsLocationArr[i].latitude;
            //params.info.longitude = ThingsLocationArr[i].longitude;

            //params.info.thingTag = ThingsLocationArr[i].thingTag;

            params.info.placemarkType = "iothings";

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);

            var placemark = markerCluster.newInitPlacemark([lat, lon], placemarkAttributes,{
                imageSource: "images/thing_node.png", 
                label: ""
            }, params);

            markerCluster.addToPlacemarkArray(placemark);
            
        }
        /*} 
        else {

            var params = {};

            params.placemarkAttributes = placemarkAttributes;
            params.highlightAttributes = highlightAttributes;

            params.info = {};

            params.info.displayName = ThingsLocationArr[i].name;
            params.info.providerID = ThingsLocationArr[i].providerID;

            params.info.latitude = allThingsDB[i].latitude;
            params.info.longitude = allThingsDB[i].longitude;

            params.info.lastSeen = ThingsLocationArr[i].lastSeen;
            params.info.placemarkType = "iothings";

            var lat = parseFloat(ThingsLocationArr[i].latitude);
            var lon = parseFloat(ThingsLocationArr[i].longitude);

            var placemark = markerCluster.newInitPlacemark([lat, lon], placemarkAttributes,{
                imageSource: "images/thing_node.png", 
                label: ""
            }, params);

            //exclude others for now
            //markerCluster.addToPlacemarkArray(placemark);
        }
        */

       

        //console.log(params);

        
        
        /*
       var placemarkPosition = new WorldWind.Position(lat, lon, 0);
       var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
       // Draw placemark at altitude defined above.
       placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
       */
       
       /*
        placemark.highlightAttributes = highlightAttributes;
        placemark.displayName = ThingsLocationArr[i].name;
        placemark.providerID = ThingsLocationArr[i].providerID;

        placemark.latitude = allThingsDB[i].latitude;
        placemark.longitude = allThingsDB[i].longitude;
        

        if(ThingsLocationArr[i].providerID === "smartsantander"){
            placemark.content = ThingsLocationArr[i].content;
        } else if(ThingsLocationArr[i].providerID === "opensensemap"){
            placemark.sensorList = ThingsLocationArr[i].sensorList;
            placemark.channelID = ThingsLocationArr[i].channelID;
            
        } else if(ThingsLocationArr[i].providerID === "openaq"){
            placemark.measurements = ThingsLocationArr[i].measurements;
            
        } else if(ThingsLocationArr[i].providerID === "netherlandssmartemission"){
            placemark.stationID = ThingsLocationArr[i].stationID;
            placemark.lastSeen = ThingsLocationArr[i].lastSeen;
        } else if(ThingsLocationArr[i].providerID === "thingspeak"){
            placemark.channelID = ThingsLocationArr[i].id;
            placemark.description = ThingsLocationArr[i].description;
            
        } else if(ThingsLocationArr[i].providerID === "smartcitizen"){
            placemark.channelID = ThingsLocationArr[i].deviceID;
            placemark.lastSeen = ThingsLocationArr[i].lastSeen;
            
        } else {
            placemark.lastSeen = ThingsLocationArr[i].lastSeen;
        }

        placemark.placemarkType = "iothings";
        
        */
        //console.log(placemark);
       
        
        // Add the placemark to the layer.
        //placemarkLayerAllDev.addRenderable(placemark);
       

    }

    // Add the placemarks layer to the WorldWindow's layer list.
    //wwd.addLayer(placemarkLayerAllDev);

    markerCluster.generateClusterFromPlacemarksArray();
    wwd = markerCluster.getGlobe();
    //wwd.redraw();
    // Now set up to handle highlighting.
    var highlightController = new WorldWind.HighlightController(wwd);

    EnableSearchByLocation();

}


  async function SearchLocationWithArrEl(query,arrayEl) {    
    
    var self = this;
    self.geocoder = new WorldWind.NominatimGeocoder();
   // self.goToAnimator = new WorldWind.GoToAnimator(wwd);

      var queryString = query;
      if (queryString) {
        var latitude, longitude;
        if (queryString.match(WorldWind.WWUtil.latLonRegex)) {
          var tokens = queryString.split(",");
          latitude = parseFloat(tokens[0]);
          longitude = parseFloat(tokens[1]);
          arrayEl.latitude = latitude;
          arrayEl.longitude = longitude;
          
          //self.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
        } else {
          self.geocoder.lookup(queryString, function(geocoder, result) {
            if (result.length > 0) {
              latitude = parseFloat(result[0].lat);
              longitude = parseFloat(result[0].lon);
              arrayEl.latitude = latitude;
              arrayEl.longitude = longitude;
              //self.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
            }
          });
        }
      }

      return arrayEl;
  }

  async function SearchLocation(query) {    
    
    var latlonJS={};
    var self = this;
    self.geocoder = new WorldWind.NominatimGeocoder();
   // self.goToAnimator = new WorldWind.GoToAnimator(wwd);

      var queryString = query;
      if (queryString) {
        var latitude, longitude;
        if (queryString.match(WorldWind.WWUtil.latLonRegex)) {
          var tokens = queryString.split(",");
          latitude = parseFloat(tokens[0]);
          longitude = parseFloat(tokens[1]);
          latlonJS.latitude = latitude;
          latlonJS.longitude = longitude;
          
          //self.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
        } else {
          self.geocoder.lookup(queryString, function(geocoder, result) {
            if (result.length > 0) {
              latitude = parseFloat(result[0].lat);
              longitude = parseFloat(result[0].lon);
              latlonJS.latitude = latitude;
              latlonJS.longitude = longitude;
              //self.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
            }
          });
        }
      }

      return latlonJS;
  }

  function GlobeMoveToLocation(query) {
    var self = this;
    self.geocoder = new WorldWind.NominatimGeocoder();
    self.goToAnimator = new WorldWind.GoToAnimator(wwd);

      var queryString = query;
      if (queryString) {
        var latitude, longitude;
        if (queryString.match(WorldWind.WWUtil.latLonRegex)) {
          var tokens = queryString.split(",");
          latitude = parseFloat(tokens[0]);
          longitude = parseFloat(tokens[1]);
          self.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
        } else {
          self.geocoder.lookup(queryString, function(geocoder, result) {
            if (result.length > 0) {
                latitude = parseFloat(result[0].lat);
                longitude = parseFloat(result[0].lon);
              self.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
            }
          });
        }
      }
  }

function offset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

function getPosition(el) {
    var xPos = 0;
    var yPos = 0;
   
    while (el) {
      if (el.tagName == "BODY") {
        // deal with browser quirks with body/window/document and page scroll
        var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
        var yScroll = el.scrollTop || document.documentElement.scrollTop;
   
        xPos += (el.offsetLeft - xScroll + el.clientLeft);
        yPos += (el.offsetTop - yScroll + el.clientTop);
      } else {
        // for all other non-BODY elements
        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
      }
   
      el = el.offsetParent;
    }
    return {
      x: xPos,
      y: yPos
    };
  }

  function GlobeMoveToLocationAndZoom(query) {
    var self = this;
    self.geocoder = new WorldWind.NominatimGeocoder();
    self.goToAnimator = new WorldWind.GoToAnimator(wwd);

      var queryString = query;
      if (queryString) {
        var latitude, longitude;
        if (queryString.match(WorldWind.WWUtil.latLonRegex)) {
          var tokens = queryString.split(",");
          latitude = parseFloat(tokens[0]);
          longitude = parseFloat(tokens[1]);
          self.goToAnimator.goTo(new WorldWind.Location(latitude, longitude),IncrementalGlobeSetViewRange(100000));
          
        } else {
          self.geocoder.lookup(queryString, function(geocoder, result) {
            if (result.length > 0) {
              latitude = parseFloat(result[0].lat);
              longitude = parseFloat(result[0].lon);
              self.goToAnimator.goTo(new WorldWind.Location(latitude, longitude),IncrementalGlobeSetViewRange(100000));
             
            }
          });
        }
       
     }
  }

 

  function IncrementalGlobeSetViewRange(range_arr){

      //for(i=0;i<range_arr.length;i++){
    wwd.navigator.range = range_arr;
        
    var selectedStOrMobDiv = document.getElementById("StationaryOrMobile");
    var selectedVal = selectedStOrMobDiv.options[selectedStOrMobDiv.selectedIndex].value;

    if(selectedVal == 'M'){
        if(typeof markerClusterMobTh !== "undefined"){
            markerClusterMobTh.updateGlobe(wwd);
            markerClusterMobTh.handleClusterZoom(range_arr,true);
            wwd = markerClusterMobTh.getGlobe();
        }
    } else if (selectedVal == "S"){
        if(typeof markerCluster !== "undefined"){
            markerCluster.updateGlobe(wwd);
            markerCluster.handleClusterZoom(range_arr,true);
            wwd = markerCluster.getGlobe();
        }
    }

    wwd.redraw();
      
  }

 function SearchButtonTrig(){
     var queryIn = document.getElementById("searchText").value;
     GlobeMoveToLocationAndZoom(queryIn);
 }

 
 function MobThOnSelectedGlobeLookAtLoc(){

    var userid = document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value

    var chosenLoc = {
        "latitude": mobThToVisList[userid].latitude,
        "longitude" : mobThToVisList[userid].longitude           
   };


    wwd.navigator.lookAtLocation = chosenLoc;
    wwd.navigator.range = 2e5;

    markerClusterMobTh.updateGlobe(wwd);
    markerClusterMobTh.handleClusterZoom(2e5,true);
    wwd = markerClusterMobTh.getGlobe();

    wwd.redraw();
 }


/*
 async function OrigQuerySCHistoricalData(){

	// example: var url = "https://api.smartcitizen.me/v0/devices/3773/readings?sensor_id=14&rollup=1h&from=2018-02-05&to=2018-04-18";

    
	var channelID = topPickedObject.userObject.channelID;

	var params = {
        "sensor_id" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
        "rollup": document.getElementById("spanTimeNum").value+document.getElementById("spanTimeUnit").options[(document.getElementById("spanTimeUnit")).selectedIndex].value,
        "from": document.getElementById("startTime").value,
        "to": document.getElementById("endTime").value
	}

	var url = "https://api.smartcitizen.me/v0/devices/"+channelID+"/readings"+toHtmlQuery_(params);

    

    var url = "https://api.smartcitizen.me/v0/devices/3773/readings?sensor_id=14&rollup=1h&from=2018-02-05&to=2018-04-18";

	var prom = fetch(url).then(function(response) {
		if (!response.ok) {
			EnableSearchButton();
			throw Error(response.statusText);
		}
		return response.json()});

		var prom2 = Promise.all([prom]).then(function(values){
			return values[0];
        });
        
        return prom2;
}
*/

function TrigHistorical(){

    if(document.getElementById("StationaryOrMobile").options[(document.getElementById("StationaryOrMobile")).selectedIndex].value == "S"){
        
        if(topPickedObject.userObject.providerID === "smartcitizen"){
            //var promSC = QuerySCHistoricalData();
    
            //Promise.all([promSC]).then(function(values){
                //copyToPass = clone(values[0]);
                //console.log(copyToPass);
                /*
                var params = {
                    "providerID" : "smartcitizen",
                    "channelID": 3773,
                    "sensor_id" : 14,//document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
                    "rollup": "4h",//document.getElementById("spanTimeNum").value+document.getElementById("spanTimeUnit").options[(document.getElementById("spanTimeUnit")).selectedIndex].value,
                    "from": "2018-02-05",//document.getElementById("startTime").value.getUTCFullYear()+"-"+document.getElementById("startTime").value.getUTCMonth()+"-"+document.getElementById("startTime").value.getUTCDate(),
                    "to": "2018-04-18"//document.getElementById("endTime").value.getUTCFullYear()+"-"+document.getElementById("endTime").value.getUTCMonth()+"-"+document.getElementById("endTime").value.getUTCDate()
                }
                window.open("http://gaiota.ddns.net/visualization.html"+toHtmlQuery_(params));
                */
               var params = {
                    "providerID" : "smartcitizen",
                    "channelID": topPickedObject.userObject.channelID,
                    "sensor_id" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
                    "rollup": document.getElementById("spanTimeNum").value+document.getElementById("spanTimeUnit").options[(document.getElementById("spanTimeUnit")).selectedIndex].value,
                    "from":  new Date(document.getElementById("startTime").value).getUTCFullYear()+"-"+new Date(document.getElementById("startTime").value).getUTCMonth()+"-"+ new Date(document.getElementById("startTime").value).getUTCDate(),
                    "to":  new Date(document.getElementById("endTime").value).getUTCFullYear()+"-"+ new Date(document.getElementById("endTime").value).getUTCMonth()+"-"+new Date(document.getElementById("endTime").value).getUTCDate()
                }
                window.open("/visualization.html"+toHtmlQuery_(params));
            //});
            } else
        if (topPickedObject.userObject.providerID === "opensensemap"){
            /*
            var params = {
                "providerID" : "opensensemap",
                "yAxisLabel" : "unit",
                "channelID" : "5a95a44cbc2d4100193f7b40",
                "sensorID" :"5a95a44cbc2d4100193f7b46",//document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
                "from-date": "2018-02-19T17:21:07.090Z",//document.getElementById("startTime").value.toISOString(),
                "to-date": "2018-04-19T17:21:07.090Z"//document.getElementById("endTime").value.toISOString()
            }
            window.open("http://gaiota.ddns.net/visualization.html"+toHtmlQuery_(params));
            */
                var params = {
                    "providerID" : "opensensemap",
                    "yAxisLabelType" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].yAxisLabelType,
                    "yAxisLabelUnit" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].yAxisLabelUnit,
                    "channelID" : topPickedObject.userObject.channelID,
                    "sensorID" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
                    "from-date": new Date(document.getElementById("startTime").value).toISOString(),
                    "to-date": new Date(document.getElementById("endTime").value).toISOString()
                }
                window.open("/visualization.html"+toHtmlQuery_(params));
        }  else if (topPickedObject.userObject.providerID === "openaq"){
            /*
            var params = {
                "providerID" : "openaq",
                "parameter": "pm25",
                "location" : "Sveavägen",//document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
                "date-from": "2018-02-19T17:21:07.090Z",//document.getElementById("startTime").value.toISOString(),
                "date-to": "2018-04-19T17:21:07.090Z"//document.getElementById("endTime").value.toISOString()
            }
            window.open("http://gaiota.ddns.net/visualization.html"+toHtmlQuery_(params));
            */
    
            
            var params = {
                "providerID" : "openaq",
                "parameter": document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
                "location" : topPickedObject.userObject.displayName,//document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
                "date_from": new Date(document.getElementById("startTime").value).toISOString(),
                "limit": "10000",
                "date_to": new Date(document.getElementById("endTime").value).toISOString()
            }
            window.open("/visualization.html"+toHtmlQuery_(params));
            
        //} else if (topPickedObject.userObject.providerID === "thingspeak"){
         } else if (topPickedObject.userObject.providerID === "thingspeak"){
    
                var params={
                    "providerID" : "thingspeak",
                    "channelID" : topPickedObject.userObject.channelID,
                    "results": "8000",
                    "fieldID": document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
                    "start": new Date(document.getElementById("startTime").value).toISOString(),
                    "end" : new Date(document.getElementById("endTime").value).toISOString()
                }
    
                window.open("/visualization.html"+toHtmlQuery_(params));
            } else if (topPickedObject.userObject.providerID === "safecast"){
    
                var params={
                    "providerID" : "safecast",
                    "sensorUnitID": document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
                    "deviceID" : topPickedObject.userObject.displayName,
                    //"start": new Date(document.getElementById("startTime").value).toISOString(),
                    //"end" : new Date(document.getElementById("endTime").value).toISOString()
                }
    
                window.open("/visualization.html"+toHtmlQuery_(params));
            } else if (topPickedObject.userObject.providerID === "bcncat"){
    
                var params={
                    "providerID" : "bcncat",
                    "sensorUnitID": document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
                    "deviceID" : topPickedObject.userObject.displayName,
                    "start": new Date(document.getElementById("startTime").value).toISOString(),
                    "end" : new Date(document.getElementById("endTime").value).toISOString(),
                    "yAxisLabelType" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].yAxisLabelType,
                    "yAxisLabelUnit" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].yAxisLabelUnit,
                }
    
                window.open("/visualization.html"+toHtmlQuery_(params));
            } 
            
            else {
                window.alert("Historical data is not made available by the IoT data provider of the selected devices/sensors");
            }

    }

    
        /*
        var params = {
            "providerID" : "thingspeak",
            "channelID" : "408176",
            "fieldID" :"2",//document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
            "start": "2018-02-19T17:21:07.090Z",//document.getElementById("startTime").value.toISOString(),
            "end": "2018-04-19T17:21:07.090Z"//document.getElementById("endTime").value.toISOString()
        }
        window.open("http://gaiota.ddns.net/visualization.html"+toHtmlQuery_(params));
        */
    //}else {
            //window.alert("Historical data is not made available by the providers");
    //}
}


function TrigHistoricalTimeSeries(){

    wwd.removeLayer(placemarkLayerAllDev);
    wwd.removeLayer(placemarkLayerDevByLoc);
    wwd.removeLayer(placemarkLayerDevByKeywords);
    wwd.removeLayer(placemarkLayerDevByRadius);

    if(document.getElementById("StationaryOrMobile").options[(document.getElementById("StationaryOrMobile")).selectedIndex].value == "S"){
        
        if(!(typeof markerCluster == 'undefined')){
            //markerCluster.hideAllLevels();
            //markerCluster.hideAllSingle();
            markerCluster.updateGlobe(wwd);
            markerCluster.removeClusterLayer();
            wwd = markerCluster.getGlobe();
            //wwd.removeLayer("All Things Cluster");
            wwd.redraw();
        }
        //wwd.redraw();
        
        var prom = GenerateHistoricalTimeSeries();

        Promise.all([prom]).then(function(values){
            console.log("Historical Data Acquired, proceeding...");
        });
    } else if (document.getElementById("StationaryOrMobile").options[(document.getElementById("StationaryOrMobile")).selectedIndex].value == "M") {
        

        if(document.getElementById("selectSensor").options.length == 0){
            VisualizeMobileThings();
        } else {

            if(typeof markerClusterMobTh !== 'undefined'){
                //markerClusterMobTh.hideAllLevels();
                //markerClusterMobTh.hideAllSingle();
                markerClusterMobTh.updateGlobe(wwd);
                markerClusterMobTh.removeClusterLayer();
                wwd = markerClusterMobTh.getGlobe();
                //wwd.removeLayer("Mob Things Cluster");
                wwd.redraw();
                
            }
           // wwd.redraw();

            var selectedID = document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value;
        
            var selectedMobThList = mobThToVisList[selectedID];
            var chosenLoc = {
                    "latitude": mobThToVisList[selectedID].latitude,
                     "longitude" : mobThToVisList[selectedID].longitude           
               };
    
            DrawPolygonMobThTimeSeries(selectedMobThList.data,chosenLoc);

        }
        
       
    }

    
}


async function GenerateHistoricalTimeSeries(){

    //obtain data first

    if(topPickedObject.userObject.providerID === "smartcitizen"){
        //var promSC = QuerySCHistoricalData();

        //Promise.all([promSC]).then(function(values){
            //copyToPass = clone(values[0]);
            //console.log(copyToPass);
            /*
            var params = {
                "providerID" : "smartcitizen",
                "channelID": 3773,
                "sensor_id" : 14,//document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
                "rollup": "4h",//document.getElementById("spanTimeNum").value+document.getElementById("spanTimeUnit").options[(document.getElementById("spanTimeUnit")).selectedIndex].value,
                "from": "2018-02-05",//document.getElementById("startTime").value.getUTCFullYear()+"-"+document.getElementById("startTime").value.getUTCMonth()+"-"+document.getElementById("startTime").value.getUTCDate(),
                "to": "2018-04-18"//document.getElementById("endTime").value.getUTCFullYear()+"-"+document.getElementById("endTime").value.getUTCMonth()+"-"+document.getElementById("endTime").value.getUTCDate()
            }
            window.open("http://gaiota.ddns.net/visualization.html"+toHtmlQuery_(params));
            */
           
                
            var channelID =  topPickedObject.userObject.channelID;

            var params = {
                "sensor_id" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
                "rollup": document.getElementById("spanTimeNum").value+document.getElementById("spanTimeUnit").options[(document.getElementById("spanTimeUnit")).selectedIndex].value,
                "from":  new Date(document.getElementById("startTime").value).getUTCFullYear()+"-"+new Date(document.getElementById("startTime").value).getUTCMonth()+"-"+ new Date(document.getElementById("startTime").value).getUTCDate(),
                "to":  new Date(document.getElementById("endTime").value).getUTCFullYear()+"-"+ new Date(document.getElementById("endTime").value).getUTCMonth()+"-"+new Date(document.getElementById("endTime").value).getUTCDate()
            }
            
            var prom = QuerySCHistoricalData(channelID, params);

            Promise.all([prom]).then(function(values){
                console.log(values[0]);

                if(values[0].readings.length == 0){
                    window.alert("No Historical Data available. Please choose different time frame or different sensors/devices");
                } else {
                    var data_arr = values[0].readings;
                    var lat = topPickedObject.userObject.latitude;
                    var lon = topPickedObject.userObject.longitude;
                    DrawPolygonTimeSeries(parseFloat(lat),parseFloat(lon),data_arr,true,{});
                }

            });

        //});
        } else
    if (topPickedObject.userObject.providerID === "opensensemap"){
        /*
        var params = {
            "providerID" : "opensensemap",
            "yAxisLabel" : "unit",
            "channelID" : "5a95a44cbc2d4100193f7b40",
            "sensorID" :"5a95a44cbc2d4100193f7b46",//document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
            "from-date": "2018-02-19T17:21:07.090Z",//document.getElementById("startTime").value.toISOString(),
            "to-date": "2018-04-19T17:21:07.090Z"//document.getElementById("endTime").value.toISOString()
        }
        window.open("http://gaiota.ddns.net/visualization.html"+toHtmlQuery_(params));
        */

            var channelID = topPickedObject.userObject.channelID;
            var sensorID = document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value;
            var params = {
                //"yAxisLabelType" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].yAxisLabelType,
                //"yAxisLabelUnit" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].yAxisLabelUnit,
               
                
                "from-date": new Date(document.getElementById("startTime").value).toISOString(),
                "to-date": new Date(document.getElementById("endTime").value).toISOString()
            }

            var prom = QueryOSMHistoricalData(channelID, sensorID, params);

            Promise.all([prom]).then(function(values){


                var valArr=[];

                if(values[0].length === 0){
                    var prom2 = QueryOSMHistoricalData(channelID,sensorID,{});

                    Promise.all([prom2]).then(function(values){
                        console.log(values[0]);
                        for(i=0;i<values[0].length;i++){
                            valArr.push([values[0][i].createdAt, values[0][i].value]);
                        }
                      
                        
                        var lat = topPickedObject.userObject.latitude;
                        var lon = topPickedObject.userObject.longitude;
                        DrawPolygonTimeSeries(parseFloat(lat),parseFloat(lon),valArr,true,{});

                    });

                } else {
                    console.log(values[0]);
                    for(i=0;i<values[0].length;i++){
                        valArr.push([values[0][i].createdAt, values[0][i].value]);
                    }

                   
                    var lat = topPickedObject.userObject.latitude;
                    var lon = topPickedObject.userObject.longitude;
                    DrawPolygonTimeSeries(parseFloat(lat),parseFloat(lon),valArr,true,{});
                  

                }


               
            });
           
    }  else if (topPickedObject.userObject.providerID === "openaq"){
        /*
        var params = {
            "providerID" : "openaq",
            "parameter": "pm25",
            "location" : "Sveavägen",//document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
            "date-from": "2018-02-19T17:21:07.090Z",//document.getElementById("startTime").value.toISOString(),
            "date-to": "2018-04-19T17:21:07.090Z"//document.getElementById("endTime").value.toISOString()
        }
        window.open("http://gaiota.ddns.net/visualization.html"+toHtmlQuery_(params));
        */

        
        var params = {
            "parameter": document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
            "location" : topPickedObject.userObject.displayName,//document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
            "date_from": new Date(document.getElementById("startTime").value).toISOString(),
            "limit": "10000",
            "date_to": new Date(document.getElementById("endTime").value).toISOString()
        }

        var prom = QueryOAQHistoricalData(params);

        Promise.all([prom]).then(function(values){
            

            var valArr=[];
            for(i=0;i<values[0].results.length;i++){
                valArr.push([values[0].results[i].date.utc, values[0].results[i].value]);
            }

            var lat = topPickedObject.userObject.latitude;
            var lon = topPickedObject.userObject.longitude;
            DrawPolygonTimeSeries(parseFloat(lat),parseFloat(lon),valArr,true,{"unit":values[0].results[0].unit});
          

        });
        
    //} else if (topPickedObject.userObject.providerID === "thingspeak"){
     } else if (topPickedObject.userObject.providerID === "thingspeak"){

        var channelID = topPickedObject.userObject.channelID;
        var fieldID = document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value;

            var params = {
                "results": "8000",
                "start": new Date(document.getElementById("startTime").value).toISOString(),
                "end" : new Date(document.getElementById("endTime").value).toISOString()
            }
           
           var prom = QueryTSHistoricalData(channelID,fieldID,params);

           Promise.all([prom]).then(function(values){
            
            var valArr=[];
                    
            if(values[0].feeds.length === 0){
                var prom2 = QueryTSHistoricalData(channelID, fieldID, {});

                Promise.all([prom2]).then(function(values){
                    console.log(values[0].feeds);
                    for(i=0;i<values[0].feeds.length;i++){
                        valArr.push([values[0].feeds[i]["created_at"], values[0].feeds[i]["field"+fieldID]]);
                       
                    }

                    var lat = topPickedObject.userObject.latitude;
                    var lon = topPickedObject.userObject.longitude;
                    DrawPolygonTimeSeries(parseFloat(lat),parseFloat(lon),valArr,true,{});

                });
            } else {
                for(i=0;i<values[0].feeds.length;i++){
                    valArr.push([values[0].feeds[i]["created_at"], values[0].feeds[i]["field"+fieldID]]);
                  
                }

                var lat = topPickedObject.userObject.latitude;
                var lon = topPickedObject.userObject.longitude;
                DrawPolygonTimeSeries(parseFloat(lat),parseFloat(lon),valArr,true,{});

            }

           });


        } else if (topPickedObject.userObject.providerID === "bcncat"){

            //var sensorID = data.sensorUnitID;
            var deviceID = topPickedObject.userObject.displayName;
            var sensorID = document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value;
                

                //var yAxisLabelType = document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].yAxisLabelType;
                var yAxisLabelUnit = document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].yAxisLabelUnit;
                var start_time = new Date(document.getElementById("startTime").value).toISOString();
                var end_time = new Date(document.getElementById("endTime").value).toISOString();

                var lat = topPickedObject.userObject.latitude;
                var lon = topPickedObject.userObject.longitude;
               

                var prom = QueryBCNCatHistoricalData(deviceID,sensorID);
                //yAxisLabel = val["sensor_key"]
                Promise.all([prom]).then(function(values){

                    if(new Date(start_time).getTime()>values[0].fromTime){

                    } else {
                        delete start_time;
                        start_time = new Date(values[0].fromTime).toISOString();
                    }
    
                    if(new Date(end_time).getTime()<values[0].toTime){
    
                    } else {
                        delete end_time;
                        end_time = new Date(values[0].toTime).toISOString();
                    }

                    var measurementArr = values[0].events;
                    var measurementToPlot = [];
                    for(j=0;j<measurementArr.length;j++){

                        if(measurementArr[j].time>=new Date(start_time).getTime() && measurementArr[j].time<=new Date(end_time).getTime()){
                            measurementToPlot.push([new Date(measurementArr[j].time).toISOString(),measurementArr[j].value])
                        }

                    }

                    DrawPolygonTimeSeries(parseFloat(lat),parseFloat(lon),measurementToPlot,false,{"unit":yAxisLabelUnit});

                   
                });

        }  else {
            window.alert("Time series not available since the IoT data provider of the selected devices/sensors doesn't provide historical data");
        }
        
}

function FetchDataToPass(){
    return clone(copyToPass);
}

function removeOptions(selectbox)
{
    var i;
    if(selectbox.options.length>0){
        for(i = selectbox.options.length - 1 ; i >= 0 ; i--)
        {
            selectbox.remove(i);
        }
        
    }
    
}

function TrigSearchByCountryAndDraw(){

    DisableSearchByLocation();
    DisableReturnAllDevices();

    var prom = SearchByCountryAndDraw();

    Promise.all([prom]).then(function(values){

        EnableSearchByLocation();
        EnableReturnAllDevices();
    });


}

function TrigSearchByCityAndDraw(){

    DisableSearchByLocation();
    DisableReturnAllDevices();

    var prom = SearchByCityAndDraw();

    Promise.all([prom]).then(function(values){

        EnableSearchByLocation();
        EnableReturnAllDevices();
    });
}

function TrigReturnAllDevices(){

    DisableSearchByLocation();
    DisableReturnAllDevices();

    wwd.removeLayer(placemarkLayerAllDev);

    wwd.removeLayer(placemarkLayerDevByLoc);
    wwd.removeLayer(placemarkLayerDevByKeywords);
    wwd.removeLayer(placemarkLayerDevByRadius);

    //wwd.addLayer(placemarkLayerAllDev);
    if(document.getElementById("StationaryOrMobile").options[(document.getElementById("StationaryOrMobile")).selectedIndex].value == "S"){

        if(!(typeof markerCluster == 'undefined')){
           // markerCluster.hideAllLevels();
           // markerCluster.hideAllSingle();
           markerCluster.updateGlobe(wwd);
           markerCluster.addClusterLayer();
           wwd = markerCluster.getGlobe();
           //wwd.removeLayer("All Things Cluster");
           wwd.redraw();
        }

    }
    /* 
    else if(document.getElementById("StationaryOrMobile").options[(document.getElementById("StationaryOrMobile")).selectedIndex].value == "M"){
        if(!(typeof markerClusterMobTh == 'undefined')){
            //markerClusterMobTh.hideAllLevels();
            //markerClusterMobTh.hideAllSingle();
            markerClusterMobTh.updateGlobe(wwd);
            markerClusterMobTh.addClusterLayer();
            wwd = markerClusterMobTh.getGlobe();
           // wwd.removeLayer("Mob Things Cluster");
            wwd.redraw();
        }
    }
    */
    

    //wwd.redraw();

        EnableSearchByLocation();
        EnableReturnAllDevices();
    
}


async function SearchByCountryAndDraw(){

    wwd.removeLayer(placemarkLayerAllDev);
    wwd.removeLayer(placemarkLayerDevByLoc);
    wwd.removeLayer(placemarkLayerDevByKeywords);
    wwd.removeLayer(placemarkLayerDevByRadius);

    if(!(typeof markerCluster == 'undefined')){
       // markerCluster.hideAllLevels();
       // markerCluster.hideAllSingle();
       markerCluster.updateGlobe(wwd);
       markerCluster.removeClusterLayer();
       wwd = markerCluster.getGlobe();
       //wwd.removeLayer("All Things Cluster");
       wwd.redraw();
    }

     placemarkLayerDevByLoc.removeAllRenderables();
      // Set placemark attributes.
      var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
      // Wrap the canvas created above in an ImageSource object to specify it as the placemarkAttributes image source.
      //placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);
      //placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/thing_node.png";
      placemarkAttributes.imageSource = "images/thing_node.png";
      // Define the pivot point for the placemark at the center of its image source.
      placemarkAttributes.imageOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.5);
      placemarkAttributes.imageScale = 0.22;
      //placemarkAttributes.imageColor = WorldWind.Color.WHITE;
      placemarkAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
      placemarkAttributes.outlineColor = WorldWind.Color.BLUE;
      placemarkAttributes.applyLighting = true;
  
      // Set placemark highlight attributes.
      // Note that the normal attributes are specified as the default highlight attributes so that all properties
      // are identical except the image scale. You could instead vary the color, image, or other property
      // to control the highlight representation.
      var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
      highlightAttributes.imageScale = 0.3;
      //highlightAttributes.imageSource = WorldWind.configuration.baseUrl + "images/thing_node_highlight.png";
      highlightAttributes.imageSource = "images/thing_node_highlight.png";
      
      highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 1);
      highlightAttributes.applyLighting = false;
  
      placemarkLayerDevByLoc = new WorldWind.RenderableLayer("Filtered Placemarks");

          // Create the renderable layer for placemarks.
          
          
          // Add the placemark to the layer.
         
          //placemarkLayer.addRenderable(placemark);
  
      
  
      // Add the placemarks layer to the WorldWindow's layer list.
     
      // Now set up to handle highlighting.
      var highlightController = new WorldWind.HighlightController(wwd);
    
    
    var queryLocBy = document.getElementById("selectByCountry").options[document.getElementById("selectByCountry").selectedIndex].value;
    
            for(i=0;i<allThingsDB.length;i++){
                if(!!(allThingsDB[i].country)){
                   // console.log(countrycodeJS);
                    //console.log(allThingsDB[i].country);
                    //console.log(queryLocBy);
                    //console.log(countrycodeJS[(allThingsDB[i].country.toLowerCase())]);

                    if(allThingsDB[i].country.toLowerCase() == queryLocBy.toLowerCase()){
                        
                        //console.log("matching name:" +allThingsDB[i].name);

                        var lat = parseFloat(allThingsDB[i].latitude);
                        var lon = parseFloat(allThingsDB[i].longitude);
                
                        // Create the placemark with the attributes defined above.
                        var placemarkPosition = new WorldWind.Position(lat, lon, 0);
                        var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
                        // Draw placemark at altitude defined above.
                        placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
                        // Assign highlight attributes for the placemark.
                        placemark.highlightAttributes = highlightAttributes;
                        placemark.displayName = allThingsDB[i].name;
                        placemark.providerID = allThingsDB[i].providerID;
                        placemark.latitude = allThingsDB[i].latitude;
                        placemark.longitude = allThingsDB[i].longitude;

                        placemark.thingTag = allThingsDB[i].thingTag;
                        
                
                        if(allThingsDB[i].providerID === "smartsantander"){
                            placemark.content = allThingsDB[i].content;
                        } else if(allThingsDB[i].providerID === "opensensemap"){
                            placemark.sensorList = allThingsDB[i].sensorList;
                            placemark.channelID = allThingsDB[i].channelID;
                            
                        } else if(allThingsDB[i].providerID === "openaq"){
                            placemark.measurements = allThingsDB[i].measurements;
                            
                        } else if(allThingsDB[i].providerID === "netherlandssmartemission"){
                            placemark.stationID = allThingsDB[i].stationID;
                            placemark.lastSeen = allThingsDB[i].lastSeen;
                        } else if(allThingsDB[i].providerID === "thingspeak"){
                            placemark.channelID = allThingsDB[i].id;
                            placemark.description = allThingsDB[i].description;
                            
                        } else if(allThingsDB[i].providerID === "smartcitizen"){
                            placemark.channelID = allThingsDB[i].deviceID;
                            placemark.lastSeen = allThingsDB[i].lastSeen;
                            
                        } else if(allThingsDB[i].providerID === "safecast"){
                           
                            placemark.sensorList = allThingsDB[i].sensorList;
                            placemark.lastSeen = allThingsDB[i].lastSeen;
                            
                        } else if(allThingsDB[i].providerID === "safecastlog"){
                           
                            
                            
                        } else {
                            placemark.lastSeen = allThingsDB[i].lastSeen;
                        }
                        placemark.placemarkType = "iothings";
                        placemarkLayerDevByLoc.addRenderable(placemark);
                    }
                    
                } else {

                }
            }

        console.log("Done including placemarks in a country");
        console.log(placemarkLayerDevByLoc);
        wwd.addLayer(placemarkLayerDevByLoc);

        wwd.redraw();
        var highlightController = new WorldWind.HighlightController(wwd);
       
}

async function SearchByCityAndDraw(){


    wwd.removeLayer(placemarkLayerAllDev);
    wwd.removeLayer(placemarkLayerDevByLoc);

    if(!(typeof markerCluster == 'undefined')){
        //markerCluster.hideAllLevels();
        //markerCluster.hideAllSingle();
        markerCluster.updateGlobe(wwd);
        markerCluster.removeClusterLayer();
        wwd = markerCluster.getGlobe();
       // wwd.removeLayer("All Things Cluster");
        wwd.redraw();
    }

    placemarkLayerDevByLoc.removeAllRenderables();
      // Set placemark attributes.
      var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
      // Wrap the canvas created above in an ImageSource object to specify it as the placemarkAttributes image source.
      //placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);
      //placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/thing_node.png";
      placemarkAttributes.imageSource = "images/thing_node.png";
      // Define the pivot point for the placemark at the center of its image source.
      placemarkAttributes.imageOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.5);
      placemarkAttributes.imageScale = 0.22;
      //placemarkAttributes.imageColor = WorldWind.Color.WHITE;
      placemarkAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
      placemarkAttributes.outlineColor = WorldWind.Color.BLUE;
      placemarkAttributes.applyLighting = true;
  
      // Set placemark highlight attributes.
      // Note that the normal attributes are specified as the default highlight attributes so that all properties
      // are identical except the image scale. You could instead vary the color, image, or other property
      // to control the highlight representation.
      var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
      highlightAttributes.imageScale = 0.3;
      //highlightAttributes.imageSource = WorldWind.configuration.baseUrl + "images/thing_node_highlight.png";
      highlightAttributes.imageSource = "images/thing_node_highlight.png";
      
      highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 1);
      highlightAttributes.applyLighting = false;
  
      placemarkLayerDevByLoc = new WorldWind.RenderableLayer("Filtered Placemarks");

          // Create the renderable layer for placemarks.
          
          
          // Add the placemark to the layer.
         
          //placemarkLayer.addRenderable(placemark);
  
      
  
      // Add the placemarks layer to the WorldWindow's layer list.
     
      // Now set up to handle highlighting.
      var highlightController = new WorldWind.HighlightController(wwd);

    
    var queryString = document.getElementById("searchByCity").value;

        for(i=0;i<allThingsDB.length;i++){
            if(allThingsDB[i].city){

                //this requires IE 12.0 and above
                if(allThingsDB[i].city.toLowerCase() == queryString.trim().toLowerCase() || queryString.trim().toLowerCase().indexOf(allThingsDB[i].city.toLowerCase()) !== -1){
                //if(allThingsDB[i].city.toLowerCase() == queryString.trim().toLowerCase()){    
                    var lat = parseFloat(allThingsDB[i].latitude);
                    var lon = parseFloat(allThingsDB[i].longitude);
            
                    // Create the placemark with the attributes defined above.
                    var placemarkPosition = new WorldWind.Position(lat, lon, 0);
                    var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
                    // Draw placemark at altitude defined above.
                    placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
                    // Assign highlight attributes for the placemark.
                    placemark.highlightAttributes = highlightAttributes;
                    placemark.displayName = allThingsDB[i].name;
                    placemark.providerID = allThingsDB[i].providerID;
                    placemark.latitude = allThingsDB[i].latitude;
                    placemark.longitude = allThingsDB[i].longitude;

                    placemark.thingTag = allThingsDB[i].thingTag;
                    
            
                    if(allThingsDB[i].providerID === "smartsantander"){
                        placemark.content = allThingsDB[i].content;
                    } else if(allThingsDB[i].providerID === "opensensemap"){
                        placemark.sensorList = allThingsDB[i].sensorList;
                        placemark.channelID = allThingsDB[i].channelID;
                        
                    } else if(allThingsDB[i].providerID === "openaq"){
                        placemark.measurements = allThingsDB[i].measurements;
                        
                    } else if(allThingsDB[i].providerID === "netherlandssmartemission"){
                        placemark.stationID = allThingsDB[i].stationID;
                        placemark.lastSeen = allThingsDB[i].lastSeen;
                    } else if(allThingsDB[i].providerID === "thingspeak"){
                        placemark.channelID = allThingsDB[i].id;
                        placemark.description = allThingsDB[i].description;
                        
                    } else if(allThingsDB[i].providerID === "smartcitizen"){
                        placemark.channelID = allThingsDB[i].deviceID;
                        placemark.lastSeen = allThingsDB[i].lastSeen;
                        
                    } else if(allThingsDB[i].providerID === "safecast"){
                           
                        placemark.sensorList = allThingsDB[i].sensorList;
                        placemark.lastSeen = allThingsDB[i].lastSeen;
                        
                    }  else if(allThingsDB[i].providerID === "bcncat"){
                       
                        
                        
                    } else {
                        placemark.lastSeen = allThingsDB[i].lastSeen;
                    }
                    placemark.placemarkType = "iothings";
                    placemarkLayerDevByLoc.addRenderable(placemark);
                }
                
            } else {
                
            }
        }

        wwd.addLayer(placemarkLayerDevByLoc);

        wwd.redraw();
        var highlightController = new WorldWind.HighlightController(wwd);
    
}

function DisableSearchByLocation(){
	document.getElementById("SearchByCountryButton").style.color = "gray";
    document.getElementById("SearchByCountryButton").disabled = true;
    document.getElementById("SearchByCountryButton").innerHTML = "Search In Progress...";

    document.getElementById("SearchByCityButton").style.color = "gray";
    document.getElementById("SearchByCityButton").disabled = true;
    document.getElementById("SearchByCityButton").innerHTML = "Search In Progress...";
 }

 function DisableSearchByLocationForMobileMode(){
	document.getElementById("SearchByCountryButton").style.color = "gray";
    document.getElementById("SearchByCountryButton").disabled = true;
    document.getElementById("SearchByCountryButton").innerHTML = "Not Available";

    document.getElementById("SearchByCityButton").style.color = "gray";
    document.getElementById("SearchByCityButton").disabled = true;
    document.getElementById("SearchByCityButton").innerHTML = "Not Available";
 }

 function EnableSearchByLocation(){
	document.getElementById("SearchByCountryButton").style.color = "black";
    document.getElementById("SearchByCountryButton").disabled = false;
    document.getElementById("SearchByCountryButton").innerHTML = "Search By Country";

    document.getElementById("SearchByCityButton").style.color = "black";
    document.getElementById("SearchByCityButton").disabled = false;
    document.getElementById("SearchByCityButton").innerHTML = "Search By City";
 }

 function EnableSearchByLocation(){
	document.getElementById("SearchByCountryButton").style.color = "black";
    document.getElementById("SearchByCountryButton").disabled = false;
    document.getElementById("SearchByCountryButton").innerHTML = "Search By Country";

    document.getElementById("SearchByCityButton").style.color = "black";
    document.getElementById("SearchByCityButton").disabled = false;
    document.getElementById("SearchByCityButton").innerHTML = "Search By City";
 }




 function DisableReturnAllDevices(){
	document.getElementById("ReturnAllDevices").style.color = "gray";
    document.getElementById("ReturnAllDevices").disabled = true;

 }

 function EnableReturnAllDevices(){
	document.getElementById("ReturnAllDevices").style.color = "black";
    document.getElementById("ReturnAllDevices").disabled = false;
 }




async function DrawPolygonTimeSeries(Th_Lat,Th_Lon, data_val_arr,needReverse,params){

    var animationStep = document.getElementById("AnimTimeStep").value;

    timeSeriesLayer.removeAllRenderables();
    timeSeriesLayer.displayName = "Time Series Polygons";
    timeSeriesLayer.enabled = true;

    if(needReverse){
        data_val_arr.reverse();
    }   
    
    console.log(data_val_arr);

    //data needs to be feature scaled first for presentation purpose
    var raw_data_only_arr=[];

    var feature_scaled_data_arr = [];

    for(i=0;i<data_val_arr.length;i++){
        
        raw_data_only_arr.push(data_val_arr[i][1]);
    }

    var data_max = Math.max(parseFloat(raw_data_only_arr));

    for(i=0;i<raw_data_only_arr.length;i++){
        if(raw_data_only_arr[i]>1){
            var feature_scaled_data = (parseFloat(raw_data_only_arr[i])-0)/(data_max-0);
            feature_scaled_data_arr.push(feature_scaled_data);
        } else {
            feature_scaled_data_arr.push(parseFloat(raw_data_only_arr[i]));
        }
        
    }

    console.log(raw_data_only_arr);
    console.log(feature_scaled_data_arr);
   
    
    var polygon_arr = [];
    var real_data_arr = [];
    var time_stamp_arr = [];

    var sideAPosLat = Th_Lat+0.001;
    var sideBPosLat = Th_Lat+0.001;
    var sideCPosLat =Th_Lat+0.01;
    var sideDPosLat = Th_Lat+0.01;
    
    var sideAPosLon = Th_Lon+0.001;
    var sideBPosLon = Th_Lon+0.01;
    var sideCPosLon = Th_Lon+0.01;
    var sideDPosLon = Th_Lon+0.001;

        for(i=0;i<feature_scaled_data_arr.length;i++){

            var boundaries = [];

            var real_data = raw_data_only_arr[i];
            var data_val = feature_scaled_data_arr[i];
            var data_val_timestamp = data_val_arr[i][0];
        
            // outer boundary
            // should be close to the things's lat and lon
            boundaries[0] = []; 
            boundaries[0].push(new WorldWind.Position(sideAPosLat, sideAPosLon, data_val*2e3));
            boundaries[0].push(new WorldWind.Position(sideBPosLat, sideBPosLon, data_val*2e3));
            boundaries[0].push(new WorldWind.Position(sideCPosLat, sideCPosLon, data_val*2e3));
            boundaries[0].push(new WorldWind.Position(sideDPosLat, sideDPosLon, data_val*2e3));

            // Create the polygon and assign its attributes.

            var polygon = new WorldWind.Polygon(boundaries, null);
            polygon.altitudeMode = WorldWind.ABSOLUTE;
            polygon.extrude = true; // extrude the polygon edges to the ground

            var polygonAttributes = new WorldWind.ShapeAttributes(null);
            polygonAttributes.drawInterior = true;
            polygonAttributes.drawOutline = true;
            polygonAttributes.outlineColor = WorldWind.Color.BLUE;
            polygonAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
            polygonAttributes.drawVerticals = polygon.extrude;
            polygonAttributes.applyLighting = true;

            polygon.attributes = polygonAttributes;

            // Create and assign the polygon's highlight attributes.
            var highlightAttributes = new WorldWind.ShapeAttributes(polygonAttributes);
            highlightAttributes.outlineColor = WorldWind.Color.RED;
            highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 0.5);
            polygon.highlightAttributes = highlightAttributes;

            polygon_arr.push(polygon);

            
            var textAttributes = new WorldWind.TextAttributes(null);

            var textTimeStampAttributes = new WorldWind.TextAttributes(null);
           

            // A list of prominent peaks in the State of Oregon. Retrieved from:
            // https://en.wikipedia.org/wiki/List_of_Ultras_of_the_United_States


        // Set up the common text attributes.
        textAttributes.color = WorldWind.Color.CYAN;

        // Set the depth test property such that the terrain does not obscure the text.
        textAttributes.depthTest = false;

        // Set up the common text attributes.
        textTimeStampAttributes.color = WorldWind.Color.RED;

        // Set the depth test property such that the terrain does not obscure the text.
        textTimeStampAttributes.depthTest = false;

        // For each peak, create a text shape.
        
            
            if(JSON.stringify(params) == "{}"){

                var textPosition = new WorldWind.Position(Th_Lat, Th_Lon, data_val*23e2);

                var text = new WorldWind.GeographicText(textPosition, String(real_data));

                var textTimeStampPosition = new WorldWind.Position(Th_Lat-0.03, Th_Lon, 5e2);

                var textTimeStamp = new WorldWind.GeographicText(textTimeStampPosition, new Date(data_val_timestamp).toUTCString());

                // Set the text attributes for this shape.
                text.attributes = textAttributes;
                
                textTimeStamp.attributes = textTimeStampAttributes;

                real_data_arr.push(text);
                time_stamp_arr.push(textTimeStamp);

            } else {

                if(!!(params.unit)){

                    console.log(real_data+" "+params.unit);

                    //+" "+params.unit
                    var textPosition = new WorldWind.Position(Th_Lat, Th_Lon, data_val*23e2);

                    var text = new WorldWind.GeographicText(textPosition, String(real_data)+" "+params.unit);

                    
                    var textTimeStampPosition = new WorldWind.Position(Th_Lat-0.03, Th_Lon, 5e2);
    
                    var textTimeStamp = new WorldWind.GeographicText(textTimeStampPosition, new Date(data_val_timestamp).toUTCString());
    
                    // Set the text attributes for this shape.
                    text.attributes = textAttributes;
                    
                    textTimeStamp.attributes = textTimeStampAttributes;
    
                    real_data_arr.push(text);
                    time_stamp_arr.push(textTimeStamp);

                } else {

                    var textPosition = new WorldWind.Position(Th_Lat, Th_Lon, data_val*23e2);

                    var text = new WorldWind.GeographicText(textPosition, String(real_data));

                    

                    var textTimeStampPosition = new WorldWind.Position(Th_Lat-0.03, Th_Lon, 5e2);
    
                    var textTimeStamp = new WorldWind.GeographicText(textTimeStampPosition, new Date(data_val_timestamp).toUTCString());
    
                    // Set the text attributes for this shape.
                    text.attributes = textAttributes;
                    
                    textTimeStamp.attributes = textTimeStampAttributes;
    
                    real_data_arr.push(text);
                    time_stamp_arr.push(textTimeStamp);
                }

               
            }

            

            // Add the text to the layer.
            
        }

        console.log(polygon_arr);
        console.log(real_data_arr);
        console.log(time_stamp_arr);

        wwd.addLayer(timeSeriesLayer);

        
        wwd.navigator.range = 38000;
        wwd.navigator.tilt = 60;
        wwd.navigator.lookAtLocation = {
           "latitude": Th_Lat,
           "longitude": Th_Lon
       }
       

        function animateTimeSeries() {
            
            wwd.redraw();
            if(time_step === (polygon_arr.length-1)){
                time_step = 0;
            }

            console.log("I'm executing... step:" +time_step+ "time now is: " +new Date().getTime());

            wwd.removeLayer(timeSeriesLayer);
            timeSeriesLayer.removeAllRenderables();

            timeSeriesLayer.addRenderable(polygon_arr[time_step]);
            timeSeriesLayer.addRenderable(real_data_arr[time_step]);
            timeSeriesLayer.addRenderable(time_stamp_arr[time_step]);
            wwd.addLayer(timeSeriesLayer);
           
            time_step = ++time_step;
            
        }

        // Run the animation at the desired frequency.

       

       ts_var = window.setInterval(animateTimeSeries, animationStep);



    // Add the polygon to the layer and the layer to the WorldWindow's layer list.
  
    // Now set up to handle highlighting.
    var highlightController = new WorldWind.HighlightController(wwd);
}


async function DrawPolygonMobThTimeSeries(data_val_arr, data_centraLoc){

    var animationStep = document.getElementById("AnimTimeStep").value;

    timeSeriesLayer.removeAllRenderables();
    timeSeriesLayer.displayName = "Time Series Polygons";
    timeSeriesLayer.enabled = true;
    //wwd.redraw();

        
    data_val_arr.reverse();


    console.log(data_val_arr);

    //data needs to be feature scaled first for presentation purpose
    var raw_data_only_arr=[];
    var raw_data_microSiev_arr=[];

    var feature_scaled_data_arr = [];

    for(i=0;i<data_val_arr.length;i++){
        
        var cpmVal = (data_val_arr[i].properties.params.info.cpm).split(" = ")[1];
        var microSievVal = (data_val_arr[i].properties.name).split(" ")[0];
        

        raw_data_only_arr.push(cpmVal);
        raw_data_microSiev_arr.push(microSievVal);
    }

    var data_max = Math.max(parseInt(raw_data_only_arr));

    for(i=0;i<raw_data_only_arr.length;i++){
        if(raw_data_only_arr[i]>1){
            var feature_scaled_data = (parseInt(raw_data_only_arr[i])-0)/(data_max-0);
            feature_scaled_data_arr.push(feature_scaled_data);
        } else {
            feature_scaled_data_arr.push(parseInt(raw_data_only_arr[i]));
        }
        
    }

    console.log(raw_data_only_arr);
    console.log(feature_scaled_data_arr);
   
    
    var polygon_arr = [];
    var real_data_arr = [];
    var time_stamp_arr = [];

        for(i=0;i<feature_scaled_data_arr.length;i++){

            var Th_Lat = data_val_arr[i].geometry.coordinates[1];
            var Th_Lon = data_val_arr[i].geometry.coordinates[0];

            var sideAPosLat = Th_Lat+0.001;
            var sideBPosLat = Th_Lat+0.001;
            var sideCPosLat =Th_Lat+0.01;
            var sideDPosLat = Th_Lat+0.01;
            
            var sideAPosLon = Th_Lon+0.001;
            var sideBPosLon = Th_Lon+0.01;
            var sideCPosLon = Th_Lon+0.01;
            var sideDPosLon = Th_Lon+0.001;

            var boundaries = [];

            var real_data = raw_data_only_arr[i];
            var data_val = feature_scaled_data_arr[i];
            var data_val_timestamp = data_val_arr[i].properties.params.info.time;
        
            // outer boundary
            // should be close to the things's lat and lon
            boundaries[0] = []; 
            boundaries[0].push(new WorldWind.Position(sideAPosLat, sideAPosLon, data_val*2e3));
            boundaries[0].push(new WorldWind.Position(sideBPosLat, sideBPosLon, data_val*2e3));
            boundaries[0].push(new WorldWind.Position(sideCPosLat, sideCPosLon, data_val*2e3));
            boundaries[0].push(new WorldWind.Position(sideDPosLat, sideDPosLon, data_val*2e3));

            // Create the polygon and assign its attributes.

            var polygon = new WorldWind.Polygon(boundaries, null);
            polygon.altitudeMode = WorldWind.ABSOLUTE;
            polygon.extrude = true; // extrude the polygon edges to the ground

            var polygonAttributes = new WorldWind.ShapeAttributes(null);
            polygonAttributes.drawInterior = true;
            polygonAttributes.drawOutline = true;

            var origColorSrc = data_val_arr[i].properties.icon;

            switch (origColorSrc) {
                case "http://www.safecast.org/kml/grey.png": //grey
                    polygonAttributes.outlineColor = WorldWind.Color.DARK_GRAY;
                    //polygonAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
                    polygonAttributes.interiorColor = WorldWind.Color.DARK_GRAY;
                    break;
                case "http://www.safecast.org/kml/darkRed.png": //darkRed
                    
                    polygonAttributes.outlineColor = new WorldWind.Color.colorFromBytes(139,0,0,1 )
                    polygonAttributes.interiorColor = new WorldWind.Color.colorFromBytes(139,0,0,1 )
                    break;
                case "http://www.safecast.org/kml/red.png": //red
                    polygonAttributes.outlineColor = WorldWind.Color.RED;
                    polygonAttributes.interiorColor =  WorldWind.Color.RED;
                    break;
                case "http://www.safecast.org/kml/darkOrange.png": //darkOrange
                    
                    polygonAttributes.outlineColor = new WorldWind.Color.colorFromBytes(255,140,0,1);
                    polygonAttributes.interiorColor = new WorldWind.Color.colorFromBytes(255,140,0,1);
                    break;
                case "http://www.safecast.org/kml/orange.png": //orange
                    polygonAttributes.outlineColor = new WorldWind.Color.colorFromBytes(255,165,0,1);
                    polygonAttributes.interiorColor = new WorldWind.Color.colorFromBytes(255,165,0,1);
                    break;
                case "http://www.safecast.org/kml/yellow.png": //yellow
                    polygonAttributes.outlineColor = WorldWind.Color.YELLOW;
                    polygonAttributes.interiorColor = WorldWind.Color.YELLOW;
                    break;
                case "http://www.safecast.org/kml/lightGreen.png": //lightGreen
                    polygonAttributes.outlineColor = new WorldWind.Color.colorFromBytes(144,238,144 ,1);
                    polygonAttributes.interiorColor = new WorldWind.Color.colorFromBytes(144,238,144 ,1);
                    break;
                case "http://www.safecast.org/kml/green.png": //green
                    polygonAttributes.outlineColor = new WorldWind.Color.colorFromBytes(0,100,0 ,1 );
                    polygonAttributes.interiorColor = new WorldWind.Color.colorFromBytes(0,100,0 ,1 );
                    break;
                case "http://www.safecast.org/kml/midgreen.png": //midGreen
                    polygonAttributes.outlineColor = WorldWind.Color.GREEN;
                    polygonAttributes.interiorColor = WorldWind.Color.GREEN;
                    break;
                case "http://www.safecast.org/kml/white.png": //white
                    polygonAttributes.outlineColor = WorldWind.Color.WHITE;
                    polygonAttributes.interiorColor = WorldWind.Color.WHITE;
                    break;
                default:
                    polygonAttributes.outlineColor = WorldWind.Color.CYAN;
                    polygonAttributes.interiorColor = WorldWind.Color.CYAN;
            }

            //polygonAttributes.outlineColor = WorldWind.Color.BLUE;
            //polygonAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);

            polygonAttributes.drawVerticals = polygon.extrude;
            polygonAttributes.applyLighting = true;

            polygon.attributes = polygonAttributes;

            // Create and assign the polygon's highlight attributes.
            var highlightAttributes = new WorldWind.ShapeAttributes(polygonAttributes);
            highlightAttributes.outlineColor = WorldWind.Color.MAGENTA;
            highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 0.5);
            polygon.highlightAttributes = highlightAttributes;

            polygon_arr.push(polygon);

            
            var textAttributes = new WorldWind.TextAttributes(null);

            var textTimeStampAttributes = new WorldWind.TextAttributes(null);
           

            // A list of prominent peaks in the State of Oregon. Retrieved from:
            // https://en.wikipedia.org/wiki/List_of_Ultras_of_the_United_States


        // Set up the common text attributes.
        textAttributes.color = WorldWind.Color.CYAN;

        // Set the depth test property such that the terrain does not obscure the text.
        textAttributes.depthTest = false;

        // Set up the common text attributes.
        textTimeStampAttributes.color = WorldWind.Color.RED;

        // Set the depth test property such that the terrain does not obscure the text.
        textTimeStampAttributes.depthTest = false;

        // For each peak, create a text shape.

        var textPosition = new WorldWind.Position(Th_Lat, Th_Lon, data_val*23e2);

                var text = new WorldWind.GeographicText(textPosition, String(real_data)+" CPM, "+String(raw_data_microSiev_arr[i])+" uSv/h");

                var textTimeStampPosition = new WorldWind.Position(Th_Lat-0.03, Th_Lon, 5e2);

                var textTimeStamp = new WorldWind.GeographicText(textTimeStampPosition, data_val_timestamp);

                // Set the text attributes for this shape.
                text.attributes = textAttributes;
                
                textTimeStamp.attributes = textTimeStampAttributes;

                real_data_arr.push(text);
                time_stamp_arr.push(textTimeStamp);
        

            // Add the text to the layer.
            
        }

        console.log(polygon_arr);
        console.log(real_data_arr);
        console.log(time_stamp_arr);

        wwd.addLayer(timeSeriesLayer);

        var latitudeToLook = data_val_arr[0].geometry.coordinates[1];
        var longitudeToLook = data_val_arr[0].geometry.coordinates[0];

        wwd.navigator.range = 55000;
        wwd.navigator.tilt = 60;
        wwd.navigator.lookAtLocation = {
            "latitude":latitudeToLook,
            "longitude" : longitudeToLook
        }
       

        function animateTimeSeries() {
            
            wwd.redraw();
            if(time_step === (polygon_arr.length-1)){
                time_step = 0;
            }

            //console.log("I'm executing... step:" +time_step+ "time now is: " +new Date().getTime());

            wwd.removeLayer(timeSeriesLayer);
            timeSeriesLayer.removeAllRenderables();

            timeSeriesLayer.addRenderable(polygon_arr[time_step]);
            timeSeriesLayer.addRenderable(real_data_arr[time_step]);
            timeSeriesLayer.addRenderable(time_stamp_arr[time_step]);
            wwd.addLayer(timeSeriesLayer);
           
            time_step = ++time_step;
            
        }

        // Run the animation at the desired frequency.

       

       ts_var = window.setInterval(animateTimeSeries, animationStep);



    // Add the polygon to the layer and the layer to the WorldWindow's layer list.
  
    // Now set up to handle highlighting.
    var highlightController = new WorldWind.HighlightController(wwd);
}

function stopTimeSeriesAnimation(){
    wwd.removeLayer(timeSeriesLayer);
    window.clearInterval(ts_var);

    var selectedStOrMobDiv = document.getElementById("StationaryOrMobile");

    var selectedVal = selectedStOrMobDiv.options[selectedStOrMobDiv.selectedIndex].value;

    if(selectedVal == 'M'){
        //markerClusterMobTh.showAllLevels();
        //markerClusterMobTh.showAllSingle();
        markerClusterMobTh.updateGlobe(wwd);
        markerClusterMobTh.addClusterLayer();
        wwd = markerClusterMobTh.getGlobe();
        //wwd.addLayer("Mob Things Cluster");
        wwd.redraw();

    } else if (selectedVal == 'S'){
        //markerCluster.showAllLevels();
        markerCluster.updateGlobe(wwd);
        markerCluster.addClusterLayer();
        wwd = markerCluster.getGlobe();
       // wwd.addLayer("All Things Cluster");
        wwd.redraw();
    }
    
    time_step=0;
    wwd.redraw();
    EnableReturnAllDevices();
}

function OnChangeStationaryMobile(){
    var selectedStOrMobDiv = document.getElementById("StationaryOrMobile");

    var selectedVal = selectedStOrMobDiv.options[selectedStOrMobDiv.selectedIndex].value;

    if(selectedVal == 'M'){

        EnableMobileThingsVis();

        wwd.removeLayer(timeSeriesLayer);
        wwd.removeLayer(placemarkLayerAllDev);
        wwd.removeLayer(placemarkLayerDevByLoc);
        wwd.removeLayer(placemarkLayerDevByKeywords);
        wwd.removeLayer(placemarkLayerDevByRadius);

       // markerCluster.hideAllLevels();
       // markerCluster.hideAllSingle();
        markerCluster.updateGlobe(wwd);
        markerCluster.removeClusterLayer();

        wwd = markerCluster.getGlobe();
        //wwd.removeLayer("All Things Cluster");
        wwd.redraw();
        //wwd.redraw();

        document.getElementById("startTime").disabled = false;
        document.getElementById("endTime").disabled = false;
        
        document.getElementById('spanTimeNum').disabled = true;
        document.getElementById('spanTimeUnit').disabled = true;
        document.getElementById('selectToSee').innerHTML = "Mobile Things to see";

        document.getElementById("searchRadius").style.color = "gray";
        document.getElementById("searchRadius").disabled = true;

        document.getElementById("searchKeywords").style.color = "gray";
        document.getElementById("searchKeywords").disabled = true;

        removeOptions(document.getElementById("selectSensor"));
            

            if(!!(document.getElementById("existingThingsSummary"))){
                var existingEl = document.getElementById("existingThingsSummary");
                existingEl.parentNode.removeChild(existingEl);
            }

        document.getElementById('submitStartEndDateTimeTimeSeries').disabled = true;

        //QuerySafecastMobTh();

        //document.getElementById('StationaryOrMobile').disabled = true;
        document.getElementById('mobileThingsDraw').style.color = "black";
        document.getElementById('mobileThingsDraw').disabled = false;

        document.getElementById('submitStartEndDateTime').disabled = true;

        if(!(typeof markerClusterMobTh == 'undefined')){
            //markerClusterMobTh.showAllLevels();
            markerClusterMobTh.updateGlobe(wwd);
            markerClusterMobTh.addClusterLayer();
            wwd = markerClusterMobTh.getGlobe();
           //wwd.addLayer("Mob Things Cluster");
           wwd.redraw();
        }
        //wwd.redraw();

        DisableSearchByLocationForMobileMode();
        DisableReturnAllDevices();


    } else if (selectedVal == 'S') {

        DisableMobileThingsVis();

        document.getElementById('mobileThingsDraw').style.color = "gray";
        document.getElementById('mobileThingsDraw').disabled = true;

        //markerClusterMobTh.hideAllLevels();
        //markerClusterMobTh.hideAllSingle();
        if(typeof markerClusterMobTh !== 'undefined'){
            markerClusterMobTh.updateGlobe(wwd);
            markerClusterMobTh.removeClusterLayer();
            wwd = markerClusterMobTh.getGlobe();
            //wwd.removeLayer("Mob Things Cluster");
            wwd.redraw();
        }
       
        document.getElementById("startTime").disabled = true;
        document.getElementById("endTime").disabled = true;
        document.getElementById('selectToSee').innerHTML = "Sensor to see";

        document.getElementById("searchRadius").style.color = "black";
        document.getElementById("searchRadius").disabled = false;

        document.getElementById("searchKeywords").style.color = "black";
        document.getElementById("searchKeywords").disabled = false;

        removeOptions(document.getElementById("selectSensor"));

        document.getElementById('selectSensor').removeEventListener("change",MobThOnSelectedGlobeLookAtLoc);
            

            if(!!(document.getElementById("existingThingsSummary"))){
                var existingEl = document.getElementById("existingThingsSummary");
                existingEl.parentNode.removeChild(existingEl);
            }

           // if(!typeof markerCluster == 'undefined'){
                //markerCluster.showAllLevels();
               
               
           // }

            markerCluster.updateGlobe(wwd);
            markerCluster.addClusterLayer();

            wwd = markerCluster.getGlobe();
            //wwd.addLayer("All Things Cluster");
            wwd.redraw();
            //wwd.redraw();

            EnableSearchByLocation();
            EnableReturnAllDevices();

    }

}

function TrigMobileThingsVis(){
    VisualizeMobileThings();
}

async function copyToMobileDB(jsDB){

    mobileThingsDB.length=0;

    for(i=0;i<jsDB.length;i++){
        mobileThingsDB.push(jsDB[i]);
    }
}

async function VisualizeMobileThings(){

    document.getElementById('selectSensor').disabled = true;

    mobThToVisList = {};

    var geoJSONArr=[];

    var promArr=[];

    var startTime = new Date(document.getElementById("startTime").value);
    var endTime = new Date(document.getElementById("endTime").value);

    removeOptions(document.getElementById("selectSensor"));

    if(!(typeof markerClusterMobTh == 'undefined')){
        //markerClusterMobTh.hideAllLevels();
       // markerClusterMobTh.hideAllSingle();
        markerClusterMobTh.updateGlobe(wwd);
        markerClusterMobTh.removeClusterLayer();
        //wwd.removeLayer("Mob Things Cluster");
        wwd = markerClusterMobTh.getGlobe();
        wwd.redraw();
        //wwd.redraw();
        delete markerClusterMobTh;
    }

   if (typeof markerClusterMobTh == 'undefined') {
           markerClusterMobTh = new MarkerCluster(wwd, {
                maxLevel: 7,
                smooth: false,
                name: "Mob Things Cluster",
                maxCount: 5000,
                //clusterSources: null,
                //attributeColor: null,
                radius: 45
        });
    }

    wwd = markerClusterMobTh.getGlobe();

    console.log(mobileThingsDB);

    var mobThPromArrList = [];
    var mobThUserIDArrList = [];

    for(i=0;i<mobileThingsDB.length;i++){

        var timeCreated = new Date(mobileThingsDB[i]["created_at"]);

        if(timeCreated.getTime()>=startTime.getTime() && timeCreated.getTime()<=endTime.getTime()){
            
        
            var userID = mobileThingsDB[i].id;

            var urlSCBg = "https://api.safecast.org/en-US/bgeigie_imports/"+userID+"/kml";


           // var prom = $.when( 
            //    $.ajax(url).done(function(xml) {
                
                //fetch(urlSCBg).then(function(xml) {
                   var prom = $.ajax(urlSCBg).then(function(xml){

                            return xml;


                   })

                   mobThPromArrList.push(prom);
                   mobThUserIDArrList.push(userID);

        }

    }

    Promise.all(mobThPromArrList).then(function(values){

        for(i=0;i<values.length;i++){

            var userID = mobThUserIDArrList[i];
            var mobGeoJSON = toGeoJSON.kml(values[i]);

            var mobThToVisEl = {};

            var midEl = Math.floor((mobGeoJSON.features.length)/2);
            var midLon = mobGeoJSON.features[midEl].geometry.coordinates[0];
            var midLat = mobGeoJSON.features[midEl].geometry.coordinates[1];

            mobThToVisEl.latitude = midLat;
            mobThToVisEl.longitude = midLon;

            
            for (j=0;j<mobGeoJSON.features.length;j++){

                var description = mobGeoJSON.features[j].properties.description;
                var descrArr = description.split("/");

                var cpmStr = descrArr[0].substr(0,descrArr[0].length-4);
                mobGeoJSON.features[j].properties.params = {};
                mobGeoJSON.features[j].properties.params.info = {};

                mobGeoJSON.features[j].properties.params.info.cpm = cpmStr;
                mobGeoJSON.features[j].properties.params.info.cpmValue = cpmStr.split(" = ")[1];
                mobGeoJSON.features[j].properties.params.info.displayName = userID;
                mobGeoJSON.features[j].properties.params.info.sievert =  mobGeoJSON.features[j].properties.name.split(" ")[0];
                mobGeoJSON.features[j].properties.params.info.sievertUnit =  mobGeoJSON.features[j].properties.name.split(" ")[1];
                //mobGeoJSON.features[i].properties.params.info.icon = mobGeoJSON.features[i].properties.icon;
                
                
                var imgFileName = mobGeoJSON.features[j].properties.icon.split("/kml/")[1];
                

                var year = descrArr[0].substr(descrArr[0].length-4);
                var month = descrArr[1];
                var day_date =  descrArr[2].split(" ")[0];
                var timeArr = descrArr[2].split(" ")[1].split(":");

                var fullDate = new Date();
                fullDate.setFullYear(year,parseInt(month)-1,day_date);
                fullDate.setHours(timeArr[0],timeArr[1],timeArr[2]);
                mobGeoJSON.features[j].properties.params.info.time = fullDate.toUTCString();
                mobGeoJSON.features[j].properties.params.info.providerID = "safecast";
                mobGeoJSON.features[j].properties.params.info.placemarkType = "mobiothings";
            // mobGeoJSON.features[i].properties.providerID = "safecast";
                
                var placemarkAttr = CreatePlacemarkAttributes("/images/"+imgFileName);
                var highlightAttr = CreateHighlightAttributes(placemarkAttr);
                placemarkAttr.highlightAttributes = highlightAttr;

                mobGeoJSON.features[j].properties.params.placemarkAttributes = placemarkAttr;
                mobGeoJSON.features[j].properties.params.highlightAttributes = highlightAttr;
                
            }
            //console.log(mobGeoJSON);

            mobThToVisEl.data =  mobGeoJSON.features;

            mobThToVisList[userID] = mobThToVisEl;

            var newContent=document.createElement('option');
            newContent.id = "sensorOption"+i;
            
            newContent.value =  userID;
            newContent.innerHTML =  userID;
            //newContent.innerHTML =  userID+" ("+mobGeoJSON.features[0].properties.params.info.time+") ";
            document.getElementById('selectSensor').appendChild(newContent);

            geoJSONArr = geoJSONArr.concat(mobGeoJSON.features);
        }

        //console.log(geoJSONArr),

        markerClusterMobTh.generateClusterCustomImg(geoJSONArr);
        delete geoJSONArr;
        wwd = markerClusterMobTh.getGlobe();

        document.getElementById('selectSensor').addEventListener("change", MobThOnSelectedGlobeLookAtLoc); 
        document.getElementById('selectSensor').disabled = false;
        document.getElementById('submitStartEndDateTimeTimeSeries').disabled = false;

    });
    
}


function CreatePlacemarkAttributes(imgSource){
     var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
      // Wrap the canvas created above in an ImageSource object to specify it as the placemarkAttributes image source.
      //placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);
      //placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/thing_node.png";
      
      placemarkAttributes.imageSource = imgSource;

      // Define the pivot point for the placemark at the center of its image source.
      placemarkAttributes.imageOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.5);
      placemarkAttributes.imageScale = 0.8;
      //placemarkAttributes.imageColor = WorldWind.Color.WHITE;
      //placemarkAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
      //placemarkAttributes.outlineColor = WorldWind.Color.BLUE;
      placemarkAttributes.applyLighting = true;
  
      // Set placemark highlight attributes.
      // Note that the normal attributes are specified as the default highlight attributes so that all properties
      // are identical except the image scale. You could instead vary the color, image, or other property
      // to control the highlight representation.
      return placemarkAttributes;
      
}


function CreateHighlightAttributes(placemarkAttr){
      var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttr);
      highlightAttributes.imageScale = 1;
      highlightAttributes.imageSource = placemarkAttr.imageSource;
      //highlightAttributes.imageSource = "images/thing_node_highlight.png";
      
      highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 1);
      highlightAttributes.applyLighting = false;
      return highlightAttributes;
}




async function QuerySafecastMobTh(){
	
    var urlSCRadLog = "https://api.safecast.org/en-US/bgeigie_imports.json?by_status=done";
    
    document.getElementById('SearchMobileThings').disabled = true;

    document.getElementById('SearchMobileThings').style.color = "gray";
    document.getElementById('SearchMobileThings').innerHTML = "Searching...";

			 for(i=1;i<=848;i++){

				mobileThingsQueryProm.push(fetch(urlSCRadLog+"&page="+i).then(function(response) {
					if (!response.ok) {
						EnableSearchButton();
						throw Error("error"+response.statusText);
					}
					return response;})
					.then((response) => response.json())
				 .then(function(data){
					//tempThingSpeak = clone(data);
					//console.log(tempThingSpeak);
						
								for(j=0;j<data.length;j++){
									data[j].providerID = "safecast";
									mobileThingsDB.push(data[j]);
								}
								
				 }))

            }
            
            Promise.all(mobileThingsQueryProm).then(function(values){
                document.getElementById('SearchMobileThings').disabled = false;
                document.getElementById('SearchMobileThings').style.color = "black";
                document.getElementById('SearchMobileThings').innerHTML = "Search Mobile IoT";
            });
}


function TrigSearchByRadius(){
    //if(document.getElementById("StationaryOrMobile").options[(document.getElementById("StationaryOrMobile")).selectedIndex].value == "S"){
        SearchByRadius();
    //} 
    
}

async function SearchByRadius(){

    wwd.removeLayer(placemarkLayerDevByLoc);
    wwd.removeLayer(placemarkLayerAllDev);
    wwd.removeLayer(placemarkLayerDevByRadius);
    wwd.removeLayer(placemarkLayerDevByKeywords);

    if(typeof markerCluster !== "undefined"){
        markerCluster.updateGlobe(wwd);
        markerCluster.removeClusterLayer();
        wwd = markerCluster.getGlobe();
    }
    
    
        //wwd.removeLayer(placemarkLayerDevByKeywords);

        ThingsListSearchByRadius.length=0;
        placemarkLayerDevByRadius.removeAllRenderables();
    
        var latitudeOnSight = wwd.navigator.lookAtLocation.latitude;
        var longitudeOnSight = wwd.navigator.lookAtLocation.longitude;
        var radius = document.getElementById("radiusNum").value;
    
        
        var lengthMeasurer = new WorldWind.LengthMeasurer(wwd);
    
        var wwPositions = [new WorldWind.Position(latitudeOnSight, longitudeOnSight, 0)];

        
    if(document.getElementById("CombinedSearch").checked){
        
        if(ThingsListSearchByKeywords.length == 0){

                var origKeywordsArr = document.getElementById("searchByKeywords").value.split(";");


                for(i=0;i<allThingsDB.length;i++){
        
                    for(j=0;j<origKeywordsArr.length;j++){
                        origKeywordsArr[j] = origKeywordsArr[j].trim().toLowerCase();
                    }
            
                    var arrayToSearch = allThingsDB[i].thingTag;
            
                    var matching = false;
                    for(k=0;k<arrayToSearch.length;k++){
        
                        for(l=0;l<origKeywordsArr.length;l++){
                            if(origKeywordsArr[l] == arrayToSearch[k]){
                                matching = true;
                                break;
                            }
                        }
        
                        if(matching == true){
                            break;
                        }
        
                    }
        
                    //var matching = CheckArrayForMatches(arrayToSearch,origKeywordsArr);
            
                    if(matching){
                        //var placemark = CreatePlacemarkSearchByOthersLayer(ThingsListSearchByRadius[i]);
                        ThingsListSearchByKeywords.push(allThingsDB[i]);
                        //placemarkLayerDevByKeywords.addRenderable(placemark);
                    }
                }
            

        }


        for(i=0;i<ThingsListSearchByKeywords.length;i++){
            wwPositions.push(new WorldWind.Position(ThingsListSearchByKeywords[i].latitude,ThingsListSearchByKeywords[i].longitude,0));
    
            var geographicDistance = lengthMeasurer.getGeographicDistance(wwPositions, WorldWind.GREAT_CIRCLE);
    
            if(document.getElementById("radiusNumUnit").options[(document.getElementById("radiusNumUnit")).selectedIndex].value == "km"){
                var dist = (geographicDistance / 1e3).toFixed(3);
    
                if(Number(dist)<=Number(radius)){
                    //console.log(dist);
                    //console.log(radius);
                    //console.log(latitudeOnSight+","+longitudeOnSight);
                    var placemark = CreatePlacemarkSearchByOthersLayer(ThingsListSearchByKeywords[i]);
                    ThingsListSearchByRadius.push(ThingsListSearchByKeywords[i]);
                    placemarkLayerDevByRadius.addRenderable(placemark);
                }
    
            } else if (document.getElementById("radiusNumUnit").options[(document.getElementById("radiusNumUnit")).selectedIndex].value == "m"){
                var dist = (geographicDistance).toFixed(3);
    
                if(dist<=radius){
    
                    var placemark = CreatePlacemarkSearchByOthersLayer(ThingsListSearchByKeywords[i]);
                    ThingsListSearchByRadius.push(ThingsListSearchByKeywords[i]);
                    placemarkLayerDevByRadius.addRenderable(placemark);
                }
    
            }
            wwPositions.pop();
    
        }
        wwd.addLayer(placemarkLayerDevByRadius);


    } else {

        for(i=0;i<allThingsDB.length;i++){
            wwPositions.push(new WorldWind.Position(allThingsDB[i].latitude,allThingsDB[i].longitude,0));
    
            var geographicDistance = lengthMeasurer.getGeographicDistance(wwPositions, WorldWind.GREAT_CIRCLE);
    
            
            if(document.getElementById("radiusNumUnit").options[(document.getElementById("radiusNumUnit")).selectedIndex].value == "km"){
                var dist = (geographicDistance / 1e3).toFixed(3);
    
                if(Number(dist)<=Number(radius)){
                    //console.log(dist);
                    //console.log(radius);
                    //console.log(latitudeOnSight+","+longitudeOnSight);
                    var placemark = CreatePlacemarkSearchByOthersLayer(allThingsDB[i]);
                    ThingsListSearchByRadius.push(allThingsDB[i]);
                    placemarkLayerDevByRadius.addRenderable(placemark);
                }
    
            } else if (document.getElementById("radiusNumUnit").options[(document.getElementById("radiusNumUnit")).selectedIndex].value == "m"){
                var dist = (geographicDistance).toFixed(3);
    
                if(dist<=radius){
    
                    var placemark = CreatePlacemarkSearchByOthersLayer(allThingsDB[i]);
                    ThingsListSearchByRadius.push(allThingsDB[i]);
                    placemarkLayerDevByRadius.addRenderable(placemark);
                }
    
            }
            wwPositions.pop();
    
        }
        wwd.addLayer(placemarkLayerDevByRadius);

    }

    

   
    wwd.redraw();
}

function TrigSearchByKeywords(){
    //if(document.getElementById("StationaryOrMobile").options[(document.getElementById("StationaryOrMobile")).selectedIndex].value == "S"){
        SearchByKeywords();
    //} 
}

//keyword should be separated with a ';'
async function SearchByKeywords(){

    wwd.removeLayer(placemarkLayerDevByLoc);
    wwd.removeLayer(placemarkLayerAllDev);
    wwd.removeLayer(placemarkLayerDevByKeywords);
    wwd.removeLayer(placemarkLayerDevByRadius);
    
    //


    var origKeywordsArr = document.getElementById("searchByKeywords").value.split(";");
    
    if(typeof markerCluster !== "undefined"){
        markerCluster.updateGlobe(wwd);
        markerCluster.removeClusterLayer();
        wwd = markerCluster.getGlobe();
    }

    ThingsListSearchByKeywords.length=0;
    placemarkLayerDevByKeywords.removeAllRenderables();

    if(document.getElementById("CombinedSearch").checked){


        if(ThingsListSearchByRadius.length == 0){

            var latitudeOnSight = wwd.navigator.lookAtLocation.latitude;
            var longitudeOnSight = wwd.navigator.lookAtLocation.longitude;
            var radius = document.getElementById("radiusNum").value;
        
            
            var lengthMeasurer = new WorldWind.LengthMeasurer(wwd);
        
            var wwPositions = [new WorldWind.Position(latitudeOnSight, longitudeOnSight, 0)];

            for(i=0;i<allThingsDB.length;i++){
    
                
                wwPositions.push(new WorldWind.Position(allThingsDB[i].latitude,allThingsDB[i].longitude,0));
    
                var geographicDistance = lengthMeasurer.getGeographicDistance(wwPositions, WorldWind.GREAT_CIRCLE);
        
                
                if(document.getElementById("radiusNumUnit").options[(document.getElementById("radiusNumUnit")).selectedIndex].value == "km"){
                    var dist = (geographicDistance / 1e3).toFixed(3);
        
                    if(Number(dist)<=Number(radius)){
                        //console.log(dist);
                        //console.log(radius);
                        //console.log(latitudeOnSight+","+longitudeOnSight);
                       // var placemark = CreatePlacemarkSearchByOthersLayer(ThingsListSearchByKeywords[i]);
                        ThingsListSearchByRadius.push(allThingsDB[i]);
                       // placemarkLayerDevByRadius.addRenderable(placemark);
                    }
        
                } else if (document.getElementById("radiusNumUnit").options[(document.getElementById("radiusNumUnit")).selectedIndex].value == "m"){
                    var dist = (geographicDistance).toFixed(3);
        
                    if(dist<=radius){
        
                      //  var placemark = CreatePlacemarkSearchByOthersLayer(ThingsListSearchByKeywords[i]);
                        ThingsListSearchByRadius.push(allThingsDB[i]);
                      //  placemarkLayerDevByRadius.addRenderable(placemark);
                    }
        
                }
                wwPositions.pop();

            }
        

        }

        
        for(i=0;i<ThingsListSearchByRadius.length;i++){
        
            for(j=0;j<origKeywordsArr.length;j++){
                origKeywordsArr[j] = origKeywordsArr[j].trim().toLowerCase();
            }
    
            var arrayToSearch = ThingsListSearchByRadius[i].thingTag;
    
            var matching = false;
            for(k=0;k<arrayToSearch.length;k++){

                for(l=0;l<origKeywordsArr.length;l++){
                    if(origKeywordsArr[l] == arrayToSearch[k]){
                        matching = true;
                        break;
                    }
                }

                if(matching == true){
                    break;
                }

            }

            //var matching = CheckArrayForMatches(arrayToSearch,origKeywordsArr);
    
            if(matching){
                var placemark = CreatePlacemarkSearchByOthersLayer(ThingsListSearchByRadius[i]);
                ThingsListSearchByKeywords.push(ThingsListSearchByRadius[i]);
                placemarkLayerDevByKeywords.addRenderable(placemark);
            }
        }

    } else {

        //wwd.removeLayer(placemarkLayerDevByRadius);

        for(i=0;i<allThingsDB.length;i++){
        
            for(j=0;j<origKeywordsArr.length;j++){
                origKeywordsArr[j] = origKeywordsArr[j].trim().toLowerCase();
            }
    
            var arrayToSearch = allThingsDB[i].thingTag;

            //console.log(arrayToSearch);
    
            //var matching = CheckArrayForMatches(arrayToSearch,origKeywordsArr);

            var matching = false;

            for(k=0;k<arrayToSearch.length;k++){

                for(l=0;l<origKeywordsArr.length;l++){
                    if(origKeywordsArr[l] == arrayToSearch[k].toLowerCase()){
                        matching = true;
                        break;
                    }
                }

                if(matching == true){
                    break;
                }

            }
    
            if(matching){
                var placemark = CreatePlacemarkSearchByOthersLayer(allThingsDB[i]);
                ThingsListSearchByKeywords.push(allThingsDB[i]);
                placemarkLayerDevByKeywords.addRenderable(placemark);
            }
        }

    }

    wwd.addLayer(placemarkLayerDevByKeywords);
    wwd.redraw();
}

/*
async function CheckArrayForMatches (arrayToSearch, arrWithItemsToCheck) {
    return arrWithItemsToCheck.some(function (v) {
        return arrayToSearch.indexOf(v) >= 0;
    });
};
*/


function CreatePlacemarkSearchByOthersLayer(ThingsListEl){
    
    // Set placemark attributes.
    var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
    // Wrap the canvas created above in an ImageSource object to specify it as the placemarkAttributes image source.
    //placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);
    //placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/thing_node.png";
    placemarkAttributes.imageSource = "images/thing_node.png";
    // Define the pivot point for the placemark at the center of its image source.
    placemarkAttributes.imageOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.5);
    placemarkAttributes.imageScale = 0.22;
    
    placemarkAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
    placemarkAttributes.outlineColor = WorldWind.Color.BLUE;
    placemarkAttributes.applyLighting = true;

    // Set placemark highlight attributes.
    // Note that the normal attributes are specified as the default highlight attributes so that all properties
    // are identical except the image scale. You could instead vary the color, image, or other property
    // to control the highlight representation.
    var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
    highlightAttributes.imageScale = 0.3;
    //highlightAttributes.imageSource = WorldWind.configuration.baseUrl + "images/thing_node_highlight.png";
    highlightAttributes.imageSource = "images/thing_node_highlight.png";
    
    highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 1);
    highlightAttributes.applyLighting = false;

    //placemarkLayerDevByOthers = new WorldWind.RenderableLayer("Filtered by Others Placemarks");


            var lat = parseFloat(ThingsListEl.latitude);
            var lon = parseFloat(ThingsListEl.longitude);

            var placemarkPosition = new WorldWind.Position(lat, lon, 0);
            var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
            // Draw placemark at altitude defined above.
            placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND;
            // Assign highlight attributes for the placemark.
            placemark.highlightAttributes = highlightAttributes;

            placemark.displayName = ThingsListEl.name;
            placemark.providerID = ThingsListEl.providerID;

            placemark.latitude = ThingsListEl.latitude;
            placemark.longitude = ThingsListEl.longitude;

            placemark.thingTag = ThingsListEl.thingTag;

            placemark.placemarkType = "iothings";

        if(ThingsListEl.providerID === "smartsantander"){

            // Create the placemark with the attributes defined above.
            
    
            placemark.content = ThingsListEl.content;

            

            // Create the renderable layer for placemarks.
            
            
            // Add the placemark to the layer.
           

        } else if(ThingsListEl.providerID === "opensensemap"){

           
            // Draw placemark at altitude defined above.
           

            placemark.sensorList = ThingsListEl.sensorList;
            placemark.channelID = ThingsListEl.channelID;

             // Create the renderable layer for placemarks.
            
            
             // Add the placemark to the layer.
            
            
        } else if(ThingsListEl.providerID === "openaq"){

          

            placemark.measurements = ThingsListEl.measurements;

             // Create the renderable layer for placemarks.
        
            
        } else if(ThingsListEl.providerID === "netherlandssmartemission"){

          
    

            

            placemark.stationID = ThingsListEl.stationID;
            placemark.lastSeen = ThingsListEl.lastSeen;

             // Create the renderable layer for placemarks.
         
            
             // Add the placemark to the layer.
            

        } else if(ThingsListEl.providerID === "thingspeak"){

          

            placemark.channelID = ThingsListEl.id;
            placemark.description = ThingsListEl.description;

          
            
           
            
        } else if(ThingsListEl.providerID === "smartcitizen"){

           
    
            placemark.channelID = ThingsListEl.deviceID;
            placemark.lastSeen = ThingsListEl.lastSeen;

          
            
             // Add the placemark to the layer.
             
            
        } else if(ThingsListEl.providerID === "safecast"){

            placemark.sensorList = ThingsListEl.sensorList;

             // Create the renderable layer for placemarks.
            
            
             // Add the placemark to the layer.
           
            
        }  else {

           

            placemark.lastSeen = ThingsListEl.lastSeen;

            
            
             // Add the placemark to the layer.
            

        }

    return placemark;
}


 
// as reference, not in an actual in order to save time from parsing JSON file
var countrycodeJS = { 
    af: { code: 'af', name: 'Afghanistan' },
    ax: { code: 'ax', name: 'Åland Islands' },
    al: { code: 'al', name: 'Albania' },
    dz: { code: 'dz', name: 'Algeria' },
    as: { code: 'as', name: 'American Samoa' },
    ad: { code: 'ad', name: 'AndorrA' },
    ao: { code: 'ao', name: 'Angola' },
    ai: { code: 'ai', name: 'Anguilla' },
    aq: { code: 'aq', name: 'Antarctica' },
    ag: { code: 'ag', name: 'Antigua and Barbuda' },
    ar: { code: 'ar', name: 'Argentina' },
    am: { code: 'am', name: 'Armenia' },
    aw: { code: 'aw', name: 'Aruba' },
    au: { code: 'au', name: 'Australia' },
    at: { code: 'at', name: 'Austria' },
    az: { code: 'az', name: 'Azerbaijan' },
    bs: { code: 'bs', name: 'Bahamas' },
    bh: { code: 'bh', name: 'Bahrain' },
    bd: { code: 'bd', name: 'Bangladesh' },
    bb: { code: 'bb', name: 'Barbados' },
    by: { code: 'by', name: 'Belarus' },
    be: { code: 'be', name: 'Belgium' },
    bz: { code: 'bz', name: 'Belize' },
    bj: { code: 'bj', name: 'Benin' },
    bm: { code: 'bm', name: 'Bermuda' },
    bt: { code: 'bt', name: 'Bhutan' },
    bo: { code: 'bo', name: 'Bolivia' },
    ba: { code: 'ba', name: 'Bosnia and Herzegovina' },
    bw: { code: 'bw', name: 'Botswana' },
    bv: { code: 'bv', name: 'Bouvet Island' },
    br: { code: 'br', name: 'Brazil' },
    io: { code: 'io', name: 'British Indian Ocean Territory' },
    bn: { code: 'bn', name: 'Brunei Darussalam' },
    bg: { code: 'bg', name: 'Bulgaria' },
    bf: { code: 'bf', name: 'Burkina Faso' },
    bi: { code: 'bi', name: 'Burundi' },
    kh: { code: 'kh', name: 'Cambodia' },
    cm: { code: 'cm', name: 'Cameroon' },
    ca: { code: 'ca', name: 'Canada' },
    cv: { code: 'cv', name: 'Cape Verde' },
    ky: { code: 'ky', name: 'Cayman Islands' },
    cf: { code: 'cf', name: 'Central African Republic' },
    td: { code: 'td', name: 'Chad' },
    cl: { code: 'cl', name: 'Chile' },
    cn: { code: 'cn', name: 'China' },
    cw: { code: 'cw', name: 'Curaçao' },
    cx: { code: 'cx', name: 'Christmas Island' },
    cc: { code: 'cc', name: 'Cocos (Keeling) Islands' },
    co: { code: 'co', name: 'Colombia' },
    km: { code: 'km', name: 'Comoros' },
    cg: { code: 'cg', name: 'Congo' },
    cd: { code: 'cd', name: 'Congo, Democratic Republic' },
    ck: { code: 'ck', name: 'Cook Islands' },
    cr: { code: 'cr', name: 'Costa Rica' },
    ci: { code: 'ci', name: 'Cote D"Ivoire' },
    hr: { code: 'hr', name: 'Croatia' },
    cu: { code: 'cu', name: 'Cuba' },
    cy: { code: 'cy', name: 'Cyprus' },
    cz: { code: 'cz', name: 'Czech Republic' },
    dk: { code: 'dk', name: 'Denmark' },
    dj: { code: 'dj', name: 'Djibouti' },
    dm: { code: 'dm', name: 'Dominica' },
    do: { code: 'do', name: 'Dominican Republic' },
    ec: { code: 'ec', name: 'Ecuador' },
    eg: { code: 'eg', name: 'Egypt' },
    sv: { code: 'sv', name: 'El Salvador' },
    gq: { code: 'gq', name: 'Equatorial Guinea' },
    er: { code: 'er', name: 'Eritrea' },
    ee: { code: 'ee', name: 'Estonia' },
    et: { code: 'et', name: 'Ethiopia' },
    fk: { code: 'fk', name: 'Falkland Islands (Malvinas)' },
    fo: { code: 'fo', name: 'Faroe Islands' },
    fj: { code: 'fj', name: 'Fiji' },
    fi: { code: 'fi', name: 'Finland' },
    fr: { code: 'fr', name: 'France' },
    gf: { code: 'gf', name: 'French Guiana' },
    pf: { code: 'pf', name: 'French Polynesia' },
    tf: { code: 'tf', name: 'French Southern Territories' },
    ga: { code: 'ga', name: 'Gabon' },
    gm: { code: 'gm', name: 'Gambia' },
    ge: { code: 'ge', name: 'Georgia' },
    de: { code: 'de', name: 'Germany' },
    gh: { code: 'gh', name: 'Ghana' },
    gi: { code: 'gi', name: 'Gibraltar' },
    gr: { code: 'gr', name: 'Greece' },
    gl: { code: 'gl', name: 'Greenland' },
    gd: { code: 'gd', name: 'Grenada' },
    gp: { code: 'gp', name: 'Guadeloupe' },
    gu: { code: 'gu', name: 'Guam' },
    gt: { code: 'gt', name: 'Guatemala' },
    gg: { code: 'gg', name: 'Guernsey' },
    gn: { code: 'gn', name: 'Guinea' },
    gw: { code: 'gw', name: 'Guinea-Bissau' },
    gy: { code: 'gy', name: 'Guyana' },
    ht: { code: 'ht', name: 'Haiti' },
    hm: { code: 'hm', name: 'Heard Island and Mcdonald Islands' },
    va: { code: 'va', name: 'Holy See (Vatican City State)' },
    hn: { code: 'hn', name: 'Honduras' },
    hk: { code: 'hk', name: 'Hong Kong' },
    hu: { code: 'hu', name: 'Hungary' },
    is: { code: 'is', name: 'Iceland' },
    in: { code: 'in', name: 'India' },
    id: { code: 'id', name: 'Indonesia' },
    ir: { code: 'ir', name: 'Iran' },
    iq: { code: 'iq', name: 'Iraq' },
    ie: { code: 'ie', name: 'Ireland' },
    im: { code: 'im', name: 'Isle of Man' },
    il: { code: 'il', name: 'Israel' },
    it: { code: 'it', name: 'Italy' },
    jm: { code: 'jm', name: 'Jamaica' },
    jp: { code: 'jp', name: 'Japan' },
    je: { code: 'je', name: 'Jersey' },
    jo: { code: 'jo', name: 'Jordan' },
    kz: { code: 'kz', name: 'Kazakhstan' },
    ke: { code: 'ke', name: 'Kenya' },
    ki: { code: 'ki', name: 'Kiribati' },
    kp: { code: 'kp', name: 'Korea (North)' },
    kr: { code: 'kr', name: 'Korea (South)' },
    xk: { code: 'xk', name: 'Kosovo' },
    kw: { code: 'kw', name: 'Kuwait' },
    kg: { code: 'kg', name: 'Kyrgyzstan' },
    la: { code: 'la', name: 'Laos' },
    lv: { code: 'lv', name: 'Latvia' },
    lb: { code: 'lb', name: 'Lebanon' },
    ls: { code: 'ls', name: 'Lesotho' },
    lr: { code: 'lr', name: 'Liberia' },
    ly: { code: 'ly', name: 'Libyan Arab Jamahiriya' },
    li: { code: 'li', name: 'Liechtenstein' },
    lt: { code: 'lt', name: 'Lithuania' },
    lu: { code: 'lu', name: 'Luxembourg' },
    mo: { code: 'mo', name: 'Macao' },
    mk: { code: 'mk', name: 'Macedonia' },
    mg: { code: 'mg', name: 'Madagascar' },
    mw: { code: 'mw', name: 'Malawi' },
    my: { code: 'my', name: 'Malaysia' },
    mv: { code: 'mv', name: 'Maldives' },
    ml: { code: 'ml', name: 'Mali' },
    mt: { code: 'mt', name: 'Malta' },
    mh: { code: 'mh', name: 'Marshall Islands' },
    mq: { code: 'mq', name: 'Martinique' },
    mr: { code: 'mr', name: 'Mauritania' },
    mu: { code: 'mu', name: 'Mauritius' },
    yt: { code: 'yt', name: 'Mayotte' },
    mx: { code: 'mx', name: 'Mexico' },
    fm: { code: 'fm', name: 'Micronesia' },
    md: { code: 'md', name: 'Moldova' },
    mc: { code: 'mc', name: 'Monaco' },
    mn: { code: 'mn', name: 'Mongolia' },
    ms: { code: 'ms', name: 'Montserrat' },
    ma: { code: 'ma', name: 'Morocco' },
    mz: { code: 'mz', name: 'Mozambique' },
    mm: { code: 'mm', name: 'Myanmar' },
    na: { code: 'na', name: 'Namibia' },
    nr: { code: 'nr', name: 'Nauru' },
    np: { code: 'np', name: 'Nepal' },
    nl: { code: 'nl', name: 'Netherlands' },
    an: { code: 'an', name: 'Netherlands Antilles' },
    nc: { code: 'nc', name: 'New Caledonia' },
    nz: { code: 'nz', name: 'New Zealand' },
    ni: { code: 'ni', name: 'Nicaragua' },
    ne: { code: 'ne', name: 'Niger' },
    ng: { code: 'ng', name: 'Nigeria' },
    nu: { code: 'nu', name: 'Niue' },
    nf: { code: 'nf', name: 'Norfolk Island' },
    mp: { code: 'mp', name: 'Northern Mariana Islands' },
    no: { code: 'no', name: 'Norway' },
    om: { code: 'om', name: 'Oman' },
    pk: { code: 'pk', name: 'Pakistan' },
    pw: { code: 'pw', name: 'Palau' },
    ps: { code: 'ps', name: 'Palestinian Territory, Occupied' },
    pa: { code: 'pa', name: 'Panama' },
    pg: { code: 'pg', name: 'Papua New Guinea' },
    py: { code: 'py', name: 'Paraguay' },
    pe: { code: 'pe', name: 'Peru' },
    ph: { code: 'ph', name: 'Philippines' },
    pn: { code: 'pn', name: 'Pitcairn' },
    pl: { code: 'pl', name: 'Poland' },
    pt: { code: 'pt', name: 'Portugal' },
    pr: { code: 'pr', name: 'Puerto Rico' },
    qa: { code: 'qa', name: 'Qatar' },
    re: { code: 're', name: 'Reunion' },
    ro: { code: 'ro', name: 'Romania' },
    ru: { code: 'ru', name: 'Russia' },
    rw: { code: 'rw', name: 'Rwanda' },
    sh: { code: 'sh', name: 'Saint Helena' },
    kn: { code: 'kn', name: 'Saint Kitts and Nevis' },
    lc: { code: 'lc', name: 'Saint Lucia' },
    pm: { code: 'pm', name: 'Saint Pierre and Miquelon' },
    vc: { code: 'vc', name: 'Saint Vincent and the Grenadines' },
    ws: { code: 'ws', name: 'Samoa' },
    sm: { code: 'sm', name: 'San Marino' },
    st: { code: 'st', name: 'Sao Tome and Principe' },
    sa: { code: 'sa', name: 'Saudi Arabia' },
    sn: { code: 'sn', name: 'Senegal' },
    rs: { code: 'rs', name: 'Serbia' },
    me: { code: 'me', name: 'Montenegro' },
    sc: { code: 'sc', name: 'Seychelles' },
    sl: { code: 'sl', name: 'Sierra Leone' },
    sg: { code: 'sg', name: 'Singapore' },
    sk: { code: 'sk', name: 'Slovakia' },
    si: { code: 'si', name: 'Slovenia' },
    sb: { code: 'sb', name: 'Solomon Islands' },
    so: { code: 'so', name: 'Somalia' },
    za: { code: 'za', name: 'South Africa' },
    gs: { code: 'gs', name: 'South Georgia and the South Sandwich Islands' },
    es: { code: 'es', name: 'Spain' },
    lk: { code: 'lk', name: 'Sri Lanka' },
    sd: { code: 'sd', name: 'Sudan' },
    sr: { code: 'sr', name: 'Suriname' },
    sj: { code: 'sj', name: 'Svalbard and Jan Mayen' },
    sz: { code: 'sz', name: 'Swaziland' },
    se: { code: 'se', name: 'Sweden' },
    ch: { code: 'ch', name: 'Switzerland' },
    sy: { code: 'sy', name: 'Syrian Arab Republic' },
    tw: { code: 'tw', name: 'Taiwan, Province of China' },
    tj: { code: 'tj', name: 'Tajikistan' },
    tz: { code: 'tz', name: 'Tanzania' },
    th: { code: 'th', name: 'Thailand' },
    tl: { code: 'tl', name: 'Timor-Leste' },
    tg: { code: 'tg', name: 'Togo' },
    tk: { code: 'tk', name: 'Tokelau' },
    to: { code: 'to', name: 'Tonga' },
    tt: { code: 'tt', name: 'Trinidad and Tobago' },
    tn: { code: 'tn', name: 'Tunisia' },
    tr: { code: 'tr', name: 'Turkey' },
    tm: { code: 'tm', name: 'Turkmenistan' },
    tc: { code: 'tc', name: 'Turks and Caicos Islands' },
    tv: { code: 'tv', name: 'Tuvalu' },
    ug: { code: 'ug', name: 'Uganda' },
    ua: { code: 'ua', name: 'Ukraine' },
    ae: { code: 'ae', name: 'United Arab Emirates' },
    gb: { code: 'gb', name: 'United Kingdom' },
    us: { code: 'us', name: 'United States' },
    um: { code: 'um', name: 'United States Minor Outlying Islands' },
    uy: { code: 'uy', name: 'Uruguay' },
    uz: { code: 'uz', name: 'Uzbekistan' },
    vu: { code: 'vu', name: 'Vanuatu' },
    ve: { code: 've', name: 'Venezuela' },
    vn: { code: 'vn', name: 'Viet Nam' },
    vg: { code: 'vg', name: 'Virgin Islands, British' },
    vi: { code: 'vi', name: 'Virgin Islands, U.S.' },
    wf: { code: 'wf', name: 'Wallis and Futuna' },
    eh: { code: 'eh', name: 'Western Sahara' },
    ye: { code: 'ye', name: 'Yemen' },
    zm: { code: 'zm', name: 'Zambia' },
    zw: { code: 'zw', name: 'Zimbabwe' }
  }
  