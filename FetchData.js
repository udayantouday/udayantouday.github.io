//Written by Udayanto Dwi Atmojo


//requirejs([],

var tempPA={};
var tempSC={};
var tempOSM={};
var tempSSant={};
var tempThingSpeak=[];

var tempDweet=[];

var tempOAQ=[];

var tempSafecast=[];


var cndTh = {};
var cndThLoc = {};
var cndThDtStreams = {};

var SENeth = {};

var SENijmTh = [];   
var SENijmThLoc = {};
var SENijmThDtStreams = {};

var allThingsPreviewDB=[];

var all_Query_Proms = [];

var tempBCN=[];

var tempEnglFlood=[];

var cors_purl = "https://cors.io/?";

var cndCityParams = ['calgary','edmonton','kamloops','kluanelake','montreal','ottawa','stalbert','victoria','winnipeg','yellowknife'];
var cndCityParamsActual = ['Calgary','Edmonton','Kamloops','Kluane Lake','Montreal','Ottawa','St. Albert','Victoria','Winnipeg','Yellowknife'];



    async function fetchData() {
		
		//need to re clear all global variables for the new search!
		
			DisableSearchButton();
			DisableReturnAllDevices();
			
			console.log("start searching....");
		    

				 // smartcitizen
				 //data in format of array of JSON

			 var url = "https://api.smartcitizen.me/v0/devices/world_map";
			
			 all_Query_Proms.push(fetch(url).then(function(response) {
				if (!response.ok) {
					EnableSearchButton();
					throw Error(response.statusText);
				}
				return response;})
				.then((response) => response.json())
			 .then(function(data){
				tempSC = clone(data);
				//console.log(data);
				delete data;
				//return data;
			 })) 
			 
			 // OpenSenseMap

			 var url = "https://api.opensensemap.org/boxes";
			
			 all_Query_Proms.push(fetch(url).then(function(response) {
				if (!response.ok) {
					EnableSearchButton();
					throw Error(response.statusText);
				}
				return response;})
				.then((response) => response.json())
			 .then(function(data){
				tempOSM = clone(data);
				delete data;
				//console.log(tempOSM);
			 }))

			 //Canada smart cities
			 //canadian cities to query

			 
				
			 // get all things

			 /*
			 var urlhttp = "https://";
			 var nexturl = "-aq-sta.sensorup.com/v1.0/Things";
			 
			 var Prom_cty_cnd_th = [];
			 

			 for(i = 0; i < cndCityParams.length; i++){


				// example
					//var apiRequest1 = fetch('api.example1.com/search').then(function(response){ 
					//	return response.json()
			   //});

			   var Prom_cty_cnd_th_el = fetch(urlhttp+cndCityParams[i]+nexturl).then(function(response) {
				if (!response.ok) {
					EnableSearchButton();
					throw Error(response.statusText);
				}
				return response.json()
			   });

					/*		
				var Prom_cty_cnd_th_el = fetch(urlhttp+cndCityParams[i]+nexturl).then(function(response) {
					if (!response.ok) {
						EnableSearchButton();
						throw Error(response.statusText);
					}
					return response;})
					.then((response) => response.json())
				 		.then(function(data){
							 return data.value;
				 })
				 

				 Prom_cty_cnd_th.push(Prom_cty_cnd_th_el);

			 }

			   all_Query_Proms.push(Promise.all(Prom_cty_cnd_th).then(function(values){
				
				for(k=0;k<values.length;k++){

					
					var cityname = values[k].value[0].properties.city;
						
					cndTh[cityname] = clone(values[k]);
					//console.log(cndTh);
	   
					//prepare for datastreams
					cndThDtStreams[cityname] = {};
	   
					// get locations of the things in each city
	   
					cndThLoc[cityname] = {};
					var datCpy = clone(values[k]);
					
	   
					for(i = 0; i < datCpy.value.length; i++){
	   
						
									var device_id = datCpy.value[i].properties.displayName;
									all_Query_Proms.push(FetchLocationsCanada(cityname,device_id, datCpy.value[i]));


									// Canada Datastreams disabled. When user click certain thing, then that query is made for that particular thing only.
									//all_Query_Proms.push(FetchDatastreamsCanada(datCpy.value[i],device_id,cityname);

									//Promise.all([Prom_Th_Loc,Prom_Dt_Obsv]).then(function(values){
									//all_Query_Proms.push(Promise.all([Prom_Th_Loc]).then(function(values){	


									//}));


				     }
							
	   
					// get datastreams of individual sensors of each things in each city
	   
				}

			}))

			*/

			// Open AQ, query for locations only, get maximum observation points
			// url : https://api.openaq.org/v1/locations?limit=10000

			 
			var url = "https://api.openaq.org/v1/latest?has_geo=true&limit=10000";
			
			 var openaq_prom = fetch(url).then(function(response) {
				if (!response.ok) {
					EnableSearchButton();
					throw Error(response.statusText);
				}
				return response;})
				.then((response) => response.json())
			 .then(function(data){
				//tempOAQ = clone(data.results);
				return data.results;
				//console.log(tempOSM);
			 })

			 all_Query_Proms.push(openaq_prom);

			var getCoord_prom = Promise.all([openaq_prom]).then(function(values){
					
				//var latlonJSPromArr = [];

				for(i=0;i<values[0].length;i++){

					var thingTag = ["air quality"];

					values[0][i].name = values[0][i].location;
					values[0][i].providerID = "openaq";
					

					for(j=0;j<values[0][i].measurements.length;j++){
						thingTag.push(values[0][i].measurements[j].parameter);
					}
					//values[0][i].lastSeen = values[0][i].lastUpdated;
					//delete values[0][i].lastUpdated;

					//if(!(values[0][i].coordinates)){

					//  latlonJSPromArr.push(SearchLocationWithArrEl(values[0][i].city,values[0][i]));
		  
					//} else 

					//changes for Finland only
					
					if(values[0][i].city.trim() == "Helsingin seudun verkko (HSY)"){
						values[0][i].city = "Helsinki";
					}

					if(values[0][i].city.trim() == "Oulun verkko"){
						values[0][i].city = "Oulu";
					}

					if(values[0][i].city.trim() == "Tampereen verkko"){
						values[0][i].city = "Tampere";
					}

					if(values[0][i].city.trim() == "Harjavallan verkko"){
						values[0][i].city = "Harjavalta";
					}

					if(values[0][i].city.trim() == "Raahen verkko"){
						values[0][i].city = "Raahe";
					}

					if(values[0][i].city.trim() == "Kotkan verkko"){
						values[0][i].city = "Kotka";
					}

					if(values[0][i].city.trim() == "Turun seudun verkko"){
						values[0][i].city = "Turku";
					}

					if(values[0][i].city.trim() == "Lahden verkko"){
						values[0][i].city = "Lahti";
					}

					if(values[0][i].city.trim() == "Kuopion verkko"){
						values[0][i].city = "Kuopio";
					}

					if(values[0][i].city.trim() == "Vaasan verkko"){
						values[0][i].city = "Vaasa";
					}

					if(values[0][i].city.trim() == "Etelä-Karjalan verkko"){
						values[0][i].city = "South Karelia";
					}

					  values[0][i].latitude = values[0][i].coordinates.latitude;
					  values[0][i].longitude = values[0][i].coordinates.longitude;
					  values[0][i].thingTag = thingTag;
					  delete values[0][i].coordinates;
					  tempOAQ.push(values[0][i]);
					
				}

				delete values;

				/*
				all_Query_Proms.push(Promise.all(latlonJSPromArr).then(function(values){
						     for(j=0;j<values.length;j++){
								
								tempOAQ.push(values[j]);

							 }
							 console.log(tempOAQ);
				}));
				*/
				

			});

			all_Query_Proms.push(getCoord_prom);


			 //Dweet (public ones), simply get the ones with GPS locations for pinpointing, the rest will be ignored

			 var url = "https://dweet.io/get/stats"; //get the most recent tweets from devices
			
			 var dweetdataclone=[];
			 var dweetQueryProms=[];

			 var dweetQueriedThings={};

			 var dweet_prom1 = fetch(url).then(function(response) {
				if (!response.ok) {
					EnableSearchButton();
					throw Error(response.statusText);
				}
				return response;})
				.then((response) => response.json())
					.then(function(data){

						return data;


			 })

			 all_Query_Proms.push(dweet_prom1);

			 all_Query_Proms.push(Promise.all([dweet_prom1]).then(function(values){

				dweetdataclone = values[0].with["active_things"];

				var dweetThingObj = {};

				for(i=0;i<dweetdataclone.length;i++){
					if(!dweetThingObj[dweetdataclone[i].thing]){

						dweetThingObj[dweetdataclone[i].thing] = dweetdataclone[i];

					} 
				}


				for(var prop in dweetThingObj){
					
					for(j=0;j<dweetThingObj[prop].keywords.length;j++){

						if (((dweetThingObj[prop].keywords[j]).toLowerCase().indexOf("gps")>=0) || ((dweetThingObj[prop].keywords[j]).toLowerCase().indexOf("latitude")>=0) || ((dweetThingObj[prop].keywords[j]).toLowerCase().indexOf("longitude")>=0)) {
							
							if(!dweetQueriedThings[prop]){

								dweetQueriedThings[prop] = "https://dweet.io/get/dweets/for/"+prop;

							} 

						}
					}

				}

				for(var prop in dweetQueriedThings){

					dweetQueryProms.push(fetch(dweetQueriedThings[prop]).then(function(response) {
						if (!response.ok) {
							EnableSearchButton();
							throw Error("error"+response.statusText);
						}
						return response;})
						.then((response) => response.json())
					 .then(function(data){
						return data.with;
					 }))
				}
				all_Query_Proms = all_Query_Proms.concat(dweetQueryProms);
				//console.log(dweetQueriedThings);

				all_Query_Proms.push
				(Promise.all(dweetQueryProms).then(function(values){
					
					
					for(i=0;i<values.length;i++){

						console.log("size " +values.length);

						var entryThDw = {};

						entryThDw.name = values[i][0].thing;

						var latitudegot = false;
						var longitudegot = false;

						if(values[i][0].content["latitude"] && !latitudegot){
							latitudegot = true;
							entryThDw.latitude= values[i][0].content.latitude;
						}

						if(values[i][0].content["Latitude"] && !latitudegot){
							latitudegot = true;
							entryThDw.latitude= values[i][0].content.Latitude;
						}

						if(values[i][0].content["gps lat"] && !latitudegot){
							latitudegot = true;
							entryThDw.latitude= values[i][0].content["gps lat"];
						}

						if(values[i][0].content["GPS_LAT"] && !latitudegot){
							latitudegot = true;
							entryThDw.latitude= values[i][0].content["GPS_LAT"];
						}

						if(values[i][0].content["longitude"] && !longitudegot ){
							longitudegot = true;
							entryThDw.longitude= values[i][0].content.longitude;
						}

						if(values[i][0].content["Longitude"] && !longitudegot){
							longitudegot = true;
							entryThDw.longitude= values[i][0].content.Longitude;
						}

						if(values[i][0].content["gps long"] && !longitudegot){
							longitudegot = true;
							entryThDw.longitude= values[i][0].content["gps long"]
						}

						if(values[i][0].content["GPS_LNG"] && !longitudegot){
							longitudegot = true;
							entryThDw.longitude= values[i][0].content["GPS_LNG"];
						}

						var measurementsArr = [];

						for(j=0;j<values[i].length;j++){
							values[i][j].content.created = values[i][j].created;
							measurementsArr.push(values[i][j]);
						}

						entryThDw.measurements = measurementsArr;

						if(latitudegot && longitudegot){
							tempDweet.push(entryThDw);
						}
						

					}

					console.log(tempDweet);
				//tempDweet.push(data.with["active_things"][i]);

			}));


			 }));

			

			  //Smart Santander
			 
			  /*
			 var url = cors_purl+"http://maps.smartsantander.eu/php/getdata.php";
			
			 all_Query_Proms.push(fetch(url).then(function(response) {
				if (!response.ok) {
					EnableSearchButton();
					throw Error("error"+response.statusText);
				}
				return response;})
				.then((response) => response.json())
			 .then(function(data){
				tempSSant = clone(data.markers);
				//console.log(tempSSant);
			 }))
			 */
			 
			 
			 // List of all Thingspeak public channels, there are 15 pages total, add "?page=2" etc.
			 // loop
			 // will disregard the ones with latitude & longitude data of 0.0 exactly (can't be geolocated on the map)

			 
			 var url = "https://api.thingspeak.com/channels/public.json";
			
			 var ThSpProm_pg1 = fetch(cors_purl+url).then(function(response) {
				if (!response.ok) {
					EnableSearchButton();
					throw Error("error"+response.statusText);
				}
				return response;})
				.then((response) => response.json())
			 .then(function(data){
				//tempThingSpeak = clone(data.channels);
				//console.log(tempThingSpeak);
				return data;
			 })
			 all_Query_Proms.push(ThSpProm_pg1);

			 var ThSpProm_Arr = [];

			 all_Query_Proms.push(Promise.all([ThSpProm_pg1]).then(function(values){

					for(j=0;j<values[0].channels.length;j++){

						var lat = values[0].channels[j].latitude;
						var lon = values[0].channels[j].longitude;

						if(lat === "0.0" && lon === "0.0"){

						} else {
							values[0].channels[j].providerID = "thingspeak";
							var tagArr = values[0].channels[j].tags;
							var thingTag = [];
							for(i=0;i<tagArr.length;i++){
								thingTag.push(tagArr[i].name);
							}
							values[0].channels[j].thingTag = thingTag;
							tempThingSpeak.push(values[0].channels[j]);
						}

					}

					var total_pages = Math.floor(parseInt(values[0].pagination.total_entries)/parseInt(values[0].pagination.per_page));
					var remainder = parseInt(values[0].pagination.total_entries)%parseInt(values[0].pagination.per_page);
					if(remainder>0){
						total_pages++;
					}

					if(total_pages>1){

						// maximum should be total_pages, but need to limit since ThingSpeak server can't handle many queries
						for(i=2;i<=20;i++){

							var thsp_prom = fetch(cors_purl+url+"?page="+i).then(function(response) {
								if (!response.ok) {
									EnableSearchButton();
									throw Error("error"+response.statusText);
								}
								return response;})
								.then((response) => response.json())
							 .then(function(data){
								//tempThingSpeak = clone(data);
								//console.log(tempThingSpeak);
								return data.channels;
							 })

							 ThSpProm_Arr.push(thsp_prom);
							 //all_Query_Proms.push(thsp_prom);

						}

						all_Query_Proms = all_Query_Proms.concat(ThSpProm_Arr);	

						
						all_Query_Proms.push(Promise.all(ThSpProm_Arr).then(function(values){
										
							for(i=0;i<values.length;i++){
								for(j=0;j<values[i].length;j++){
									var lat = values[i][j].latitude;
									var lon = values[i][j].longitude;
	
									if(lat == "0.0" && lon == "0.0"){
	
									} else {
										values[i][j].providerID = "thingspeak";
										
										var tagArr = values[i][j].tags;
										var thingTag = [];
										for(k=0;k<tagArr.length;k++){
											thingTag.push(tagArr[k].name);
										}
										values[i][j].thingTag = thingTag;
										tempThingSpeak.push(values[i][j]);
										//tempThingSpeak = clone(tempThingSpeak.concat(values[j]));
									}
	
								}
							}

							delete values;
							

						}));

					}
			 }));
			 

			 // Netherlands Smart Emission Project. 
			 // URL of all stations : http://data.smartemission.nl/sosemu/api/v1/stations
			 // Timeseries example : http://data.smartemission.nl/sosemu/api/v1/timeseries?format=json&station=stationlabel


			 var urlSE = "http://data.smartemission.nl/sosemu/api/v1/stations";

			 var NijmTh1_Prom = fetch(cors_purl+urlSE).then(function(response) {
				if (!response.ok) {
					EnableSearchButton();
					throw Error(response.statusText);
				}
				return response;})
				.then((response) => response.json())
					 .then(function(data){

						return data;
					

			 })

			 all_Query_Proms.push(NijmTh1_Prom);

			 all_Query_Proms.push(Promise.all([NijmTh1_Prom]).then(function(values){
										
				SENeth = clone(values[0]);

				delete values;

			}));


			// Lookr

			
			/*
			 var urlhttp = "https://webcamstravel.p.mashape.com/webcams/list";

			 var Lookr_Prom = fetch(urlhttp,{
				method: "GET",
				headers: {
					"Content-Type": "application/json; charset=utf-8",
					"X-Mashape-Key" :"dTPTnYFy4OmshiC6CSzSIeDDcEdop1OKy9ejsnkECd28C7Z7zG",
					"X-Mashape-Host":"webcamstravel.p.mashape.com"
					
				}
			 }).then(function(response) {
				if (!response.ok) {
					EnableSearchButton();
					throw Error(response.statusText);
				}
				return response;})
				.then((response) => response.json())
					 .then(function(data){

						return data;
					
			 })
			 all_Query_Proms.push(Lookr_Prom);

			  Promise.all([Lookr_Prom]).then(function(values){
										
				console.log(values[0]);

			});

			 */

			 // Safecast, radiation open IoT data

			var urlSafeCast = "https://s3-us-west-2.amazonaws.com/safecastdata-us-west-2/ingest/prd/json/view24h.json";

			var safecast_dev_prom = fetch(urlSafeCast).then(function(response) {
				if (!response.ok) {
					EnableSearchButton();
					throw Error(response.statusText);
				}
				return response;})
				.then((response) => response.json())
					 .then(function(data){
						 
						return data;
						//tempSafecast = clone(data);

						//console.log(tempSafecast);
					

			 })

			 all_Query_Proms.push(safecast_dev_prom);

			 all_Query_Proms.push(Promise.all([safecast_dev_prom]).then(function(values){
				
				tempSafecast = tempSafecast.concat(values[0]);
				delete values;

			 }));

			 // Safecast, open "mobile" IoT, radiation


			// var safecast_mobile_dev_prom = fetch("/data/safecastcache.json").then(function(response) {
				
		    var safecast_mobile_dev_prom =	$.ajax("/data/safecastcache.json").then(function(data){
				     var prom_mob = copyToMobileDB(data);
					  
					  all_Query_Proms.push(prom_mob);
			})
			all_Query_Proms.push(safecast_mobile_dev_prom);


			// Barcelona Smart City Sentilo

			var bcn_url = "https://connecta.bcn.cat/connecta-catalog-web/component/map/json";

			var bcn_smart_city_prom = $.ajax(cors_purl+bcn_url
				/*
				{
					type: "GET",
					contentType: "application/json",
					url: bcn_url,
					headers: { 'Host': "connecta.bcn.cat" }
				}
				*/
			  ).then(function(data){
				

				 tempBCN = JSON.parse(data).components;
				 console.log(data);
				 console.log(tempBCN);
				 delete data;
				
				 
			})
			
			all_Query_Proms.push(bcn_smart_city_prom);
			
			/*
			    if (!response.ok) {
					EnableSearchButton();
					throw Error(response.statusText);
				}
				return response;})
				.then((response) => response.json())
					.then(function(data){
		
					  var prom_mob = copyToMobileDB(data);
					  
					  all_Query_Proms.push(prom_mob);

		
			 })
			 */

			 // England Environment Agency Flood Information

			 //var engFlUrl = "https://flood-warning-information.service.gov.uk/flood/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=flood:stations&maxFeatures=10000&outputFormat=application/json&srsName=EPSG:4326;"
			 var engFlUrl = "https://environment.data.gov.uk/flood-monitoring/id/stations?_limit=1000";
			 var engFlprom = $.ajax(cors_purl+engFlUrl
				
			  ).then(function(data){
				

				 tempEnglFlood = JSON.parse(data).items;
				 console.log(data);
				 console.log(tempEnglFlood);
				 delete data;
				
				 
			})
			all_Query_Proms.push(engFlprom);

			 /*
			 var urlSCRadLog = "https://api.safecast.org/en-US/bgeigie_imports.json?by_status=done";

			 for(i=1;i<=848;i++){

				all_Query_Proms.push(fetch(urlSCRadLog+"&page="+i).then(function(response) {
					if (!response.ok) {
						EnableSearchButton();
						throw Error("error"+response.statusText);
					}
					return response;})
					.then((response) => response.json())
				 .then(function(data){
					//tempThingSpeak = clone(data);
					//console.log(tempThingSpeak);
						
								for(i=0;i<data.length;i++){
									data[i].providerID = "safecastlog";
									tempSafecastRadLog.push(data[i]);
								}
								
						
				 }))

			}
			*/

			/*
			 var urlhttp = "https://api.safecast.org/en-US/users.json";

			 for(i=1;i<=67;i++){

				all_Query_Proms.push(fetch(urlhttp+"?page="+i).then(function(response) {
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
							if(Number(data[j]["measurements_count"]) == 0){

							} else {
								tempSafecast.push(data[j]);
							}
						}
				 }))

			}
			*/



									Promise.all(all_Query_Proms).then(function(values){

										window.alert("Search is complete!");
										
										var extraction_prom = ExtractAllThingsLocation();

										Promise.all([extraction_prom]).then(function(values){

											//delete all_Query_Proms;
											
											//CreateWWDIoTRadialMark(allThingsPreviewDB);
											var prom = CreateClusteredThings(allThingsPreviewDB);

											EnableSearchButton();
											//console.log(tempSafecastRadLog);
											//window.alert("Search is complete!");

											EnableStationaryMobileThingsSelection();
											//EnableMobileThingsVis();

											Promise.all([prom]).then(function(values){
												delete allThingsPreviewDB;
											});

										});
										

									});
				 
			 
		 
    }

	function toHtmlQuery_(obj) {return "?"+Object.keys(obj).reduce(function(a,k){a.push(k+"="+encodeURIComponent(obj[k]));return a},[]).join("&")};

	//check for empty JSON
	function isEmpty(obj) {
		for (var x in obj) { if (obj.hasOwnProperty(x))  return false; }
		return true;
	 }


	function clone(obj) {
		// Handle the 3 simple types, and null or undefined
		if (null == obj || "object" != typeof obj) return obj;
	
		// Handle Date
		if (obj instanceof Date) {
			var copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}
	
		// Handle Array
		if (obj instanceof Array) {
			var copy = [];
			for (var i = 0, len = obj.length; i < len; i++) {
				copy[i] = clone(obj[i]);
			}
			return copy;
		}
	
		// Handle Object
		if (obj instanceof Object) {
			var copy = {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
			}
			return copy;
		}
	
		throw new Error("Unable to copy obj! Its type isn't supported.");
	}

	function FetchDatastreamsCanada(Things_Data, Device_ID, cityName){

		var PromArr = [];

		//for(i = 0; i < Things_Data_Arr.value.length; i++){

								var datastreams_url = Things_Data["Datastreams@iot.navigationLink"];
								//var Device_ID = Things_Data_Arr.value[i]["@iot.id"];
								cndThDtStreams[cityName][Device_ID] = {};

								PromArr.push(fetch(datastreams_url).then(function(response) {
									if (!response.ok) {
										EnableSearchButton();
										throw Error(response.statusText);
									}
									return response;})
									.then((response) => response.json())
										.then(function(data){

												//var sensor_datastreams_arr = clone(data.value);
												return data.value;
												
										}))

										

		//}


		        var Prom_Obsvs = [];

				var Prom_DtStreams = Promise.all(PromArr).then(function(values){
					
					//console.log("values array size a " +values.length);

					for(j = 0 ; j < values.length ; j++){

						//console.log("value array size b " +values[j].length);

						for(l = 0 ; l < values[j].length ; l++){

							var sensor_id = values[j][l]["@iot.id"];
							var sensor_name = values[j][l].name;
							var sensor_description = values[j][l].description;
							var sensor_unit_measurement = values[j][l].unitOfMeasurement;
							var sensor_obsv_url = values[j][l]["Observations@iot.navigationLink"];

							cndThDtStreams[cityName][Device_ID][sensor_id] = {};

							cndThDtStreams[cityName][Device_ID][sensor_id].name=sensor_name;
							cndThDtStreams[cityName][Device_ID][sensor_id].description=sensor_description;
							cndThDtStreams[cityName][Device_ID][sensor_id].unitOfMeasurement=sensor_unit_measurement;

							
							Prom_Obsvs.push(FetchObservationsCanada(cityName,Device_ID,sensor_id,sensor_obsv_url));

						}
						//var Device_ID = Things_Data_Arr.value[j]["@iot.id"];
						


					}

				});

				var prom_obsv = Promise.all(Prom_Obsvs).then(function(values){


				});

		
				return prom_obsv;
						
	}


	function FetchObservationsCanada(cityName, device_id, sensor_id, obsv_url){

		

		var PromArr = [];
		
				// get "observations" (sensor measurements) of individual sensors of each things in each city
		
				PromArr.push(fetch(obsv_url+"?$top=2000").then(function(response) {  // get historical data
					if (!response.ok) {
						throw Error(response.statusText);
					}
					return response;})
					.then((response) => response.json())
						.then(function(data){
						
							return data.value;
						}))


				var prom_obsv = Promise.all(PromArr).then(function(values){

					cndThDtStreams[cityName][device_id][sensor_id].sensor_measurements = values[0].value;

				});

				return prom_obsv;

	}


	function FetchLocationsCanada(cityName, device_id, Things_Data){

		//var PromArr = [];
		

		
			var loc_url = Things_Data["Locations@iot.navigationLink"];
		

			// Template
			//var Prom_cty_cnd_th_el = fetch(urlhttp+cndCityParams[i]+nexturl).then(function(response) {
			//	if (!response.ok) {
			//		throw Error(response.statusText);
			//	}
			//	return response.json()
			//   });

			var prom_loc_el = fetch(loc_url).then(function(response) {
				if (!response.ok) {
					throw Error(response.statusText);
				}
				return response.json()});

				//PromArr.push(prom_loc_el);

		
					var prom_loc = Promise.all([prom_loc_el]).then(function(values){

						for(i=0;i<values.length;i++){
							cndThLoc[cityName][device_id] = clone(values[i].value[0].location.coordinates);
						}
						//console.log(values);
						
						//console.log(cndThLoc);
	
					});

				    return prom_loc;

	}




	/// Below for Nijmegen Smart Emission


	function FetchDatastreamsNijmegen(Things_Data, Device_ID){

		var PromArr = [];

		//for(i = 0; i < Things_Data_Arr.value.length; i++){

								var datastreams_url = cors_purl+(Things_Data["Datastreams@iot.navigationLink"]);
								//var Device_ID = Things_Data_Arr.value[i]["@iot.id"];
								SENijmThDtStreams[Device_ID] = {};

								PromArr.push(fetch(datastreams_url).then(function(response) {
									if (!response.ok) {
										throw Error(response.statusText);
									}
									return response;})
									.then((response) => response.json())
										.then(function(data){

												//var sensor_datastreams_arr = clone(data.value);
												return data.value;
												
										}))

										

		//}


		        var Prom_Obsvs = [];

				var Prom_DtStreams = Promise.all(PromArr).then(function(values){
					
					//console.log("values array size a " +values.length);

					for(j = 0 ; j < values.length ; j++){

						//console.log("value array size b " +values[j].length);

						for(l = 0 ; l < values[j].length ; l++){

							var sensor_id = values[j][l]["@iot.id"];
							var sensor_name = values[j][l].name;
							var sensor_description = values[j][l].description;
							var sensor_unit_measurement = values[j][l].unitOfMeasurement;
							var sensor_obsv_url = cors_purl+(values[j][l]["Observations@iot.navigationLink"]);

							SENijmThDtStreams[Device_ID][sensor_id] = {};

							SENijmThDtStreams[Device_ID][sensor_id].name=sensor_name;
							SENijmThDtStreams[Device_ID][sensor_id].description=sensor_description;
							SENijmThDtStreams[Device_ID][sensor_id].unitOfMeasurement=sensor_unit_measurement;

							Prom_Obsvs.push(FetchObservationsNijmegen(Device_ID,sensor_id,sensor_obsv_url));

						}
						//var Device_ID = Things_Data_Arr.value[j]["@iot.id"];
						


					}

				});

				var prom_obsv = Promise.all(Prom_Obsvs).then(function(values){


				});

		
				return prom_obsv;
						
	}


	function FetchObservationsNijmegen(device_id, sensor_id, obsv_url){

		

		var PromArr = [];
		
				// get "observations" (sensor measurements) of individual sensors of each things in each city
		
				PromArr.push(fetch(obsv_url+"?$top=2000").then(function(response) {  // get historical data
					if (!response.ok) {
						EnableSearchButton();
						throw Error(response.statusText);
					}
					return response;})
					.then((response) => response.json())
						.then(function(data){
						
							return data.value;
						}))


				var prom_obsv = Promise.all(PromArr).then(function(values){

					SENijmThDtStreams[device_id][sensor_id].sensor_measurements = values[0].value;

				});

				return prom_obsv;

	}


	function FetchLocationsNijmegen(device_id, Things_Data){

		var PromArr = [];

		
			var loc_url = cors_purl+(Things_Data["Locations@iot.navigationLink"]);
		

			// Template
			//var Prom_cty_cnd_th_el = fetch(urlhttp+cndCityParams[i]+nexturl).then(function(response) {
			//	if (!response.ok) {
			//		throw Error(response.statusText);
			//	}
			//	return response.json()
			//   });

			var prom_loc_el = fetch(loc_url).then(function(response) {
				if (!response.ok) {
					EnableSearchButton();
					throw Error(response.statusText);
				}
				return response.json()});

				PromArr.push(prom_loc_el);

		
					var prom_loc = Promise.all(PromArr).then(function(values){

						for(i=0;i<values.length;i++){
							SENijmThLoc[device_id] = clone(values[i].value[0].location.coordinates);
						}
						//console.log(values);
						
						console.log(SENijmThLoc);
	
					});

				    return prom_loc;

	}

 function clearRegistry() {

tempPA={};
tempSC={};
	tempOSM={};
tempSSant={};
tempThingSpeak=[];
	
tempDweet=[];
	
	tempOAQ=[];
	
 cndTh = {};
	 cndThLoc = {};
	 cndThDtStreams = {};
	
	 SENeth = {};
	
	 SENijmTh = [];   
	 SENijmThLoc = {};
	 SENijmThDtStreams = {};
	
	 allThingsPreviewDB=[];
	
	 all_Query_Proms = [];

	 tempSafecast = [];

	 allThingsPreviewDB=[];

	 tempBCN=[];

	 tempEnglFlood=[];

	
 }

 function DisableSearchButton(){
	document.getElementById("SearchButton").style.color = "gray";
	document.getElementById("SearchButton").disabled = true;
	document.getElementById("SearchButton").innerHTML= "Searching";
 }

 function EnableSearchButton(){
	document.getElementById("SearchButton").disabled = false;
	document.getElementById("SearchButton").style.color = "black";
	document.getElementById("SearchButton").innerHTML= "Search!";
 }

 function EnableMobileThingsVis(){
	document.getElementById("mobileThingsDraw").disabled = false;
	document.getElementById("mobileThingsDraw").style.color = "black";
	//document.getElementById("mobileThingsDraw").value= "Search!";
 }

 function DisableMobileThingsVis(){
	document.getElementById("mobileThingsDraw").disabled = true;
	document.getElementById("mobileThingsDraw").style.color = "gray";
	//document.getElementById("mobileThingsDraw").value= "Search!";
 }

 function EnableStationaryMobileThingsSelection(){
	document.getElementById("StationaryOrMobile").disabled = false;

	//document.getElementById("mobileThingsDraw").value= "Search!";
 }

 function DisableStationaryMobileThingsSelection(){
	document.getElementById("StationaryOrMobile").disabled = true;
	
	//document.getElementById("mobileThingsDraw").value= "Search!";
 }

 function StartSearch(){
	clearRegistry();
	fetchData();
 }

function StartApp() {
	var prom_worldwindstart = StartWorldWind();

	Promise.all([prom_worldwindstart]).then(function(values){

		setTimeout(fetchData,250);
		//var prom_fetch_data = fetchData();
	});
	//console.log("Triggering search....");
	
}

async function ExtractAllThingsLocation(){

	// Extract from SmartCitizen

	for(i=0;i<tempSC.length;i++){
		allThingsPreviewDB.push({
			// Relevant parameters would go here
			"name" : tempSC[i].name,
			"latitude" : tempSC[i].latitude,
			"longitude" : tempSC[i].longitude,
			"cityName" : tempSC[i].city,
			"lastSeen" : tempSC[i]["last_reading_at"],
			"providerID": "smartcitizen",
			"deviceID": tempSC[i].id,
			"thingTag": ["air quality","air","environment"]
		});
		/*
		allThingsPreviewDB[tempSC[i].name] = {
			// Relevant parameters would go here
			"latitude" : tempSC[i].latitude,
			"longitude" : tempSC[i].longitude
		};
		*/
	}
	delete tempSC;

	console.log(allThingsPreviewDB);

	// Extract from OpenSenseMap
	// longitude = value[0];
	//latitude = value [1];

	for(i=0;i<tempOSM.length;i++){
		var sensorList = [];
		var thingTag = ["air quality","air","environment"];
		var OSMTh = {
			// Relevant parameters would go here
			"name" : tempOSM[i].name,
			"latitude" : tempOSM[i].currentLocation.coordinates[1],
			"longitude" : tempOSM[i].currentLocation.coordinates[0],
			"providerID" : "opensensemap",
			"channelID":tempOSM[i]["_id"],
			//"thingTag": ["air quality"],
			
		};
		for(j=0;j<tempOSM[i].sensors.length;j++){
			var sensorListDet = {
				"sensorID":tempOSM[i].sensors[j]["_id"],
				"Type" : tempOSM[i].sensors[j].title,
				"Unit" : tempOSM[i].sensors[j].unit,
				"Sensor" : tempOSM[i].sensors[j].sensorType,
			}
			thingTag.push(tempOSM[i].sensors[j].title);
			var dupl = (tempOSM[i].sensors[j].title).replace(".","");
			thingTag.push(dupl);
			if((tempOSM[i].sensors[j].lastMeasurement)){
				sensorListDet["Last Value"] =  tempOSM[i].sensors[j].lastMeasurement.value;
				sensorListDet["Last Seen"] = tempOSM[i].sensors[j].lastMeasurement.createdAt;
			} else {
				sensorListDet["Last Value"] =  "Data Not Available";
				sensorListDet["Last Seen"] = "Data Not Available";
			}
			
			sensorList.push(sensorListDet);
		}
		OSMTh.thingTag = thingTag;
		OSMTh["sensorList"] = sensorList;

		allThingsPreviewDB.push(OSMTh);

		
		/*
		allThingsPreviewDB[tempOSM[i].name] = {
			// Relevant parameters would go here
			"latitude" : tempOSM[i].currentLocation.coordinates[1],
			"longitude" : tempOSM[i].currentLocation.coordinates[0]
		};
		*/
	}

	delete tempOSM;

	console.log(allThingsPreviewDB);

	// Extract from Canada Smart City
	
    /*
	   for(i=0;i<cndCityParamsActual.length;i++){

		//console.log(cndCityParams[i]);
		//console.log(cndThLoc[cndCityParams[i]]);

		  for (var keys in cndThLoc[cndCityParamsActual[i]]) {
			  allThingsPreviewDB.push({
				// Relevant parameters would go here
				"name" : keys,
				"latitude" : cndThLoc[cndCityParamsActual[i]][keys][1],
				"longitude" : cndThLoc[cndCityParamsActual[i]][keys][0],
				"cityname_link" : cndCityParams[i],
				"cityname_actual" : cndCityParamsActual[i],
				"providerID" : "smartcanada"
			  });
		  }
			/*
			for (var keys in cndThLoc.cndCityParams[i]) {
			allThingsLocDB[keys] = {
				// Relevant parameters would go here
				"latitude" : cndThLoc.cndCityParams[i][keys][1],
				"longitude" : cndThLoc.cndCityParams[i][keys][0]
			};
			
	
	  }
      */
	  // Extract from Dweet (only latest 500 devices who tweeted), only search those which has gps data
	  // this task has been done during queries


	  //allThingsPreviewDB = allThingsPreviewDB.concat(tempDweet);
	  

	  // Extract from SmartSantander
	  
	  //extract info template
	  /*
	  var el = document.createElement( 'html' );
		el.innerHTML = "<html><head><title>titleTest</title></head><body><a href='test0'>test01</a><a href='test1'>test02</a><a href='test2'>test03</a></body></html>";

		el.getElementsByTagName( 'a' ); 
	  */

	  /*
	  for(i=0;i<tempSSant.length;i++){
	
			  // Relevant parameters would go here
			   tempSSant[i].name = tempSSant[i].id;
			   
			   tempSSant[i].providerID = "smartsantander";
			   delete tempSSant[i].id;
	  }
	  allThingsPreviewDB = clone(allThingsPreviewDB.concat(tempSSant));
	  */

	 console.log(allThingsPreviewDB);

	  // Extract from Smart Emission Netherlands
	  
	  for(i=0;i<SENeth.length;i++){
		var SENethArr = {};
		SENethArr.name = SENeth[i].properties.label;
		SENethArr.latitude = SENeth[i].geometry.coordinates[1];
		SENethArr.longitude = SENeth[i].geometry.coordinates[0];
		SENethArr.lastSeen = SENeth[i].properties["last_update"];
		SENethArr.providerID = "netherlandssmartemission";
		SENethArr.stationID = SENeth[i].properties.id;
		SENethArr.thingTag = ["air quality","air","environment"];
		allThingsPreviewDB.push(SENethArr);
	  }

	  // From ThingSpeak
	  //console.log(tempThingSpeak);
	  allThingsPreviewDB = allThingsPreviewDB.concat(tempThingSpeak);
	  console.log(allThingsPreviewDB);

	  delete tempThingSpeak;
	  // from Open AQ

	  allThingsPreviewDB = allThingsPreviewDB.concat(tempOAQ);

	  delete tempOAQ;

	  console.log(allThingsPreviewDB);

	  //Barcelona smart city
	  
	  for(i=0;i<tempBCN.length;i++){

		var BCNArrEl = {};
		BCNArrEl.name = tempBCN[i].id;
		BCNArrEl.latitude = tempBCN[i].centroid.latitude;
		BCNArrEl.longitude = tempBCN[i].centroid.longitude;
		BCNArrEl.thingTag = [(tempBCN[i].type).replace("_"," ")];
		BCNArrEl.providerID = "bcncat"
		allThingsPreviewDB.push(BCNArrEl);
	  }

	  delete tempBCN;

	  //England Environment Agency Flood Monitoring

	  for(i=0;i<tempEnglFlood.length;i++){

		var EnglFloodArrEl = tempEnglFlood[i];
		EnglFloodArrEl.name = tempEnglFlood[i].catchmentName+" Flood Monitoring Station";
		EnglFloodArrEl.latitude = tempEnglFlood[i].lat;
		EnglFloodArrEl.longitude = tempEnglFlood[i].lon;
		EnglFloodArrEl.country = "GB";
		
		delete tempEnglFlood[i].lat;
		delete tempEnglFlood[i].lon;

		EnglFloodArrEl.thingTag = ["river","water","flood","monitoring","disaster","flood monitoring","river flood","river flood monitoring"];
		EnglFloodArrEl.providerID = "engfloodenv"
		allThingsPreviewDB.push(EnglFloodArrEl);
	  }

	  delete tempEnglFlood;

	  // from SafeCast

	  for(i=0;i<tempSafecast.length;i++){
		var SafecastArrEl = {};
		var sensorList = [];

		SafecastArrEl.providerID = "safecast";
		SafecastArrEl.thingTag = ["air quality","air","environment","radiation","nuclear","alpha","gamma","nuclear radiation"];
		SafecastArrEl.latitude = tempSafecast[i].lat;
		SafecastArrEl.longitude = tempSafecast[i].lon;

		SafecastArrEl.lastSeen = tempSafecast[i].data[0]["time_series"][1]["end_date"];

		var combName = "";
		for (j=0;j<tempSafecast[i]["device_ids"].length;j++){
			combName = combName+tempSafecast[i]["device_ids"][j];
			if(j==tempSafecast[i]["device_ids"].length-1){

			} else {
				combName = combName+",";
			}
		}
		SafecastArrEl.name = combName;
		for(k=0;k<tempSafecast[i].data.length;k++){
			var sensorListDet={};
			sensorListDet.name = tempSafecast[i].data[k].unit;
			sensorListDet.unit = tempSafecast[i].data[k]["ui_display_unit_parts"].si;
			//uses the one that measures last 24h
			sensorListDet["Last Seen"] = tempSafecast[i].data[k]["time_series"][1]["end_date"];
			sensorListDet["Last Value"] = tempSafecast[i].data[k]["time_series"][1]["value_newest"];
			sensorListDet["Time Series Last 24 Hours"] = tempSafecast[i].data[k]["time_series"][1];
			sensorListDet["Time Series Last 30 Days"] = tempSafecast[i].data[k]["time_series"][0];
			sensorList.push(sensorListDet);
		}
		
		SafecastArrEl["sensorList"] = sensorList;

		allThingsPreviewDB.push(SafecastArrEl);
		
	  }

	  delete tempSafecast;

	  // from SafeCast radiation log

	  //allThingsPreviewDB = clone (allThingsPreviewDB.concat(tempSafecastRadLog));
	  
	  //copy to WorldWindManager for visualization purposes

	  console.log(allThingsPreviewDB);


}

async function QueryTSFeed(channel_id){

	var url = "https://api.thingspeak.com/channels/"+channel_id+"/feed.json";

	var prom = fetch(url).then(function(response) {
		if (!response.ok) {
			EnableSearchButton();
			throw Error(response.statusText);
		}
		return response.json()});

	var prom2 =	Promise.all([prom]).then(function(values){
			return values[0];
		});

		return prom2;
}

async function QuerySCFeed(channel_id){

	var url = "https://api.smartcitizen.me/v0/devices/"+channel_id;

	var prom = fetch(url).then(function(response) {
		if (!response.ok) {
			EnableSearchButton();
			throw Error(response.statusText);
		}
		return response.json()});

	var prom2 =	Promise.all([prom]).then(function(values){
			return values[0];
		});

		return prom2;
}

async function QueryEngFloodEnv(measureUrl){


	var prom = fetch(cors_purl+measureUrl).then(function(response) {
		if (!response.ok) {
			EnableSearchButton();
			throw Error(response.statusText);
		}
		return response.json()});

	var prom2 =	Promise.all([prom]).then(function(values){
			return values[0];
		});

		return prom2;
}

async function QueryNethSEFeed(station_id){

	var url = "http://data.smartemission.nl/sosemu/api/v1/timeseries?station="+station_id+"&expanded=true";

	var prom = fetch(url).then(function(response) {
		if (!response.ok) {
			EnableSearchButton();
			throw Error(response.statusText);
		}
		return response.json()});

	var prom2=Promise.all([prom]).then(function(values){
			return values[0];
		});

		return prom2;
}

async function QueryBCNCat(station_id){

	var url = "https://connecta.bcn.cat/connecta-catalog-web/component/map/"+station_id+"/lastOb/?ts="+Date.now().toString();

	var prom = fetch(cors_purl+url).then(function(response) {
		if (!response.ok) {
			EnableSearchButton();
			throw Error(response.statusText);
		}
		return response.json()});

	var prom2=Promise.all([prom]).then(function(values){
			return values[0];
		});

		return prom2;
}







