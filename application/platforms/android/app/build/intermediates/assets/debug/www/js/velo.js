
// var bikePoints =  L.layerGroup();
var bArray; var dataCreteil=false ; var dataCergy=false;
var dataJson;
// var bikePoints = new L.MarkerClusterGroup();
var bikePoints = L.layerGroup();

$( 'input:checkbox' ).on( 'click', handleVeloDirection );

function handleVeloDirection() {
  var choise = document.getElementsByName('choix');
    for (var i = 0; i < 2; i++) {
      if (choise[i].checked ){
          if(!dataCergy || !dataCreteil)getData(choise[i].value);
          else {
            if(choise[i].value =="Cergy-Pontoise" ){map.flyTo([49.045743, 2.049912],13); dataCergy = true;}
            else {map.flyTo([48.788755, 2.460953],13); dataCreteil=true;}
          }
      }
    }
}

function getData(city) {
  console.log("here"+city);
  var url =  "".concat("https://api.jcdecaux.com/vls/v1/stations?contract=",city,"&apiKey=1647052bec2041d2e1afbfcbb281637b7d7dfee8");
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    dataJson=data;
    bArray = new Array(data.length);
    for (index in data){
      console.log(index);
      var bStation = new Object();
      bStation.number = data[index].number ;
      bStation.name = data[index].contract_name;
      bStation.long = data[index].position.lng;
      bStation.lat = data[index].position.lat;
      bArray[index] = bStation;
    }
    showBOnMap();
  })
  .catch(function(error) {
    console.log("XXX "+error);
  });
}

function showBOnMap() {
  var bikeIcon = L.icon({
    iconUrl: 'css/img/velo.png',
    iconSize: [45, 40],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14],
  });

for (var i = 0; i < bArray.length; i++) {
  var n = bArray[i].number;
    var m = L.marker([bArray[i].lat, bArray[i].long],  {icon: bikeIcon  });
     m.number = n;
     m.llat = bArray[i].lat;
     m.llon =bArray[i].long;
     m.name = bArray[i].name;
     m.on('click' , getbStationInfo);
    // m.on('click' , toGoP);
    bikePoints.addLayer(m);
 }
 bikePoints.addTo(map);

 //map.addLayer(bikePoints);
 if(bArray[0].name == "Cergy-Pontoise") { map.flyTo([49.045743, 2.049912],13); dataCergy = true;}
 else {map.flyTo([48.788755, 2.460953],13); dataCreteil=true;}
}

$("#formVtext").on('click',function () {
  $("#formVchilde").show();
})

function getbStationInfo(e) {
  $("#formVchilde").hide();
  toGoP(e)
  console.log(e.target.number);
  url = "".concat("https://opendata.stif.info/api/records/1.0/search//?dataset=jcdecaux-bike-stations-data&q=number+%3D+",e.target.number);
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    // console.log(data.records[0].name);
    document.getElementById("bikeName").innerHTML = data.records[0].fields.name;
    document.getElementById("bikeInfo").innerHTML = "<h5>"+data.records[0].fields.status+"</h5>" +
    "<p>"+data.records[0].fields.available_bikes+" vélo disponibles </p>"+
    "<p> Adresse : "+data.records[0].fields.address+"</p>" ;
    // $("#bikeStation").modal('show');
    $("#bikeStation").css("display", "initial");
    if(isOpenVolet())$("#openCloseBtn").click();

  })
  .catch(function(error) {
    console.log("XXX "+error);
  });

}
