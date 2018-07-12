var latDest ; var lngDest;
var type="Pieton"; var mode="fastest" ;var layerRoute = L.geoJson();
var storeDataR; var tab; var testWay; var go = true; var banned = "none";
var code = 0; var nameToGo = "x" ; var adFromGo;
var compteur=0;
var oldPrecess;
 var fromAndTo = new L.featureGroup();
 var pointF =L.marker([0,0]);
 var temporaire =L.marker([0,0]);
/////////// JQury ///////////////////////

$('#modeMenu li').on('click', function(){
  console.log("uuuuu");
  console.log($(this).text());
});
$('#plusMenu li').on('click', function(){
  console.log($(this).text());
});
$('#banMenu li').on('click', function(){
  console.log($(this).text());
});

$("#modeMenu li a").click(function(){
  console.log(777);
  var selText = $(this).text();
  console.log(selText);
});


$(document).on('pagebeforeshow', '#details', function(){
  console.log("datails page "+storeDataR);
  clear();
  getRouteDetails(storeDataR);

});
$(document).on('pagebeforeshow', '#routePage', function(){
  console.log("code"+code);
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
    //to to alert
    $('#modalAlert').modal('show');
   }
   // smallMap();
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
    console.log(oldPrecess);
    handleProcess(oldPrecess);
   // handleView(oldPrecess);
}



function getModeMenu(m) {
  type=(m=='A pied')?"Pieton":"Voiture";
  console.log(type);
}
function getPlusMenu(t) {
  mode=(t=='Court')?"shortest":"fatest";
  console.log(mode);
}
function getBanMenu(b) {
  if(b == "Ponts") banned = "bridge"
  else if (b == "péages") banned = "toll"
  else if (b== "Tunnels") banned == "tunnel"
  else "none";
  console.log(banned);
}

function prepare() {
  console.log(222222 + nameToGo);
  code = 1;
}
function toGo(ln , lt , name) {
  console.log("clickd");
  // document.getElementById("goBtn").innerHTML = "ALLER";
  console.log(ln+" ttt "+lt);

  latDest = lt;
  lngDest = ln;
  nameToGo = name;
//  console.log("to go "+e.target.llat + " , "+e.target.llon);
}
function toGoP(e) {
  console.log("clickd");
  $("#goBtn").prop("disabled",false);

  latDest = e.target.llat;
  lngDest = e.target.llon;
  nameToGo = e.target.name;
}
//////////// TO DO Eviter
function getGoModalInfo() {
  fromAndTo.clearLayers();compteur=0;
  var adToGo; adFromGo =$("#fromInput").val() ; var toCoordLat, toCoordLon ; var fromCoord;
  console.log("getGoModalInfo");
  if (code == 1) {
    console.log("sos");
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
    if($("#toInput").val() == "") console.log("pop");
    else {
      adToGo = $("#toInput").val();
      console.log("adToGo");
      Gp.Services.geocode ({
      apiKey : "rhr7qw2f1nz7irqkk63pxxrk",
      location : adToGo,
      // traitement des resultats
      onSuccess  : function (result) {
        console.log("BOBO");
       pinnedPoint = L.marker([result.locations[0].position.x,result.locations[0].position.y]);
       // pinnedPoint.llat = result.locations[0].position.x;
       toCoordLat = result.locations[0].position.x;
       latDest = result.locations[0].position.x;
       // pinnedPoint.llon =result.locations[0].position.y;
       toCoordLon= result.locations[0].position.y;
       lngDest= result.locations[0].position.y;
       console.log("toCoordLat : "+toCoordLat + " , "+ toCoordLon);
       fromAndTo.addLayer(pinnedPoint);
       pinnedPoint.addTo(map);
       if(adFromGo == "Votre localisation") {
         console.log("Votre localisation");
         // fromCoord = userLoc;
        // alert(userPoint.getLatLng()+"////"+userLoc);
         fromAndTo.addLayer(userPoint);
         calcuateRoute(userLoc,toCoordLat,toCoordLon,mode,type);
       }else {
        // adFromGo = $("#fromInput").val();
         console.log("adFromGo"+adFromGo);

         Gp.Services.geocode ({
         apiKey : "rhr7qw2f1nz7irqkk63pxxrk",
         location : adFromGo,
         // traitement des resultats
         onSuccess  : function (result) {
          pointF = L.marker([result.locations[0].position.x,result.locations[0].position.y]);
          // pointF.llat = result.locations[0].position.x;
          // pointF.llon =result.locations[0].position.y;
          fromCoord = L.latLng(result.locations[0].position.x,result.locations[0].position.y);
          fromAndTo.addLayer(pointF);
          console.log("fromCoord : "+fromCoord);
          pointF.addTo(map);
          console.log("hona");
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
    console.log(45);
 }
}

function calcuateRoute(userPos,destLat,destLng,mode,type) {
  console.log("calcuateRoute : "+userPos + " / "+destLat +" , "+destLng +" / "+ mode+" / " + type );
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
        console.log("log coco");
        resultDiv.innerHTML = "<p> coco" + error + "</p>";
      }
    });
  } catch (e) {
    console.log("log soso");
    resultDiv.innerHTML = "<p> soso" + e + "</p>"
  }
}

function tracer(result) {
  compteur++;
  console.log("now");
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
  //reSetRoute();

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
  console.log("HERE");
  data = sD[1].routeInstructions;
  console.log(sD[0]);
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
  console.log("startRouting");
  bigMap();
  userPoint.on("move",function () {
    if(go){
  //  document.getElementById("info").innerHTML = "dfg "+userPoint.getLatLng();
  calcuateRoute(userPoint.getLatLng(),latDest,lngDest,mode,type);
}
  })
}
function bigMap() {
  console.log("bigMap");
  $("#searchDiv").css("display", "none");
  if(!isOpenVolet())$("#openCloseBtn").click();
//  $("#map").css('height','70vh');
  $("#goStopBtn").html("ARRETER");
  $("#goStopBtn").attr('class','list-group-item list-group-item-danger route-response');
  map.setView(userPoint.getLatLng(),16);

}

function smallMap() {
 console.log("smallMap");
 go=false;
 $("#searchDiv").css("display", "initial");
 // $("#goStopBtn").html("ALLER");
 // $("#goStopBtn").attr('class','list-group-item list-group-item-success route-response');
 // $("#map").css('height','400px');
}
  $('#mo').modal('show');

function testDialog() {
  console.log("test dialo");
}
function lancer() {

  $('#mo').modal('show');
  console.log("mo");
}
