// AJAX
jQuery(window).ready(function(){
  jQuery("#formSearch").submit(function(){
    return false;
  });
});

function clickedSearchButton() {
  // clear old list items
  jQuery("#listLocations").html("");

  // AJAX
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      var json = JSON.parse(xhttp.responseText);
      for (var i = 0; i<json.length; i++) {
        var location = json[i];
        var locationHtml = "<h1>" + location["name"] + "</h1>";
        locationHtml = locationHtml + ("<li class='list'>" + "Latitude = " + location["lat"] + "</li>");
        locationHtml = locationHtml + ("<li class='list'>" + "Longitude = " + location["long"] + "</li>");
        locationHtml = locationHtml + ("<li class='list'>" + "Hash = " + location["hash"] + "</li>");
        var listHtml = "<p></p>" + locationHtml + "<p></p>";

        jQuery("#listLocations").append(listHtml);
      }
    }
  };

  var searchName = jQuery("#inputSearch").val();
  var requestUrl = "api/locations?name=" + searchName;
  xhttp.open("GET", requestUrl, true);
  xhttp.send();
}

// Google Maps

var myCenter = new google.maps.LatLng(51.508742, -0.120850);
function initialize() {
  var mapProp = {
    center: myCenter,
    zoom: 5,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById("googleMapContainer"), mapProp);

  // marker
  // get (again) per AJAX
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      var json = JSON.parse(xhttp.responseText);
      for (var i = 0; i<json.length; i++) {
        var location = json[i];
        var locationPosition = new google.maps.LatLng(location["lat"], location["long"]);
        var marker = new google.maps.Marker({
          position: locationPosition,
          label: (i+1).toString()
        });

        marker.setMap(map);
      }
    }
  };

  // var searchName = jQuery("#inputSearch").val();
  var searchName = "";
  var requestUrl = "api/locations?name=" + searchName;
  xhttp.open("GET", requestUrl, true);
  xhttp.send();
}

google.maps.event.addDomListener(window, 'load', initialize);
