var options= '';
var pinnedPoint = '';
var str="";

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
                  console.log("probleme 2");

                 clearSuggestionList();
                    for (i=0 ; i<result.suggestedLocations.length; i++) {
                       var loc= result.suggestedLocations[i] ;
                        appendToList(loc.fullText);
                    }
                }
            },
            onFailure: function(error) {
                console.log("<p>" + error + "</p>");
            }
        });
    } catch (e) {
        console.log("<p>" + e + "</p>");
}
    }

}

function appendToList(item){
  console.log("probleme 1");
var list = document.getElementById("adresse");
var option = document.createElement('option');
   option.value = item;
   list.appendChild(option);
}

function pinPoint(){
  console.log("probleme 3");

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
    // traitement des resultats
    onSuccess  : function (result) {
     pinnedPoint = L.marker([result.locations[0].position.x,result.locations[0].position.y]);
     pinnedPoint.llat = result.locations[0].position.x;
     pinnedPoint.llon =result.locations[0].position.y;
     //console.log(array[i].lat+" , "+array[i].long);
     pinnedPoint.name = "adresse cherché"
     pinnedPoint.on('click' , function () {
       console.log("rer");
       $("#searchBtn").css("display", "initial");
       if(isOpenVolet())$("#openCloseBtn").click();
     });
     pinnedPoint.on('click' , toGoP);
     pinnedPoint.addTo(map);
     map.flyTo([result.locations[0].position.x,result.locations[0].position.y]);
     // map.setView([result.locations[0].position.x,result.locations[0].position.y],12);
    },
    onFailure: function(error) {
              alert("<p>" + ad+'/n'+error + "</p>");
    }
}) ;
  }
  console.log(ad+"hi");

}

function info(){
    console.log("hi--------------------------------------");
}

function clearSuggestionList(){
  var list = document.getElementById("adresse");
//$("#adresse option").remove();
  var length = list.options.length;
  for (i = 0; i < length; i++) {
list.removeChild(list.options[0]);
console.log("here-------------------------------------");
}
}
