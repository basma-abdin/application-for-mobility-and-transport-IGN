var resultDiv = document.getElementById("result");
var arr  ; var max=0; var xmax=0; var cntrlLayerT=false;
var schedule ; var sCmp=0, x = "e",xx="r" , sLength;
var storeData; var dirSerched = "x";
// var stationsPoints = L.layerGroup();
var stationsPoints = new PruneClusterForLeaflet();

var globCmp = 0 ; var clean=false;

function findStation() {
  if (process == 2){
    clearTable();
    console.log("find Station");
//  var dist = distance(center);
  // const url = "".concat("https://opendata.stif.info/api/records/1.0/download/?apikey=72c25d742a18ffe5b3808a420396018038ca8e21215e912e11c02ec2&dataset=emplacement-des-gares-idf-data-generalisee&geofilter.distance=",center.lat,"%2C++",center.lng,"+%2C+",dist,"&format=json");
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
    //affiche();
  }
  })
  .catch(function(error) {
    gestionError()
    console.log("XXX "+error);
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
    console.log("test page "+storeData);
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
  //cntrlLayerT= true;
//  stationsPoints =  new L.MarkerClusterGroup();
    var myIcon;
    var info;
  for (var i = 0; i < arr.length; i++) {
    info="".concat( arr[i].name , "|" , arr[i].flagc , "|" , arr[i].res);
    myIcon = iconType(arr[i].mode , arr[i].flag);
    var m = new PruneCluster.Marker(arr[i].lat, arr[i].long);
    //var m = L.marker([arr[i].lat, arr[i].long],  {icon: myIcon  });
    m.data.llon = arr[i].long;
     m.data.llat = arr[i].lat;
     m.data.icon = myIcon;
     m.data.name = arr[i].name;
     m.data.info = info;
    // m.data.info = "Nom de station : "+arr[i].name+'<br/><a href = "#" class="station" data = "' +info + '" ' + '>Horraires</a>';
    stationsPoints.PrepareLeafletMarker = function(m, data) {
    m.setIcon(data.icon);
    m.on('click', function(){
    l = data.llon;
       lt =data.llat;
       toGo(l,lt,data.name);
       stationMarker(data.name,data.info);
    });
    // if (m.getPopup()) {
    //     m.setPopupContent(data.info);
    // } else {
    //     m.bindPopup(data.info);
    // }
};


  // m.data.icon =myIcon;
  //  m.data.popup = "Nom de station : "+arr[i].name+'<br/><a href = "#" class="station" data = "' +info + '" ' + '>Horraires</a>';
    stationsPoints.RegisterMarker(m);
   }
   map.addLayer(stationsPoints);
   // stationsPoints.addTo(map);
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
  // document.getElementById("tabletimeDiv").style.display = "initial";
  // document.getElementById("routeDiv").style.display = "none";
  showLoader();
  $("#error").hide();
  console.log(nom+"---"+code+"---"+res);
  var splitStr;var splitStrCode;
  if (res.includes("/")){
    // schedule = new Array(splitStr.length);
    splitStr = res.split(" / ");
    splitStrCode = code.split("/");
  }else {
    schedule = new Array(1);
    findLineId(nom,code,res);
  }
  if(splitStr!= undefined){
    schedule = new Array(splitStr.length);
    for (var i = 0; i < splitStr.length; i++) {
        console.log("findDetailsxxxxxxxxxx{"+splitStr[i]);
        findLineId(nom,splitStrCode[i],splitStr[i]);
    }
  }
  //showTimeInTable();
}
/////////https://opendata.stif.info/api/records/1.0/search//?dataset=liste-arrets-lignes-tc-idf&q=route_id+%3D+810%3AA+AND+stop_name%3DCHATELET&sort=stop_lat
///////https://opendata.stif.info/api/v1/console/records/1.0/search//?dataset=referentiel-des-lignes-stif&sort=&q=id_line+%3D+C01742

function findLineId(nom,code,res){
  var lineId
  var url = "".concat("https://opendata.stif.info/api/records/1.0/search//?dataset=referentiel-des-lignes-stif&q=id_line+%3D+"
  ,code );
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
      lineId = data.records[0].fields.externalcode_line;
      lDir = data.records[0].fields.shortname_groupoflines;
      console.log("findLineId " + lineId);
      findStopId(nom,lineId,res,lDir);
  })
  .catch(function(error) {
    gestionError();
    console.log("XXX "+error);
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
      console.log(stop_id);
      console.log("findStopId " + stop_id.substr(10));
      showTDetails(lineId ,stop_id.substr(10),res,lDir);
  })
  .catch(function(error) {
    gestionError()
    console.log("XXX "+error);
  });
}

function showTDetails(lId, sId,res,lDir){
  sCmp=0;
  console.log(lId + " // "+sId + " // "+res);
  var direction , xdirection , sens=1 , cmp=false , xcmp=false, time, xtime;
  var url = "".concat("https://api-lab-trone-stif.opendata.stif.info/service/tr-vianavigo/departures?apikey=17c0baa76194c0326559e43c7dafc1649159893c9b217601e59df887&line_id=",
  lId,"&stop_point_id=",sId);
  console.log(url);
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
    console.log(direction + " || "+ xdirection);
    var stationTime = new Object();
    stationTime.mode = res;
    stationTime.direction = direction;
    stationTime.time = time;
    stationTime.xdirection = xdirection;
    stationTime.xtime = xtime;
    schedule[sCmp]= stationTime;
   sCmp++;
    console.log("apres"+sCmp);
    showTimeInTable(lId,sId,lDir);

  })
  .catch(function(error) {
    gestionError()
    console.log("XXX "+error);
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
      console.log( "[ " +
    schedule[0].mode +" _ "+
    schedule[0].direction  +" _ "+
    schedule[0].time  +" _ "+
    schedule[0].xdirection +" _ "+
    schedule[0].xtime  +" ] "
  );
    cell1.setAttribute('data',  schedule[0].mode +"|"+ lId + "|"+sId + "|"+lDir+ "|"+schedule[0].direction+ "|"+schedule[0].xdirection);
    cell2.setAttribute('data',  schedule[0].mode +"|"+ lId + "|"+sId + "|"+lDir+ "|"+schedule[0].direction+ "|"+schedule[0].xdirection);
    cell3.setAttribute('data',  schedule[0].mode +"|"+ lId + "|"+sId + "|"+lDir+ "|"+schedule[0].direction+ "|"+schedule[0].xdirection);
    path = modeImg(schedule[0].mode);
    console.log("show time"+path);
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

/////////////// functions for seconde page ////////////////////////////
function handleEvent(e) {
  console.log("row clicked");
    console.log(e.target.getAttribute('data')+" HERE");
    storeData = e.target.getAttribute('data');
    // $.mobile.changePage("#test");
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
  console.log(path);
  document.getElementById("img-time").src =path;

}

function modeImg(mode) {
  if(mode == "RER E" || mode == "RER C" || mode == "RER D" || mode.includes("LIGNE ")){
    if(mode.charAt(mode.length-1)==" ") path = "".concat("../css/img/",mode.substring(0,mode.length-1),".png");
    // else if (mode.charAt(0)==" ") path = "".concat("../css/img/",mode.substring(1,mode.length),".png");
    else path = "".concat("css/img/",mode,".png");
    console.log(path);
    return path;
  }else return path = "".concat("css/img/",mode,".svg");
}




function handleHoursPage() {
  var radios = document.getElementsByName('d');
    console.log(99);
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
  console.log("yah");
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
    console.log("SENS = "+ sens);
    for (var i = 0; i < data.length; i++) {
      if (sens != 0){
        if (data[i].sens == sens){
          console.log("dferfzrertrtyg"+data[i].lineDirection);
          times.dir =  data[i].lineDirection;
          times.time = data[i].time;
          if (times.time == undefined) times.time =  data[i].schedule;
          console.log("ici"+ times.dir + " fdf " + times.time);
           var row = table.insertRow(globCmp);
           var cell1 = row.insertCell(0);
           var cell2 = row.insertCell(1);
          hideLoader();
            cell1.innerHTML = times.dir;
            cell2.innerHTML = times.time;
          console.log(globCmp);
          globCmp ++;
        }gestionError();
      }else {
        if (data[i].lineDirection == dirSerched){
          console.log("iui"+data[i].lineDirection);
          times.dir =  data[i].lineDirection;
          times.time = data[i].time;
          if (times.time == undefined) times.time =  data[i].schedule;
          console.log("ici"+ times.dir + " fdf " + times.time);
           var row = table.insertRow(globCmp);
           var cell1 = row.insertCell(0);
           var cell2 = row.insertCell(1);
          hideLoader();
            cell1.innerHTML = times.dir;
            cell2.innerHTML = times.time;
          console.log(globCmp);
          globCmp ++;
      }
    }
  }
    clean =true;
  })
  .catch(function(error) {
    gestionError()
    console.log("XXX "+error);
  });
}

function findSensFromDirection(data ,directionSerched) {
  var sens=0;
  console.log(directionSerched);
  for (index in data){
    if (data[index].lineDirection.includes(directionSerched)){
      if(data[index].sens != undefined){
        console.log("4545454887");
        console.log(data[index].sens);
        return data[index].sens;
      }else {
        console.log("77777777777777");
        return 0;
      }
    }else {
      console.log("s = "+directionSerched);
      ss= directionSerched.split(/[\s-]+/);
      console.log("ss = "+ss);
      for (var i = 0; i < ss.length; i++) {
        if (data[index].lineDirection.toUpperCase().includes(ss[i].toUpperCase()+" ") && ss[i]!="St" && ss[i]!="la" && ss[i]!="Gare"){
        dirSerched= data[index].lineDirection ;
        console.log("ss[i] = "+ss[i]);
        console.log("dirSerched = "+dirSerched);
          if(data[index].sens != undefined){
            console.log("opop");
            console.log(data[index].sens);
            return data[index].sens;
          }else {
            console.log("xyz dirSerched = "+dirSerched);
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


// $( document ).on( "click", ".show-page-loading-msg", function() {
//     var $this = $( this ),
//         theme = $this.jqmData( "theme" ) || $.mobile.loader.prototype.options.theme,
//         msgText = $this.jqmData( "msgtext" ) || $.mobile.loader.prototype.options.text,
//         textVisible = $this.jqmData( "textvisible" ) || $.mobile.loader.prototype.options.textVisible,
//         textonly = !!$this.jqmData( "textonly" );
//         html = $this.jqmData( "html" ) || "";
// })


function affiche(){
  for (var i = 0; i < arr.length; i++) {
     n = "id = "+arr[i].id+" name = "+arr[i].name + "mode = "+arr[i].mode;

    resultStr+= "<p>" +n + "</p>" ;
  }
  resultDiv.innerHTML = "<p>" +   resultStr + "</p>";
}
