// Dans cette page il y a tous les fonctionalités qui concerne la partie transport
// Déclaration des variables //
var arr  ;
var max=0;
var xmax=0;
var cntrlLayerT=false;
var schedule ;
var sCmp=0, x = "e",xx="r" ;
var sLength;
var storeData;
var dirSerched = "x";
var stationsPoints = new PruneClusterForLeaflet();
var globCmp = 0 ;
var clean=false;
////////////////////////////

function findStation() {
  if (process == 2){
    clearTable();
const url = "".concat("https://opendata.stif.info/api/records/1.0/download/?apikey=72c25d742a18ffe5b3808a420396018038ca8e21215e912e11c02ec2&dataset=emplacement-des-gares-idf-data-generalisee&format=json");
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    if(data.length> max){
     arr = Array(data.length);
     max = data.length;
    for(id in data)
  {
    var station = new Object();
    station.id = data[id].fields.gares_id;
    station.name = data[id].fields.nom_long;
    station.long= data[id].geometry.coordinates[0];
    station.lat = data[id].geometry.coordinates[1];
    station.mode = data[id].fields.mode;
    station.flag = data[id].fields.idrefliga;
    station.flagc = data[id].fields.idrefligc;
    station.res =  data[id].fields.res_com;
    arr[id]=station;
    }
    showTOnMap();
  }
  })
  .catch(function(error) {
    gestionError();
  });
  }
}

//////////////////// JQ section ////////////////////////////////

$("div").on("click",'.station', function () {
            var info = $(this).attr("data");
             st = info.split("|");
             n = st[0]; f = st[1];
             r= st[2];
             sCmp = 0;
             clearTable();
            findDetails(n,f,r);
      });

  $( 'input:radio' ).on( 'click', handleHoursPage );

  $(document).on('pagebeforeshow', '#hoursPage', function(){
    getStationInfo(storeData);
    clearT();
  });
////////////////////  ////////////////////

function stationMarker(name,info) {
  $("#stationName").html(name);
  $("#stationName").css('display', 'block');
  $("#transportBtn").css('display', 'block');
  if(isOpenVolet())$("#openCloseBtn").click();
  st = info.split("|");
  n = st[0]; f = st[1];
  r= st[2];
  sCmp = 0;
  clearTable();
 findDetails(n,f,r);
}

function showTOnMap (){
    var myIcon;
    var info;
  for (var i = 0; i < arr.length; i++) {
    info="".concat( arr[i].name , "|" , arr[i].flagc , "|" , arr[i].res);
    myIcon = iconType(arr[i].mode , arr[i].flag);
    var m = new PruneCluster.Marker(arr[i].lat, arr[i].long);
    m.data.llon = arr[i].long;
     m.data.llat = arr[i].lat;
     m.data.icon = myIcon;
     m.data.name = arr[i].name;
     m.data.info = info;
    stationsPoints.PrepareLeafletMarker = function(m, data) {
      m.setIcon(data.icon);
      m.on('click', function(){
      l = data.llon;
         lt =data.llat;
         toGo(l,lt,data.name);
         stationMarker(data.name,data.info);
      });
    };
    stationsPoints.RegisterMarker(m);
  }
  map.addLayer(stationsPoints);
}

function iconType(mode , flag) {
  var rerIcon = L.icon({
    iconUrl: 'css/img/RER.svg',
    iconSize: [21, 16],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14],
  });
  var metroIcon = L.icon({
    iconUrl: 'css/img/M.svg',
    iconSize: [21, 16],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14]
  });
  var trainIcon = L.icon({
    iconUrl: 'css/img/Train.svg',
    iconSize: [21, 16],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14]
  });
  var tIcon = L.icon({
    iconUrl: 'css/img/T.svg',
    iconSize: [21, 16],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14]
  });
  var stationIcon = L.icon({
    iconUrl: 'library/leaflet/images/station.png',
    iconSize: [29, 24],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14]
  });

  if (flag != undefined && flag.includes("/")) myIcon = stationIcon;
  else if(mode == "RER") myIcon =rerIcon;
  else if (mode == "Train") myIcon = trainIcon;
  else if (mode.includes("T")) myIcon = tIcon;
  else  myIcon = metroIcon;
      return myIcon;
}


function showLoader() {
  $.mobile.loading( "show", {
    text: "",
    textVisible: false,
    theme:  $.mobile.loader.prototype.options.theme,
    textonly: false,
    html: ""
  });
}
function hideLoader() {
  $.mobile.loading( "hide");
}

function findDetails(nom, code ,res) {
  showLoader();
  $("#error").hide();
  var splitStr;var splitStrCode;
  if (res.includes("/")){
    splitStr = res.split(" / ");
    splitStrCode = code.split("/");
  }else {
    schedule = new Array(1);
    findLineId(nom,code,res);
  }
  if(splitStr!= undefined){
    schedule = new Array(splitStr.length);
    for (var i = 0; i < splitStr.length; i++) {
        findLineId(nom,splitStrCode[i],splitStr[i]);
    }
  }
}

function findLineId(nom,code,res){
  var lineId
  var url = "".concat("https://opendata.stif.info/api/records/1.0/search//?dataset=referentiel-des-lignes-stif&q=id_line+%3D+"
  ,code );
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
      lineId = data.records[0].fields.externalcode_line;
      lDir = data.records[0].fields.shortname_groupoflines;
      findStopId(nom,lineId,res,lDir);
  })
  .catch(function(error) {
    gestionError();
  });
}

function findStopId(nom,lineId,res,lDir) {
  var stop_id;
  if (nom.includes(" ")){
    nomeSplit = nom.substring(nom.indexOf(" "),nom.length);
    var url = "".concat("https://opendata.stif.info/api/records/1.0/search//?dataset=liste-arrets-lignes-tc-idf&q=route_id+%3D+"
    ,lineId,"+AND+(stop_name%3D",nom,"+OR+stop_name%3D",nomeSplit,")" );
  }
  else{
      var url = "".concat("https://opendata.stif.info/api/records/1.0/search//?dataset=liste-arrets-lignes-tc-idf&q=route_id+%3D+"
  ,lineId,"+AND+stop_name%3D",nom );
}
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
      stop_id = data.records[0].fields.stop_id;
      showTDetails(lineId ,stop_id.substr(10),res,lDir);
  })
  .catch(function(error) {
    gestionError();
  });
}

function showTDetails(lId, sId,res,lDir){
  sCmp=0;
  var direction , xdirection , sens=1 , cmp=false , xcmp=false, time, xtime;
  var url = "".concat("https://api-lab-trone-stif.opendata.stif.info/service/tr-vianavigo/departures?apikey=17c0baa76194c0326559e43c7dafc1649159893c9b217601e59df887&line_id=",
  lId,"&stop_point_id=",sId);
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
          switch (data[0].sens) {
              case undefined:

                  direction = data[0].lineDirection;
                  time = data[0].time;
                  cmp=true;

                for(id in data){
                  if ( !xcmp && data[id].lineDirection != direction){
                    xdirection = data[id].lineDirection;
                    xtime = data[id].time;
                    xcmp=true;
                  }
                  if (xcmp && cmp ) break;
                }
              break;
              default:
              for(id in data){
              if(data[id].sens==1 && !cmp){
                direction = data[id].lineDirection;
                if(data[id].schedule == undefined) time = data[id].time;
                else time = data[id].schedule;
                cmp=true;
              }
              else if (data[id].sens == -1 && !xcmp){
                 xdirection = data[id].lineDirection;
                 if(data[id].schedule == undefined) xtime = data[id].time;
                 else xtime = data[id].schedule;

                 xcmp=true;
               }
               else if (xcmp && cmp ) break;
             }
           }
    var stationTime = new Object();
    stationTime.mode = res;
    stationTime.direction = direction;
    stationTime.time = time;
    stationTime.xdirection = xdirection;
    stationTime.xtime = xtime;
    schedule[sCmp]= stationTime;
   sCmp++;
    showTimeInTable(lId,sId,lDir);

  })
  .catch(function(error) {
    gestionError();
  });
}

function showTimeInTable(lId,sId,lDir) {
  var table = document.getElementById("timeTable");
  if(schedule[0].direction != x && schedule[0].xdirection != xx ){
    var row = table.insertRow(0);
    row.addEventListener('click', handleEvent);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
        x=  schedule[0].direction;
        xx=  schedule[0].xdirection;

    cell1.setAttribute('data',  schedule[0].mode +"|"+ lId + "|"+sId + "|"+lDir+ "|"+schedule[0].direction+ "|"+schedule[0].xdirection);
    cell2.setAttribute('data',  schedule[0].mode +"|"+ lId + "|"+sId + "|"+lDir+ "|"+schedule[0].direction+ "|"+schedule[0].xdirection);
    cell3.setAttribute('data',  schedule[0].mode +"|"+ lId + "|"+sId + "|"+lDir+ "|"+schedule[0].direction+ "|"+schedule[0].xdirection);
    path = modeImg(schedule[0].mode);
    hideLoader();
    cell1.innerHTML = '<img class="img-sz" src="'+path+'" />';
    cell2.innerHTML =  schedule[0].direction+"</br> "+schedule[0].time;
    cell3.innerHTML = schedule[0].xdirection+"</br> "+schedule[0].xtime;
    $("#tableTimeDiv").css("display", "initial");
    if(isOpenVolet())$("#openCloseBtn").click();

  }
}

function clearTable() {
  var table = table = document.getElementById("timeTable");
  lengthT =  document.getElementById("timeTable").rows.length;
  for (var i = 0; i < lengthT; i++) {
    table.deleteRow(i);
  }
  x="c" ; xx="r";
}

/////////////// functions for TRANSPORT HOURS TABLE PAGE ////////////////////////////
function handleEvent(e) {
    storeData = e.target.getAttribute('data');
    $.mobile.changePage("#hoursPage");
}


function getStationInfo(storedData) {
  strData = storedData.split("|");
  mode = strData[0];
  // line_id = strData[1] // stop_id = strData[2]; // direction = strData[4] // xdirection = strData[5]
  strDirection = strData[3];
  directions = strDirection.split(" - ");

  if (mode.charAt(0) == "M" || mode.charAt(0) == "T"  )
  {
    document.getElementById('labelDir1').innerHTML = strData[4];
    document.getElementById('labelDir2').innerHTML = strData[5];
    document.getElementById("direction1").value = "".concat(strData[4],"|",strData[1],"|",strData[2]);
    document.getElementById("direction2").value = "".concat(strData[5],"|",strData[1],"|",strData[2]);
  }else{
    document.getElementById('labelDir1').innerHTML = directions[0];
    document.getElementById('labelDir2').innerHTML = directions[1];
    document.getElementById("direction1").value = "".concat(directions[0],"|",strData[1],"|",strData[2]);
    document.getElementById("direction2").value = "".concat(directions[1],"|",strData[1],"|",strData[2]);
  }
  path = modeImg(mode);
  document.getElementById("img-time").src =path;
}

function modeImg(mode) {
  if(mode == "RER E" || mode == "RER C" || mode == "RER D" || mode.includes("LIGNE ")){
    if(mode.charAt(mode.length-1)==" ") path = "".concat("../css/img/",mode.substring(0,mode.length-1),".png");
    else path = "".concat("css/img/",mode,".png");
    return path;
  }else return path = "".concat("css/img/",mode,".svg");
}




function handleHoursPage() {
  var radios = document.getElementsByName('d');
    for (var i = 0; i < 2; i++) {
      if (radios[i].checked ){
         showLoader();
        clearT();
        showHours(radios[i].value);
      }
    }
}


function showHours(info) {
  globCmp= 0 ;
  var table = document.getElementById("hoursTable");
  clean = false;
  var sens; var times =new Object();
  infoPars = info.split("|");
  var directionSerched =  infoPars[0];
  var url ="".concat("https://api-lab-trone-stif.opendata.stif.info/service/tr-vianavigo/departures?apikey=17c0baa76194c0326559e43c7dafc1649159893c9b217601e59df887&line_id=",
  infoPars[1],"&stop_point_id=",infoPars[2]);
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    sens = findSensFromDirection(data,directionSerched);
    for (var i = 0; i < data.length; i++) {
      if (sens != 0){
        if (data[i].sens == sens){
          times.dir =  data[i].lineDirection;
          times.time = data[i].time;
          if (times.time == undefined) times.time =  data[i].schedule;
           var row = table.insertRow(globCmp);
           var cell1 = row.insertCell(0);
           var cell2 = row.insertCell(1);
          hideLoader();
            cell1.innerHTML = times.dir;
            cell2.innerHTML = times.time;
          globCmp ++;
        }gestionError();
      }else {
        if (data[i].lineDirection == dirSerched){
          times.dir =  data[i].lineDirection;
          times.time = data[i].time;
          if (times.time == undefined) times.time =  data[i].schedule;
           var row = table.insertRow(globCmp);
           var cell1 = row.insertCell(0);
           var cell2 = row.insertCell(1);
          hideLoader();
            cell1.innerHTML = times.dir;
            cell2.innerHTML = times.time;
          globCmp ++;
      }
    }
  }
    clean =true;
  })
  .catch(function(error) {
    gestionError();
  });
}

function findSensFromDirection(data ,directionSerched) {
  var sens=0;
  for (index in data){
    if (data[index].lineDirection.includes(directionSerched)){
      if(data[index].sens != undefined){
        return data[index].sens;
      }else {
        return 0;
      }
    }else {
      ss= directionSerched.split(/[\s-]+/);
      for (var i = 0; i < ss.length; i++) {
        if (data[index].lineDirection.toUpperCase().includes(ss[i].toUpperCase()+" ") && ss[i]!="St" && ss[i]!="la" && ss[i]!="Gare"){
        dirSerched= data[index].lineDirection ;
          if(data[index].sens != undefined){
            return data[index].sens;
          }else {
            return 0;
          }
        }
      }
    }
  }
  return 0;
}

function clearT() {
  $("#hoursTable tr").remove();
}



function gestionError() {
  hideLoader();
  $("#error").show('fade');

}

// ////////////////////////////////
