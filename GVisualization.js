//Written by Udayanto Dwi Atmojo

var cors_purl = "https://cors.io/?";

var clonedData = [];


function initVisualization(){
    google.charts.load('current', {packages: ['corechart', 'line']});
    google.charts.setOnLoadCallback(ObtainDataForChart);
}

function drawCrosshairs(revArr,yAxisLabel,htmlTag,needReverse) {
    var data = new google.visualization.DataTable();
    var revArrTimeFormttd = [];


    if(needReverse){
        revArr.reverse();

        for(i=0;i<revArr.length;i++){
        
            revArrTimeFormttd.push([new Date(revArr[i][0]),Number(revArr[i][1])]);
            clonedData.push([new Date(revArr[i][0]),revArr[i][1].toString().replace('.', ',')]);
        }

    } else {

        for(i=0;i<revArr.length;i++){
        
            revArrTimeFormttd.push([new Date(revArr[i][1]),Number(revArr[i][0])]);
            clonedData.push([new Date(revArr[i][1]),revArr[i][0].toString().replace('.', ',')]);
        }

    }

    

    //clonedData = clone(revArrTimeFormttd);

    console.log(revArrTimeFormttd);

      data.addColumn('datetime', 'Time Stamp');
      data.addColumn('number', yAxisLabel); 
      
      data.addRows(revArrTimeFormttd);

      var options = {
        hAxis: {
          title: 'Time'
        },
        vAxis: {
          title: yAxisLabel
        },
        colors: ['#a52714', '#097138'],
        crosshair: {
          color: '#000',
          trigger: 'selection'
        }
      };


      var chart_div = document.getElementById(htmlTag);

      

      var chart = new google.visualization.LineChart(chart_div);

      google.visualization.events.addListener(chart, 'ready', function () {

     //chart_img_div.innerHTML = '<img src="' + chart.getImageURI() + '">';
        console.log(chart_div.innerHTML);

        var chart_img_btn = document.createElement('button');
        chart_img_btn.type='button';
        chart_img_btn.id = 'btn_chart_png';
        var link = chart.getImageURI();
        //chart_img_btn.onclick = "window.open('"+link+"')";

        chart_img_btn.addEventListener('click', function() {
            window.open(link);
        }, false);

        chart_img_btn.innerHTML = "Generate Printable Chart";
        document.body.appendChild(chart_img_btn);
      });

      chart.draw(data, options);

    }

    function ObtainDataForChart(){
        var url = document.location.href,
        params = url.split('?')[1].split('&'),
        data = {}, tmp;
            for (var i = 0, l = params.length; i < l; i++) {
                tmp = params[i].split('=');
                data[tmp[0]] = tmp[1];
            }

            
            var providerID = data.providerID;
            
            delete data.providerID;

            if(providerID === "smartcitizen"){
                var channelID = data.channelID;
                delete data.channelID;

                var prom = QuerySCHistoricalData(channelID,data);
                //yAxisLabel = val["sensor_key"]
                Promise.all([prom]).then(function(values){
                    drawCrosshairs(values[0].readings, values[0]["sensor_key"],"chart_div",true);

                    document.getElementById("generateCSV").innerHTML = "Generate and Download CSV";
                    document.getElementById("generateCSV").disabled = false;
                });
            } else if(providerID === "opensensemap"){
                var channelID = data.channelID;
                var sensorID = data.sensorID;
                delete data.sensorID;
                delete data.channelID;

                var yAxisLabel = decodeURIComponent(data.yAxisLabelType)+" ("+decodeURIComponent(data.yAxisLabelUnit)+")";
                delete data.yAxisLabelType;
                delete data.yAxisLabelUnit;

                var prom = QueryOSMHistoricalData(channelID,sensorID,data);

                Promise.all([prom]).then(function(values){

                    //reconstruct measurements array so it's ready for plotting
                    var valArr=[];

                    if(values[0].length == 0){
                        var prom2 = QueryOSMHistoricalData(channelID,sensorID,{});

                        Promise.all([prom2]).then(function(values){
                            for(i=0;i<values[0].length;i++){
                                valArr.push([values[0][i].createdAt, values[0][i].value]);
                            }
                            drawCrosshairs(valArr,yAxisLabel,"chart_div",true);

                            document.getElementById("generateCSV").innerHTML = "Generate and Download CSV";
                            document.getElementById("generateCSV").disabled = false;
                        });

                    } else {
                        for(i=0;i<values[0].length;i++){
                            valArr.push([values[0][i].createdAt, values[0][i].value]);
                        }
                        drawCrosshairs(valArr,yAxisLabel,"chart_div",true);

                        document.getElementById("generateCSV").innerHTML = "Generate and Download CSV";
                        document.getElementById("generateCSV").disabled = false;
                    }
                    

                   
                });
            } else if(providerID === "openaq"){
                

                var prom = QueryOAQHistoricalData(data);

                Promise.all([prom]).then(function(values){

                    //reconstruct measurements array so it's ready for plotting
                    var valArr=[];

                    if(values[0].results.length>0){
                        
                        for(i=0;i<values[0].results.length;i++){
                            valArr.push([values[0].results[i].date.utc, values[0].results[i].value]);
                        }
                        drawCrosshairs(valArr,values[0].results[0].parameter+" ("+values[0].results[0].unit+")","chart_div",true);
    
                        document.getElementById("generateCSV").innerHTML = "Generate and Download CSV";
                        document.getElementById("generateCSV").disabled = false;

                    } else {
                        document.getElementById("generateCSV").innerHTML = "No data within the selected timeframe is available";
                    }

                    
                });

            } else if(providerID === "thingspeak"){

                var channelID = data.channelID;
                var fieldID = data.fieldID;
                delete data.channelID;
                delete data.fieldID;


                var prom = QueryTSHistoricalData(channelID, fieldID, data);

                Promise.all([prom]).then(function(values){

                    //reconstruct measurements array so it's ready for plotting
                    var valArr=[];
                    
                    if(values[0].feeds.length === 0){
                        var prom2 = QueryTSHistoricalData(channelID, fieldID, {});

                        Promise.all([prom2]).then(function(values){
                            for(i=0;i<values[0].feeds.length;i++){
                                valArr.push([values[0].feeds[i]["created_at"], values[0].feeds[i]["field"+fieldID]]);
                               

                                document.getElementById("generateCSV").innerHTML = "Generate and Download CSV";
                                document.getElementById("generateCSV").disabled = false;
                            }
                            drawCrosshairs(valArr,values[0].channel["field"+fieldID],"chart_div",true);
                        });
                    } else {
                        for(i=0;i<values[0].feeds.length;i++){
                            valArr.push([values[0].feeds[i]["created_at"], values[0].feeds[i]["field"+fieldID]]);
                           
                            document.getElementById("generateCSV").innerHTML = "Generate and Download CSV";
                            document.getElementById("generateCSV").disabled = false;
                        }
                        drawCrosshairs(valArr,values[0].channel["field"+fieldID],"chart_div",true);
                    }

                });
            } else if(providerID === "safecast"){
                var sensorUnitID = data.sensorUnitID;
                var deviceIDs = data.deviceID.split(",");

                var prom = QuerySafecastHistoricalData();

                Promise.all([prom]).then(function(values){
                
                    //string compare is much easier for this array
                    var dataToVis;
                    var dataTimeStampToVis = [];
                    var sensIDVal;

                    for(i=0;i<values[0].length;i++){
   

                        if(deviceIDs.length == values[0][i]["device_ids"].length){

                            if(deviceIDs.toString() ==  values[0][i]["device_ids"].toString()){

                                var sensArr = values[0][i]["data"];
                                for(k=0;k<sensArr.length;k++){
                                    if(sensorUnitID == sensArr[k].unit){
                                        dataToVis = values[0][i].data[k]["time_series"][0];
                                        sensIDVal = k;

                                        var timeStEl = new Date(dataToVis["start_date"]).getTime();
                                        
                                        for(l=0;l<29;l++){
                                            console.log(dataToVis.values[l]);
                                            //dataTimeStampToVis.push([values[0][i].data[k]["time_series"][0].values[l],new Date(timeStEl).toUTCString()]);
                                            dataTimeStampToVis.push([dataToVis["values"][l],new Date(timeStEl).toUTCString()]);
                                            timeStEl = timeStEl+86400;
                                        }
                                       
                                        //dataTimeStampToVis.push([values[0][i].data[k]["time_series"][0].values[29],new Date(dataToVis["end_date"]).toUTCString()]);
                                        dataTimeStampToVis.push([dataToVis["values"][29],new Date(dataToVis["end_date"]).toUTCString()]);
                                        
                                        //drawCrosshairs(values[0][i].data[sensIDVal]["time_series"][0], sensorUnitID+" ("+values[0][i].data[sensIDVal]["ui_display_unit_parts"].si+") ", "chart_div", false);
                                        drawCrosshairs(dataTimeStampToVis, sensorUnitID+" ("+values[0][i].data[sensIDVal]["ui_display_unit_parts"].si+") ", "chart_div", false);
                                        break;
                                    } 
                                }
                                break;
                                
                            }

                        }
                       
                        
                    }

                    

                });
                
            } else if(providerID === "bcncat"){
                var sensorID = data.sensorUnitID;

                var start_time = data.start;

                var end_time = data.end;

                var yAxis = data.yAxisLabelType+" ("+data.yAxisLabelUnit+")";

                
                //delete data.sensorUnitID;

                var deviceID = data.deviceID;
                //delete data.sensorUnitID;

                var prom = QueryBCNCatHistoricalData(deviceID,sensorID);
                //yAxisLabel = val["sensor_key"]
                Promise.all([prom]).then(function(values){

                    if(new Date(start_time).getTime()>=values[0].fromTime && new Date(start_time).getTime()<=values[0].toTime){

                    } else {
                        delete start_time;
                        start_time = new Date(values[0].fromTime).toISOString();
                    }
    
                    if(new Date(end_time).getTime()>=values[0].fromTime && new Date(end_time).getTime()<=values[0].toTime){
    
                    } else {
                        delete end_time;
                        end_time = new Date(values[0].toTime).toISOString();
                    }

                    var measurementArr = values[0].events;
                    var measurementToPlot = [];
                    for(j=0;j<measurementArr.length;j++){

                        if(measurementArr[j].time>=new Date(start_time).getTime() && measurementArr[j].time<=new Date(end_time).getTime()){
                            measurementToPlot.push([measurementArr[j].value,new Date(measurementArr[j].time).toUTCString()])
                        }

                    }

                    drawCrosshairs(measurementToPlot, yAxis,"chart_div",false);

                    document.getElementById("generateCSV").innerHTML = "Generate and Download CSV";
                    document.getElementById("generateCSV").disabled = false;
                });
            }

    }

    async function QuerySCHistoricalData(channelID, params){

        // example: var url = "https://api.smartcitizen.me/v0/devices/3773/readings?sensor_id=14&rollup=1h&from=2018-02-05&to=2018-04-18";
       
        /*
        var channelID = topPickedObject.userObject.channelID;
    
        var params = {
            "sensor_id" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
            "rollup": document.getElementById("spanTimeNum").value+document.getElementById("spanTimeUnit").options[(document.getElementById("spanTimeUnit")).selectedIndex].value,
            "from": document.getElementById("startTime").value,
            "to": document.getElementById("endTime").value
        }
    */
        
        var url = "https://api.smartcitizen.me/v0/devices/"+channelID+"/readings"+toHtmlQuery_(params);
        
        var prom = fetch(url).then(function(response) {
            if (!response.ok) {
                
                throw Error(response.statusText);
            }
            return response.json()});
    
            var prom2 = Promise.all([prom]).then(function(values){
                return values[0];
            });
            
            return prom2;
    }

    async function QueryOSMHistoricalData(channelID, sensorID, params){

        // example: var url = "https://api.smartcitizen.me/v0/devices/3773/readings?sensor_id=14&rollup=1h&from=2018-02-05&to=2018-04-18";
        
        /*
        var channelID = topPickedObject.userObject.channelID;
    
        var params = {
            "sensor_id" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
            "rollup": document.getElementById("spanTimeNum").value+document.getElementById("spanTimeUnit").options[(document.getElementById("spanTimeUnit")).selectedIndex].value,
            "from": document.getElementById("startTime").value,
            "to": document.getElementById("endTime").value
        }
    */
      
        var url = "https://api.opensensemap.org/boxes/"+channelID+"/data/"+sensorID+toHtmlQuery_NoURI(params);
        
        var prom = fetch(url).then(function(response) {
            if (!response.ok) {
                
                throw Error(response.statusText);
            }
            return response.json()});
    
            var prom2 = Promise.all([prom]).then(function(values){
                return values[0];
            });
            
            return prom2;
    }

    async function QueryOAQHistoricalData(params){

        // example: var url = "https://api.smartcitizen.me/v0/devices/3773/readings?sensor_id=14&rollup=1h&from=2018-02-05&to=2018-04-18";
        
        /*
        var channelID = topPickedObject.userObject.channelID;
    
        var params = {
            "location"=""
            "sensor_id" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
            "rollup": document.getElementById("spanTimeNum").value+document.getElementById("spanTimeUnit").options[(document.getElementById("spanTimeUnit")).selectedIndex].value,
            "date_from": document.getElementById("startTime").value,
            "date_to": document.getElementById("endTime").value
        }
    */
      
        var url = "https://api.openaq.org/v1/measurements"+toHtmlQuery_NoURI(params);
        
        var prom = fetch(url).then(function(response) {
            if (!response.ok) {
                
                throw Error(response.statusText);
            }
            return response.json()});
    
            var prom2 = Promise.all([prom]).then(function(values){
                return values[0];
            });
            
            return prom2;
    }

    async function QueryTSHistoricalData(channelID,fieldID,params){

        // example: var url = "https://api.smartcitizen.me/v0/devices/3773/readings?sensor_id=14&rollup=1h&from=2018-02-05&to=2018-04-18";
        
        /*
        var channelID = topPickedObject.userObject.channelID;
    
        var params = {
            "location"=""
            "sensor_id" : document.getElementById("selectSensor").options[(document.getElementById("selectSensor")).selectedIndex].value,
            "rollup": document.getElementById("spanTimeNum").value+document.getElementById("spanTimeUnit").options[(document.getElementById("spanTimeUnit")).selectedIndex].value,
            "date_from": document.getElementById("startTime").value,
            "date_to": document.getElementById("endTime").value
        }
    */
      
        //var url = "https://api.openaq.org/v1/measurements"+toHtmlQuery_NoURI(params);
        
        var url = "https://api.thingspeak.com/channels/"+channelID+"/field/"+fieldID+".json"+toHtmlQuery_NoURI(params);

        var prom = fetch(url).then(function(response) {
            if (!response.ok) {
                
                throw Error(response.statusText);
            }
            return response.json()});
    
            var prom2 = Promise.all([prom]).then(function(values){
                return values[0];
            });
            
            return prom2;
    }

    async function QuerySafecastHistoricalData(){

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
						//console.log(tempSafecast);
					

             })
             
             return safecast_dev_prom;

    }


    async function QueryBCNCatHistoricalData(deviceID,sensorID){

        var urlBCNCat = "https://connecta.bcn.cat/connecta-catalog-web/admin/sensor/lastObs/"+deviceID+"."+sensorID+"/?limit=200";

			var safecast_dev_prom = fetch(cors_purl+urlBCNCat).then(function(response) {
				if (!response.ok) {
					EnableSearchButton();
					throw Error(response.statusText);
				}
				return response;})
				.then((response) => response.json())
					 .then(function(data){

						return data;
						//console.log(tempSafecast);
					

             })
             
             return safecast_dev_prom;

    }

function toHtmlQuery_NoURI(obj) {return "?"+Object.keys(obj).reduce(function(a,k){a.push(k+"="+(obj[k]));return a},[]).join("&")};


function generateAndDownloadCSV(){

            // Building the CSV from the Data two-dimensional array
        // Each column is separated by ";" and new line "\n" for next row
        var csvContent = '';
        clonedData.forEach(function(infoArray, index) {
        dataString = infoArray.join(';');
        csvContent += index < clonedData.length ? dataString + '\n' : dataString;
        
        });

        // The download function takes a CSV string, the filename and mimeType as parameters
        
        var download = function(content, fileName, mimeType) {
        var a = document.createElement('a');
        mimeType = mimeType || 'application/octet-stream';

        if (navigator.msSaveBlob) { // IE10
            navigator.msSaveBlob(new Blob([content], {
            type: mimeType
            }), fileName);
        } else if (URL && 'download' in a) { //html5 A[download]
            a.href = URL.createObjectURL(new Blob([content], {
            type: mimeType
            }));
            a.setAttribute('download', fileName);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            location.href = 'data:application/octet-stream,' + encodeURIComponent(content); 
        }
        }

        download(csvContent, 'download.csv', 'text/csv;encoding:utf-8');


}


  

