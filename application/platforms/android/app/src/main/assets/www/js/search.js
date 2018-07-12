// Dans cette page il y a tous les fonctionalités qui concerne la partie RECHERCHE
// Déclaration des variables //
var options= '';
var pinnedPoint = '';
var str="";
/////////

function suggest(id) {
    var location = document.getElementById(id).value;
    if(location!=str){
    var resultDiv = document.getElementById("result");
    try {
        Gp.Services.autoComplete({
            text: location,
            apiKey: "rhr7qw2f1nz7irqkk63pxxrk",
            onSuccess: function(result) {
                if (result.suggestedLocations) {

                 clearSuggestionList();
                    for (i=0 ; i<result.suggestedLocations.length; i++) {
                       var loc= result.suggestedLocations[i] ;
                        appendToList(loc.fullText);
                    }
                }
            },
            onFailure: function(error) {
            }
        });
    } catch (e) {
}
    }

}

function appendToList(item){
var list = document.getElementById("adresse");
var option = document.createElement('option');
   option.value = item;
   list.appendChild(option);
}

function pinPoint(){

  handleProcess("search");
  clearSuggestionList();
   var resultDiv = document.getElementById("result");
  var ad =document.getElementById('location').value;
  str=ad;
  var list = document.getElementById("adresse").innerHTML="";
  if (ad==""){
   alert("Search is empty !!")
  }
  else {
    if(map.hasLayer(pinnedPoint)) map.removeLayer(pinnedPoint);
    Gp.Services.geocode ({
    apiKey : "rhr7qw2f1nz7irqkk63pxxrk",
    location : ad,
    onSuccess  : function (result) {
     pinnedPoint = L.marker([result.locations[0].position.x,result.locations[0].position.y]);
     pinnedPoint.llat = result.locations[0].position.x;
     pinnedPoint.llon =result.locations[0].position.y;
     pinnedPoint.name = "adresse cherché"
     pinnedPoint.on('click' , function () {
       $("#searchBtn").css("display", "initial");
       if(isOpenVolet())$("#openCloseBtn").click();
     });
     pinnedPoint.on('click' , toGoP);
     pinnedPoint.addTo(map);
     map.flyTo([result.locations[0].position.x,result.locations[0].position.y]);
    },
    onFailure: function(error) {
              alert("<p>" + ad+'/n'+error + "</p>");
    }
}) ;
  }
}

function clearSuggestionList(){
  var list = document.getElementById("adresse");
  var length = list.options.length;
  for (i = 0; i < length; i++) {
list.removeChild(list.options[0]);
}
}
