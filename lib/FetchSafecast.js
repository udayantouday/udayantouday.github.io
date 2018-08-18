var SafecastCache=[];


async function QuerySafecastMobThings(){
    
    var mobileThingsQueryPromise=[];

    var urlSCRadLog = "https://api.safecast.org/en-US/bgeigie_imports.json?by_status=done";
    
			 for(i=1;i<=848;i++){

				mobileThingsQueryPromise.push(fetch(urlSCRadLog+"&page="+i).then(function(response) {
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
									data[j].providerID = "safecastlog";
                                    SafecastCache.push(data[j]);
								}
								
				 }))

            }
            
            Promise.all(mobileThingsQueryPromise).then(function(values){
               
                
                /*$.ajax({
                    url: "/SafeCastCache.json",
                    dataType: 'json',
                    type: 'post',
                    contentType: 'application/json',
                    data: JSON.stringify(SafecastCache),
                    processData: false,
                    success: function( data, textStatus, jQxhr ){
                        $('#response pre').html( JSON.stringify( data ) );
                    },
                    error: function( jqXhr, textStatus, errorThrown ){
                        console.log( errorThrown );
                    }
                });
                */
               console.log(JSON.stringify(SafecastCache));
               document.getElementById("demo").innerHTML = JSON.stringify(SafecastCache);
                
            });
}


function WriteFile(content)
    {
        
        $.ajax({
            type: 'POST',
            url: "/SafeCastCache.json",//url of receiver file on server
            data: JSON.stringify({ Markers: content }), //your data
            success: function( data, textStatus, jQxhr ){
                
            },
            error: function( jqXhr, textStatus, errorThrown ){
                console.log( errorThrown );
            },
            dataType: "json" //text/json...
          });
          
        /*
        var FileOpener = new ActiveXObject("Scripting.FileSystemObject");
        var FilePointer = FileOpener.OpenTextFile("/SafeCastCache.json", 8, true);
        
        FilePointer.WriteLine(content);
        FilePointer.Close();
        */
    } 
    
    