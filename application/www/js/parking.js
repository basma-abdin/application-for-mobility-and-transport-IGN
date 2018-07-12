//////////////////////////////
var resultStr;
var resultDiv = document.getElementById("result");
var array  ; var maxParking=0;
var pName  ; var pAd ; var pVille; var pCodePostal ;
var pNbrPlace; var pFreePlace; var pCarElectrique; var pHours;
// var parkingPoints =  L.layerGroup();
var parkingPoints = new PruneClusterForLeaflet();
/////////////////////////

function findParking(center) {
  if (process == 1){
    console.log("r");
  var dist = distance(center);
  // const url = "".concat("https://opendata.saemes.fr/api/records/1.0/download/?dataset=referentiel-parkings-saemes&sort=code_postal&geofilter.distance=",center.lat,"%2C++",center.lng,"+%2C+",dist,"&format=json");

url = 'https://opendata.saemes.fr/api/records/1.0/download/?dataset=referentiel-parkings-saemes&format=json';
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
//   if(data.length> maxParking){
     array = Array(data.length);
     maxParking = data.length;
    for(id in data)
  {
    var parking = new Object();
    parking.id = data[id].fields.code_parking;
    parking.name = data[id].fields.nom_parking;
    parking.long= data[id].geometry.coordinates[0];
    parking.lat = data[id].geometry.coordinates[1];
    array[id]=parking;
    console.log("here"+ id);
    }
    showOnMap();
//  }
  })
  .catch(function(error) {
    console.log(error);
  });
  }
}

function distance(center){
  console.log(center.lat+" fgfgg "+ center.lng);
  var distNe , distNw , distSe , distSw;
  distNe = map.distance(center,map.getBounds().getNorthEast());
  distNw = map.distance(center,map.getBounds().getNorthWest());
  distSe = map.distance(center,map.getBounds().getSouthEast());
  distSw = map.distance(center,map.getBounds().getSouthWest());
  var val=Math.max(distNe,distNw,distSe,distSw);
  console.log(val);
  return val;
}

////////////////////
$("div").on("click",'.marker', function () {
            var ID = $(this).attr("data");
            //showDetails(ID);
            showTwo(ID)
      });

// $("#goBtn").hide();
////////////////////

function showTwo(pId) {
  //https://opendata.saemes.fr/api/records/1.0/search/?dataset=places-disponibles-parkings-saemes&sort=nom_parking&facet=date&facet=nom_parking&facet=type_de_parc&facet=horaires_d_acces_au_public_pour_les_usagers_non_abonnes&facet=countertype&facet=counterfreeplaces&refine.nom_parking=Parking+Charl%C3%A9ty+Coubertin
  url = "".concat("https://opendata.saemes.fr/api/records/1.0/search/?dataset=places-disponibles-parkings-saemes&q=pmo_number+%3D+",pId
  ,"&sort=nom_parking&facet=date&facet=nom_parking&facet=type_de_parc&facet=horaires_d_acces_au_public_pour_les_usagers_non_abonnes&facet=countertype&facet=counterfreeplaces");
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    pFreePlace= data.records[0].fields.counterfreeplaces;
    console.log(pFreePlace);
  })
  .catch(function(error) {
    console.log(error);
  });
  showDetails(pId)

}

function showDetails(pId){
  var url = 'https://opendata.saemes.fr/api/records/1.0/search/?dataset=referentiel-parkings-saemes&q=code_parking%3D';
  var urll = url.concat(pId);

  fetch(urll)
  .then((resp) => resp.json())
  .then(function(data) {
    pName = data.records[0].fields.nom_parking;
    pAd = data.records[0].fields.adresse_principale_d_acces_vehicules;
    pVille = data.records[0].fields.ville;
    pCodePostal = data.records[0].fields.code_postal;
    pNbrPlace = data.records[0].fields.nombre_de_places;
    pCarElectrique = data.records[0].fields.bornes_de_recharge_vehicule_electrique;
    pHours = data.records[0].fields.horaires_d_acces_au_public_pour_les_usagers_non_abonnes;
    console.log(pCarElectrique);
    document.getElementById("parkingName").innerHTML = pName;
    resultStr = "";
    if (pAd != undefined) resultStr +=  "<p> Adresse: " + pAd+ ","+pVille + " "  +pCodePostal ;
    if (pHours != undefined)resultStr +="<br/> Horraires d'ouverture: "+pHours;
    if (pNbrPlace != undefined)resultStr +="<br/> Nombre de places  " +pNbrPlace;
    if (pFreePlace != undefined)resultStr += " dont "+pFreePlace+" est libre </p>"; else resultStr += "</p>";
    if(pCarElectrique != undefined ){
      if( pCarElectrique =="oui")$("#car").show();
      else  $("#car").hide();
    }
    // resultDiv.innerHTML = "<p>"  +resultStr+ "</p>";
    document.getElementById("parkInfo").innerHTML = resultStr;
    // $("#parking").modal('show');
    $("#parking").css("display", "initial");
    if(isOpenVolet())$("#openCloseBtn").click();
  })
  .catch(function(error) {
    console.log(error);
  });

}

function showOnMap (){

  var myIcon = L.icon({
    iconUrl: 'library/leaflet/images/parking.png',
    iconSize: [29, 24],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14]
    });

  for (var i = 0; i < array.length; i++) {
        var m = new PruneCluster.Marker(array[i].lat, array[i].long);
/////////////////////////////////
  m.data.llon = array[i].long;
   m.data.llat = array[i].lat;
   m.data.icon = myIcon;
   m.data.name = array[i].name;
   m.data.id = array[i].id;
   // m.data.info = "Nom de parking : "+array[i].name+' <a href = "#" class="marker" data = "' + array[i].id + '" ' + '><i class="fas fa-info-circle"></i></a>';
  parkingPoints.PrepareLeafletMarker = function(m, data) {
  m.setIcon(data.icon);
  m.on('click', function(){
  l = data.llon;
     lt =data.llat;
     showTwo(data.id);
     toGo(l,lt ,data.name );
  });
  };

//////////////////////

      parkingPoints.RegisterMarker(m);
   }
    map.addLayer(parkingPoints);

}
function affiche(){
  console.log("here");
  for (var i = 0; i < array.length; i++) {
    console.log("here"+ i);
     n = "id = "+array[i].id+" long = "+array[i].long;

    resultStr+= "<p>" +n + "</p>" ;
  }
  resultDiv.innerHTML = "<p>" +   resultStr + "</p>";
}



//
// var para = document.createElement("P");
// var t = document.createTextNode("dont "+ pFreePlace +" est libre ");
// para.appendChild(t);
// resultDiv.appendChild(para);
////////////////////////////////////////////////////////////////////////
