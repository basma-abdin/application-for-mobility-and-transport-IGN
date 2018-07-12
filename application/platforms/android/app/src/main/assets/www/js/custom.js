
 var Lat=0; var Long=0; var process=0; var processName;
 var map, maxZoom=0; var lyrMaps;var forsearche;
 var center;
var watchID;
var markers; var userLoc = null;
var userIcon = L.icon({
  iconUrl: 'library/leaflet/images/parking.png',
  iconSize: [29, 24],
  iconAnchor: [9, 21],
  popupAnchor: [0, -14]
  });
// var userPoint = L.marker([Lat,Long],{ draggable : true});

// var userPoint = L.marker([Lat,Long],{icon: userIcon , draggable : true});
// var point = L.circleMarker([Lat,Long]).setRadius(5);
// var userPoint = L.userMarker(location.latlng, {pulsing:true});
var userPoint = L.userMarker([0,0], {pulsing:true});
userPoint.setAccuracy(10);


userPoint.once("move",function () {
  map.flyTo(userPoint.getLatLng());
})



document.addEventListener("backbutton", onBackKeyDown, false);
function onBackKeyDown() {
  history.back();
  return false;
}
// function getPosition() {
//     var options = {
//        enableHighAccuracy: true,
//        maximumAge: 3600000
//     }
//       watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
//       function onSuccess(position) {
//         Lat= position.coords.latitude;
//         Long= position.coords.longitude;
//         console.log(" getPosition    "+position.coords.latitude+" , "+position.coords.longitude);
//         userLoc = L.latLng(position.coords.latitude,position.coords.longitude);
//         center = L.latLng(position.coords.latitude,position.coords.longitude);
//         userPoint.setLatLng(userLoc);
//         map.flyTo(userPoint.getLatLng());
//       }
//       function onError(error) {
//         alert("erreur de localisation");
//       }
// }
 function getPosition() {
    var options = {
       enableHighAccuracy: true,
       maximumAge: 3600000
    }
    cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled){

    // alert("GPS location is " + (enabled ? "enabled" : "disabled"));
    if(enabled){
      watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
      function onSuccess(position) {
        Lat= position.coords.latitude;
        Long= position.coords.longitude;
        console.log(" getPosition    "+position.coords.latitude+" , "+position.coords.longitude);
        userLoc = L.latLng(position.coords.latitude,position.coords.longitude);
        center = L.latLng(position.coords.latitude,position.coords.longitude);
        userPoint.setLatLng(userLoc);
        map.flyTo(userPoint.getLatLng());
      }
      function onError(error) {
        alert("erreur de localisation");
      }

    }else {
      navigator.notification.confirm(
        'Allumez la localisation!', // message
        onConfirm,            // callback to invoke with index of button pressed
        'localisation'    // buttonLabels
      );
    }
}, function(error){
  console.error("error"+error);
});

  }
  function onConfirm(button) {
     // alert('You selected button ' + button);
    if(button == 1)
    {
      cordova.plugins.diagnostic.switchToLocationSettings();
      getPosition();
    }

  }


function watchPos(){

     watchID=navigator.geolocation.watchPosition(function(e){
       Lat=e.coords.latitude;Long=e.coords.longitude;
        center = L.latLng(e.coords.latitude, e.coords.longitude);
        userLoc = L.latLng(e.coords.latitude, e.coords.longitude);
        console.log(" watchPosition    "+e.coords.latitude+" , "+e.coords.longitude);
        userPoint.setLatLng(center);
   },function(error){

     // alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
 },
   { timeout: 100000 }
 );
}
///////////////Network ///////////////////////////
// if(!checkConnection()){
//   navigator.notification.confirm(
//     'Allumez la connection!', // message
//     opennet,            // callback to invoke with index of button pressed
//     'Connection reseaux'    // buttonLabels
//   );
// }
// function checkConnection() {
//     var networkState = navigator.connection.type;
//
//     var states = {};
//     states[Connection.UNKNOWN]  = 'ok';
//     states[Connection.ETHERNET] = 'ok';
//     states[Connection.WIFI]     = 'ok';
//     states[Connection.CELL_2G]  = 'ok';
//     states[Connection.CELL_3G]  = 'ok';
//     states[Connection.CELL_4G]  = 'ok';
//     states[Connection.CELL]     = 'ok';
//     states[Connection.NONE]     = 'non';
//     if(states[networkState] == 'non') return false;
//     return true;
//     // alert('Connection type: ' + states[networkState]);
// }
//
// function opennet(button) {
//    // alert('You selected button ' + button);
//   if(button == 1)
//   {
//     alert("here")
//     cordova.plugins.diagnostic.switchToWirelessSettings();
//
//   }
//
// }
///////////////////////////////////////////////////////
  Gp.Services.getConfig({
      apiKey : "rhr7qw2f1nz7irqkk63pxxrk",
      onSuccess : go
  }) ;

  function go() {
    var LatCentre=48.87357382650303; var LongCentre=2.2949297501728103;
        if (Lat != 0 || Long != 0 ){
          LatCentre=Lat;
          LongCentre=Long;
        } //>>>>>>>>>>>>>>>>>>>>>>>>>>>> TO DO Toast saying that loc undefinded
     map = L.map('map', {
      center: [LatCentre,LongCentre],
      zoom: 14,
      zoomControl: false,
      inertia : true
  });

      lyrMaps = L.geoportalLayer.WMTS({
          layer: "GEOGRAPHICALGRIDSYSTEMS.MAPS.BDUNI.J1",
      }, {
          opacity: 2
      });

       forsearche = L.geoportalLayer.WMTS({
      layer: "GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD",
    }, {
      opacity: 0.7
    });
    map.setMinZoom(7);
    map.setMaxZoom(18);
    map.addLayer(lyrMaps) ;
    map.addLayer(forsearche) ;


///////////////////////////
var customControl =  L.Control.extend({

  options: {
    position: 'topright'
  },

  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.style.backgroundColor = 'white';
    container.style.backgroundImage = '<img src = "css/img/loc.png"></img>';
    container.style.backgroundSize = "30px 30px";
    container.style.width = '20px';
    container.style.height = '20px';
    container.innerHTML = '<i class="fas fa-location-arrow"></i>'

    container.onclick = locateUser;

    return container;
  }
});
map.addControl(new customControl());
///////////
       var searchCtrl = L.geoportalControl.SearchEngine({});

      getPosition();
      userPoint.addTo(map);

        map.on("zoomend",handleVisibility);
        map.on("move",hideBtn);
  }

watchPos();


  function locateUser(){
    getPosition();
  }

function stopWatchPos(){
  navigator.geolocation.clearWatch(watchID);
}

function handleProcess(choice){
  $("#sidebar").panel("close");
  go = false;
  if(layerRoute.getLayers().length >0) layerRoute.clearLayers();
  if (choice == "parking") {
    console.log("parking choice");
      process = 1 ;
        map.removeLayer(stationsPoints);
        map.removeLayer(bikePoints);
        resetMarker();
        cntrlLayerT = false;
        clearTable();
      if(maxParking > 0 ){map.addLayer(parkingPoints); }
      else findParking (map.getCenter());
  }
  if (choice == "transport"){
    $("#formV").hide();
      process = 2 ;
       map.removeLayer(parkingPoints);
       map.removeLayer(bikePoints);
       resetMarker();
      if(max>0){ map.addLayer(stationsPoints); cntrlLayerT = true;}
      else {
          findStation();
            cntrlLayerT = true;
          }
  }
  if (choice == "velo"){
      process = 3
      map.removeLayer(parkingPoints);
      map.removeLayer(stationsPoints);
      resetMarker();

      // document.getElementById("tabletimeDiv").style.display = "none";
        // $("#formV").show('fade');
  }
  if(choice == "route"){
    process = 4;
    map.removeLayer(parkingPoints);
    map.removeLayer(stationsPoints);
    map.removeLayer(bikePoints);

  }
  if(choice == "map"){
    process = 5;
    map.removeLayer(parkingPoints);
    map.removeLayer(stationsPoints);
    map.removeLayer(bikePoints);
    resetMarker();
  }
  if(choice == "search"){
    process = 6;
    map.removeLayer(parkingPoints);
    map.removeLayer(stationsPoints);
    map.removeLayer(bikePoints);
  }
  handleView(process);
  console.log(choice);

}


function handleVisibility() {
    console.log("handleVisibility "+map.getZoom());
}

function locErr() {
  alter("Error when get location");
}

//////////////////// JQuery section ////////////////////

$("#parkingCoice").on('click',function () {
  console.log("parking clicked");
  processName = "parking";
  handleProcess(processName);
});
$("#veloCoice").on('click',function () {
  processName = "velo";
  console.log("valoCoice clicked");
  handleProcess(processName);
});
$("#transportCoice").on('click',function () {
  processName = "transport";
  console.log("transportCoice clicked");
  handleProcess(processName);
});
$("#routeChoice").on('click',function () {
  console.log("routeChoice clicked");
  processName ="route";
  handleProcess(processName);
});
$("#home").on('click',function () {
  console.log("routeChoice clicked");
  processName ="map";
  handleProcess(processName);
});
////////////////////////////// //

function hideBtn() {
//  $("#goBtn").hide();
   $("#goBtn").prop("disabled",true);
}
///////////////////////////////////

$("#parking").css("display", "none");

function handleView(p) {
  $("#searchDiv").css("display", "initial");
  $("#searchBtn").css("display", "none");
    if(!isOpenVolet())$("#openCloseBtn").click();
  switch (p) {
    case 1://parking
    $("#volet").css("display", "initial");
    resetTransportView();

    $("#bikeStation").css("display", "none");
    $("#routeDiv").css("display", "none");
    $("#formV").hide();

      break;
    case 2://transport
    $("#volet").css("display", "initial");
    $("#tabletimeDiv").css("display", "initial");
    $("#parking").css("display", "none");
    $("#bikeStation").css("display", "none");
    $("#routeDiv").css("display", "none");
    $("#formV").hide();
  //  route
      break;
    case 3: //velo
    $("#volet").css("display", "initial");
    resetTransportView();
    $("#parking").css("display", "none");
    $("#routeDiv").css("display", "none");
    $("#formV").show('fade');
  //  route
      break;
    case 4: //route
    $("#volet").css("display", "initial");
     resetTransportView();

    $("#parking").css("display", "none");
    $("#bikeStation").css("display", "none");

    $("#formV").hide();  //  route
      break;
    case 6:
    // $("#map").css('height','70vh');
    $("#volet").css("display", "initial");
    resetTransportView();

    $("#formV").hide();  //  route
      break;
    default:
     $("#volet").css("display", "none");
      $("#formV").hide();
    // $("#map").css('height','80vh');

  }

}
function resetTransportView() {
  $("#tabletimeDiv").css("display", "none");
  $("#stationName").css("display", "none");
  $("#tableTimeDiv").css("display", "none");
  $("#transportBtn").css("display", "none");
}
function resetMarker() {
  if(map.hasLayer(pinnedPoint)) map.removeLayer(pinnedPoint);
  if(map.hasLayer(pointF)) map.removeLayer(pointF);
  if(map.hasLayer(temporaire)) map.removeLayer(temporaire);
}

function openVolet() {
  $("#informationDiv").css("display", "initial");
  $("#openCloseBtn").attr('href',"#volet_clos");
  $("#openCloseBtn").attr('class','fermer btn btn-info');
  $("#openCloseBtn").attr('onclick','closeVlolet()');
  $("#openCloseBtn").html('<span class="glyphicon glyphicon-circle-arrow-down"></span>');
}
function closeVlolet() {
  $("#informationDiv").css("display", "none");
  $("#openCloseBtn").attr('href',"#volet");
  $("#openCloseBtn").attr('class','ouvrir btn btn-info');
  $("#openCloseBtn").attr('onclick','openVolet()');
  $("#openCloseBtn").attr('display','block');
  $("#openCloseBtn").html('<span class="glyphicon glyphicon-circle-arrow-up"></span>');
}
function isOpenVolet() {
 var test = $( "#openCloseBtn" ).attr( "href" );
 if(test == "#volet") {
   console.log("open");
   return true;
 }else {
   console.log("close");
   return false;
 }
}
