mapboxgl.accessToken = 'pk.eyJ1IjoiaW52YXRhIiwiYSI6ImNrZzJ1dWEwajAzc2MycXBqODhuNno3NncifQ.nv8IBftAxkfJEXmjFYyJ9w';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-79.4512, 43.6568],
    zoom: 13
});

var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    types: 'place, country',
    mapboxgl: mapboxgl
    // })
}).on('result', function ({ result }) {
    console.log(result.context['0'].short_code);
    // console.log(result.config.proximity['0'])
    // console.log(result.config.proximity['1'])
    var content = result.context['0'].short_code.slice(0, 2);
    // var country = result.text;
    // $('#countryName').html(country);
    $('#myImage').attr('src', "https://www.countryflags.io/" + content + "/shiny/64.png");
});

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));


map.addControl(new mapboxgl.NavigationControl());

map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    })
);

// geocoder.on('result', function (result) {
//     var content = result.context['0'].short_code.slice(0, 2);
//     $('#myImage').attr('src', "https://www.countryflags.io/" + content + "/shiny/64.png");
// })


// geocoder.on('results', function (results) {
//     console.log(results);
// })

function realtimeClock() {
    var rtClock = new Date();

    var hours = rtClock.getHours();
    var minutes = rtClock.getMinutes();
    var seconds = rtClock.getSeconds();

    var amPm = (hours < 12) ? 'AM' : 'PM';

    hours = (hours > 12) ? hours - 12 : hours;

    hours = ('0' + hours).slice(-2);
    minutes = ('0' + minutes).slice(-2);
    seconds = ('0' + seconds).slice(-2);

    document.getElementById('clock').innerHTML = hours + ' : ' + minutes + ' : ' + seconds + ' ' + amPm;

    var t = setTimeout(realtimeClock, 500);

}




