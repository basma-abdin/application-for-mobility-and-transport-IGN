// Dans cette page il y a tous les fonctionalités qui concerne la partie ITINÉRAIRE
// Déclaration des variables //
var latDest ;
var lngDest;
var type="Pieton";
var mode="fastest" ;
var layerRoute = L.geoJson();
var storeDataR;
var tab;
var testWay;
var go = true;
var banned = "none";
var code = 0;
var nameToGo = "x" ;
var adFromGo;
var compteur=0;
var oldPrecess;
var fromAndTo = new L.featureGroup();
var pointF =L.marker([0,0]);
var temporaire =L.marker([0,0]);

/////////// JQ SECTION ///////////////////////

$("#modeMenu li a").click(function(){
  var selText = $(this).text();
});

$(document).on('pagebeforeshow', '#details', function(){
  clear();
  getRouteDetails(storeDataR);

});
$(document).on('pagebeforeshow', '#routePage', function(){
  if(code==1 ){
    document.getElementById('toInput').value = nameToGo;
      $("#fromInput").prop('disabled', true);
      $("#toInput").prop('disabled', true);
  }
  else {
    code = 0;
    document.getElementById('toInput').value = "";
    $("#toInput").prop('disabled', false);
    $("#fromInput").prop('disabled', false);
  }
});


$("#goStopBtn").on("click",function () {
   if( $(this).html() == "ARRETER"  ){
    $('#modalAlert').modal('show');
   }
   else startRouting();
});

////////////////////////////////////////////////////
function stopNav() {
  $('#modalAlert').modal('hide');
  $("#searchDiv").css("display", "initial");
  go=false;
  if(layerRoute.getLayers().length >0) layerRoute.clearLayers();
   $("#goStopBtn").html("Démarer");
    $("#goStopBtn").attr('class','list-group-item list-group-item-success route-response');
    handleProcess(oldPrecess);
}



function getModeMenu(m) {
  type=(m=='A pied')?"Pieton":"Voiture";
}
function getPlusMenu(t) {
  mode=(t=='Court')?"shortest":"fatest";
}
function getBanMenu(b) {
  if(b == "Ponts") banned = "bridge"
  else if (b == "péages") banned = "toll"
  else if (b== "Tunnels") banned == "tunnel"
  else "none";
}

function prepare() {
  code = 1;
}
function toGo(ln , lt , name) {
  latDest = lt;
  lngDest = ln;
  nameToGo = name;
}
function toGoP(e) {
  $("#goBtn").prop("disabled",false);
  latDest = e.target.llat;
  lngDest = e.target.llon;
  nameToGo = e.target.name;
}
function getGoModalInfo() {
  fromAndTo.clearLayers();compteur=0;
  var adToGo; adFromGo =$("#fromInput").val() ; var toCoordLat, toCoordLon ; var fromCoord;
  if (code == 1) {
     temporaire = L.marker([latDest,lngDest]);
     fromAndTo.addLayer(temporaire);
     fromAndTo.addLayer(userPoint);
    calcuateRoute(userLoc,latDest, lngDest , mode, type);
    temporaire.addTo(map);
    oldPrecess = processName;
    handleProcess("route");
    code =0;
  }
  else {
    if($("#toInput").val() == "") console.log("la saisie de text est vide");
    else {
      adToGo = $("#toInput").val();
      Gp.Services.geocode ({
      apiKey : "rhr7qw2f1nz7irqkk63pxxrk",
      location : adToGo,
      // traitement des resultats
      onSuccess  : function (result) {
       pinnedPoint = L.marker([result.locations[0].position.x,result.locations[0].position.y]);
       toCoordLat = result.locations[0].position.x;
       latDest = result.locations[0].position.x;
       toCoordLon= result.locations[0].position.y;
       lngDest= result.locations[0].position.y;
       fromAndTo.addLayer(pinnedPoint);
       pinnedPoint.addTo(map);
       if(adFromGo == "Votre localisation") {
         fromAndTo.addLayer(userPoint);
         calcuateRoute(userLoc,toCoordLat,toCoordLon,mode,type);
       }else {
         Gp.Services.geocode ({
         apiKey : "rhr7qw2f1nz7irqkk63pxxrk",
         location : adFromGo,
         // traitement des resultats
         onSuccess  : function (result) {
          pointF = L.marker([result.locations[0].position.x,result.locations[0].position.y]);
          fromCoord = L.latLng(result.locations[0].position.x,result.locations[0].position.y);
          fromAndTo.addLayer(pointF);
          pointF.addTo(map);
          calcuateRoute(fromCoord,toCoordLat,toCoordLon,mode,type);
         },
         onFailure: function(error) {
                   alert("<p> err" +error + "</p>");
         }
       });
       }
      },
      onFailure: function(error) {
                alert("<p> errrrror"+error + "</p>");
      }
    });
    }
 }
}

function calcuateRoute(userPos,destLat,destLng,mode,type) {
  try {
    Gp.Services.route({
      startPoint: {
        x: userPos.lng,
        y: userPos.lat
      },
      endPoint: {
        x:destLng ,
        y: destLat
      },
      graph: type,
      avoidFeature: [],
      routePreference: mode,
      apiKey: "rhr7qw2f1nz7irqkk63pxxrk",
      onSuccess: tracer ,
      onFailure: function(error) {
      }
    });
  } catch (e) {
  }
}

function tracer(result) {
  compteur++;
  layerRoute.clearLayers();
  if(adFromGo != "Votre localisation") $("#goStopBtn").css("display", "none");
  if(adFromGo == "Votre localisation") $("#goStopBtn").css("display", "initial");
  if(compteur== 1)  map.fitBounds(fromAndTo.getBounds());
  document.getElementById("routeDiv").style.display = "initial";
    if(isOpenVolet() && !go)$("#openCloseBtn").click();

  time = convertSeconds(result.totalTime);
  km = result.totalDistance;
  icon=(type=="Voiture")?'<i class="fas fa-car">':'<i class="fas fa-walking"></i>';
  ht = '<h3 class="route-response">'+  icon + "  "+time + "  "+ km +'</h3>';
  document.getElementById("routeInfo").innerHTML = ht;
  layerRoute = L.geoJson(result.routeGeometry);
  layerRoute.addTo(map);
  storeDataR = [ht , result];
}

var convertSeconds = function(sec) {
          var hrs = Math.floor(sec / 3600);
          var min = Math.floor((sec - (hrs * 3600)) / 60);
          var seconds = sec - (hrs * 3600) - (min * 60);
          var result = (hrs);
          result += ":" + (min < 10 ? "0" + min : min);
          return result;
}

function getRouteDetails(sD) {
  data = sD[1].routeInstructions;
  var table = document.getElementById("routeDetails");
  for (var i = data.length-1 ; i >=0 ; i--) {
    row = table.insertRow(0);
    cell1 = row.insertCell(0);
    cell2 = row.insertCell(1);
    cell2.innerHTML = data[i].distance ;
    cell1.innerHTML = data[i].instruction;
  }
  document.getElementById("caption").innerHTML = sD[0];

}

function clear() {
  $("#routeDetails tr").remove();
}

function startRouting() {
  go=true;
  bigMap();
  userPoint.on("move",function () {
    if(go){
  calcuateRoute(userPoint.getLatLng(),latDest,lngDest,mode,type);
}
  })
}
function bigMap() {
  $("#searchDiv").css("display", "none");
  if(!isOpenVolet())$("#openCloseBtn").click();
  $("#goStopBtn").html("ARRETER");
  $("#goStopBtn").attr('class','list-group-item list-group-item-danger route-response');
  map.setView(userPoint.getLatLng(),16);

}

function smallMap() {
 go=false;
 $("#searchDiv").css("display", "initial");
}
