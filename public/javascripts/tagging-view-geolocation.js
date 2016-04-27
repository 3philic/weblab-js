var test = "";

jQuery(window).ready(function(){
            jQuery("#btnInit").click(initiate_geolocation);
        });

function initiate_geolocation() {
    test = jQuery("#btnInit").text();
    jQuery("#btnInit").text("Finding your location…");
    jQuery("#btnInit").attr("disabled", true);

    // actual start of geolacting
    navigator.geolocation.getCurrentPosition(handle_geolocation_query, handle_errors);
}

function handle_errors(error) {
    switch(error.code)
    {
        case error.PERMISSION_DENIED: alert("user did not share geolocation data");
        break;

        case error.POSITION_UNAVAILABLE: alert("could not detect current position");
        break;

        case error.TIMEOUT: alert("retrieving position timed out");
        break;

        default: alert("unknown error");
        break;
    }
}

function handle_geolocation_query(position) {
  /*
    alert('Lat: ' + position.coords.latitude + ' ' +
          'Lon: ' + position.coords.longitude);
  */
    jQuery("#btnInit").text(test);
    jQuery("#btnInit").attr("disabled", false);

    jQuery("#inputLatitude").val(position.coords.latitude);
    jQuery("#inputLongitude").val(position.coords.longitude);
}
