// Maps

var url = './json/borders.json';
var arr = [];
var arr1 = [];

$("#autocomplete").autocomplete();

var map = L.map('map').setView([40.4637, 3.7492], 2.5);



var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



function style(feature) {
    return {
        fillColor: '',
        fillOpacity: 0,
        weight: 0,
        opacity: 1,
        color: ''
    };
}
var highlight = {
    'color': 'blue',
    'fillOpacity': 0,
    'weight': 4,
    'opacity': 1
};


function forEachFeature(feature, layer) {
    layer._leaflet_id = feature.properties.name;

    var content = feature.properties.iso_a2;
    var country = feature.properties.name;
    country = country.replace(/\s/g, '_');



    var popupContent = "<div id='countryP'><p><img src=https://www.countryflags.io/" + content + "/shiny/64.png width='30' height='30'>" + '&nbsp;&nbsp;' + "<b>Country: </b>" + feature.properties.name + '</div>' +
        "<div id='detailsP'><b>Capital: </b>" + "<span id='capital'></span>" +
        "<br><b>Population: </b>" + '<span id="population"></span>' + ' <span>people<span>' +
        "<br><b>Area of country: </b>" + '<span id="area"></span>' + ' <span>&#13218<span>' +
        "<br><b>Currency: </b>" + '<span id="currency"></span>' + '<span id="rate"></span></div>' +
        "<br><div id='weatherP'><b>Weather and time in capital</b>" + ':' +
        '<br><div id="wdetailsP"><img id="pic" width="35" height="35">' + '<span id="temp"></span> ' + '<span id="feels_like"></span>' + '.' + '<br>' + '&nbsp;' + '<img src="../images/sunrise.png" width="30" height="30">' + ' The next sunrise is at' + ' <span id="sunrise"></span>' + '<br>' + '&nbsp;' + '<img src="../images/sunset.png" width="30" height="30">' + ' The next sunset is at' + ' <span id="sunset"></span>' + '<br>' + '&nbsp;' + '<img src="../images/zone.png" id="timeZ" width="25" height="25">' + ' Time zone is ' + ' <span id="timeZone"></span>' + '<br>' + '&nbsp;' + '<img src="../images/time.png" id="timeC" width="25" height="25">' + ' Current time is' + ' <span id="time"></span></div>' +
        "<br><div id='wikiP'><b>Wikipedia page: </b>" + '<a href=https://en.wikipedia.org/wiki/' + country + ' target=_blank>Wikipedia</a>' + '</p></div>';



    layer.bindPopup(popupContent, {
        minWidth: 300,
        autoPan: false,

    });



    layer.on("click", function (e) {
        stateLayer.setStyle(style);
        layer.setStyle(highlight);
        map.fitBounds(layer.getBounds());
    });



}

var stateLayer = L.geoJson(null, { onEachFeature: forEachFeature, style: style });

var latC;
var lngC;

$.getJSON(url, function (data) {
    stateLayer.addData(data);

    for (i = 0; i < data.features.length; i++) {
        arr1.push({ label: data.features[i].properties.name, value: data.features[i].properties.iso_a2 });
    }
    addDataToAutocomplete(arr1);
});

stateLayer.addTo(map);


function addDataToAutocomplete(arr) {

    arr.sort(function (a, b) {
        var nameA = a.label, nameB = b.label;
        if (nameA < nameB)
            return -1;
        if (nameA > nameB)
            return 1;
        return 0;
    });

    $("#autocomplete").autocomplete("option", "source", arr);

    $("#autocomplete").on("autocompleteselect", function (event, ui) {
        polySelect(ui.item.label);
    });
}

function polySelect(a) {
    map._layers[a].fire('click');
    var layer = map._layers[a];
    map.fitBounds(layer.getBounds());
    latC = layer.getCenter().lat;
    lngC = layer.getCenter().lng;


}




// Markers and pop up info 


var urlW = './php/wiki.php';
var urlC = './json/capital.json';



$.getJSON(urlC, function (data) {


    var markers = L.markerClusterGroup({
        showCoverageOnHover: false
    });



    for (i = 0; i < data.length; i++) {

        var latt = data[i].geometry.coordinates[1];
        var longg = data[i].geometry.coordinates[0];
        var cPhoto = data[i].properties.photo;
        var nameP = data[i].properties.capital;
        var nameC = data[i].properties.country;
        var link = nameP.replace(/\s/g, '_');



        var marker = L.marker([latt, longg],
            { autoPan: true });
        marker.bindPopup(`<h3 id="nameP">${nameP}</h3><a href="${cPhoto}" target="_blank"><img id="cPhoto" src="${cPhoto}" width="150"></a><h6 id="history">Some intresting information from history about the country:</h6><p id="int"><img src="../images/loading.gif" width="210"></p><a href="https://en.wikipedia.org/wiki/${link},_${nameC}" target="_blank"><p id="seeM">Find out more about capital</p></a>`);

        markers.addLayer(marker);


    }

    map.addLayer(markers);


    markers.on('click', function (result) {
        var latitude = result.latlng.lat;
        var longitude = result.latlng.lng;
        map.setView(new L.LatLng((latitude + 0.2), longitude), 10);


        $.ajax({
            url: './php/wiki.php',
            type: 'POST',
            dataType: 'json',
            data: {
                lat: latitude,
                lng: longitude
            },
            success: function build(result) {

                var int = document.getElementById('int');

                var des = result.data;

                var fullT = [];

                for (i = 0; i < des.length; i++) {

                    var summary = des[i].summary;
                    var wikiU = des[i].wikipediaUrl;

                    var text = `<p>${summary} <a href="https://${wikiU}" target="_blank">more details</a></p>`;


                    fullT.push(text);

                }
                fullT = fullT.join(' ');
                int.innerHTML = fullT;
            }


        });

    });



});

// AJAX call on search bar

$("#autocomplete").on("autocompleteselect", function ({ result }, ui) {
    $.ajax({
        url: "php/countryInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: ui.item.value
        },
        success: function (result) {

            var capital;

            var code;

            var main;

            var temp;

            var hi;

            var lo;


            if (result.status.name == "ok") {

                $('#countryName').html(result.data[0].countryName);
                $('#capital').html(result.data[0].capital);
                $('#population').html(result.data[0].population);
                $('#area').html(result.data[0].areaInSqKm);
                $('#currency').html(result.data[0].currencyCode);
                capital = result.data[0].capital;
                code = result.data[0].countryCode;


            }

            $.ajax({
                url: './php/weather.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    q: capital
                },
                success: function (result) {

                    temp = Math.round(result.data.main.temp);
                    $('#temp').html(temp + '&#x2103');
                    var feels = Math.round(result.data.main.feels_like);
                    main = result.data.weather[0].main;
                    var description = result.data.weather[0].description;
                    $('#feels_like').html('Feels like ' + feels + '&#8451' + '. ' + main + ', ' + description);
                    var pic = result.data.weather[0].icon;
                    $('#pic').attr('src', "https://openweathermap.org/img/wn/" + pic + "@2x.png");
                    lo = Math.round(result.data.main.temp_min);
                    hi = Math.round(result.data.main.temp_max);

                    if (pic == '01d') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/clear.jpg); }</style>");
                    } else if (pic == '01n') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/clearn.jpg); }</style>");
                    } else if (pic == '02d' || pic == '03d' || pic == '04d') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/clouds.jpg); }</style>");
                    } else if (pic == '02n' || pic == '03n' || pic == '04n') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/cloudsn.jpg); }</style>");
                    } else if (pic == '09d' || pic == '09n' || pic == '10d' || pic == '10n') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/rain.gif); }</style>");
                    } else if (pic == '11d' || pic == '11n') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/thunder.gif); }</style>");
                    } else if (pic == '13d') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/snow.gif); }</style>");
                    } else if (pic == '13n') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/snown.gif); }</style>");
                    } else if (pic == '50d') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/mistd.jpg); }</style>");
                    } else if (pic == '50n') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/mistn.jpg); }</style>");
                    } else {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/sun2.gif); }</style>");
                    }

                }
            });

            $.ajax({
                url: './php/time.php',
                type: 'GET',
                dataType: 'json',
                data: {
                    lat: latC,
                    lng: lngC
                },
                success: function (result) {

                    $('#sunrise').html(result.data.sunrise);
                    $('#sunset').html(result.data.sunset);
                    $('#timeZone').html(result.data.timezoneId);
                    $('#time').html(result.data.time);

                }
            });

            $.ajax({
                url: './php/forecast.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    lat: latC,
                    lng: lngC
                },
                success: function build(result) {

                    var weekF = result.data.data;

                    $('.city').html(`Weather in ${capital}`);
                    $('.description').html(main);
                    $('.temp').html(`${temp}&deg;`);
                    $('#hi').html(`H: ${hi} &deg;`);
                    $('#lo').html(`L: ${lo} &deg;`);

                    var week = document.getElementById('week')

                    var fullW = [];

                    for (i = 0; i < weekF.length; i++) {

                        var day = weekF[i].datetime;
                        var low = Math.round(weekF[i].low_temp);
                        var high = Math.round(weekF[i].high_temp);
                        var iconD = weekF[i].weather.icon;
                        var body = `<tr>
                                    <td>
                                        <p>${day}</p>
                                    </td>
                                    <td><img src="https://www.weatherbit.io/static/img/icons/${iconD}.png" alt="" width="25" height="25">
                                    </td>
                                    <td id="right">
                                        <p>${high}</p>
                                    </td>
                                    <td id="right">
                                        <p>${low}</p>
                                    </td>
                                </tr>`



                        fullW.push(body);

                    }
                    fullW = fullW.join(' ');
                    week.innerHTML = fullW;

                }



            })

            $.ajax({
                url: './php/hourly.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    lat: latC,
                    lng: lngC
                },
                success: function build(result) {

                    var orai = result.data.data;

                    var forecast = document.getElementById('forecast');

                    var fullF = [];

                    for (i = 0; i < orai.length; i++) {

                        var timeStamp = orai[i].timestamp_utc.slice(11, 13);
                        var wIcon = orai[i].weather.icon;

                        var tempE = Math.round(orai[i].temp);

                        var text = `<div>
                            <p>${timeStamp}</p>
                            <img src="https://www.weatherbit.io/static/img/icons/${wIcon}.png" alt="" width="25" height="25"
                                class="rounded mx-auto d-block">
                            <p>${tempE} &deg;</p>
                        </div>`



                        fullF.push(text);

                    }
                    fullF = fullF.join(' ');
                    forecast.innerHTML = fullF;

                }
            })



        },
        error: function (jqXHR, textStatus, errorThrown) {
            // your error code
        }

    });




});


// AJAX calls on stateLayer click


stateLayer.on('click', function (e) {


    $.ajax({
        url: "php/countryInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: e.layer.feature.properties.iso_a2
        },
        success: function (result) {

            var capital;

            var code;

            var countryName;

            var main;

            var temp;

            var hi;

            var lo;

            var pic;





            if (result.status.name == "ok") {

                $('#countryName').html(result.data[0].countryName);
                $('#capital').html(result.data[0].capital);
                $('#population').html(result.data[0].population);
                $('#area').html(result.data[0].areaInSqKm);
                $('#currency').html(result.data[0].currencyCode);
                capital = result.data[0].capital;
                code = result.data[0].countryCode;
                countryName = result.data[0].countryName



            }

            $.ajax({
                url: './php/weather.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    q: capital
                },
                success: function (result) {
                    temp = Math.round(result.data.main.temp);
                    $('#temp').html(temp + '&#x2103');
                    var feels = Math.round(result.data.main.feels_like);
                    main = result.data.weather[0].main;
                    var description = result.data.weather[0].description;
                    $('#feels_like').html('Feels like ' + feels + '&#8451' + '. ' + main + ', ' + description);
                    pic = result.data.weather[0].icon;
                    $('#pic').attr('src', "https://openweathermap.org/img/wn/" + pic + "@2x.png");
                    lo = Math.round(result.data.main.temp_min);
                    hi = Math.round(result.data.main.temp_max);

                    if (pic == '01d') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/clear.jpg); }</style>");
                    } else if (pic == '01n') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/clearn.jpg); }</style>");
                    } else if (pic == '02d' || pic == '03d' || pic == '04d') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/clouds.jpg); }</style>");
                    } else if (pic == '02n' || pic == '03n' || pic == '04n') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/cloudsn.jpg); }</style>");
                    } else if (pic == '09d' || pic == '09n' || pic == '10d' || pic == '10n') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/rain.gif); }</style>");
                    } else if (pic == '11d' || pic == '11n') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/thunder.gif); }</style>");
                    } else if (pic == '13d') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/snow.gif); }</style>");
                    } else if (pic == '13n') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/snown.gif); }</style>");
                    } else if (pic == '50d') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/mistd.jpg); }</style>");
                    } else if (pic == '50n') {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/mistn.jpg); }</style>");
                    } else {
                        $('.modal-content').append("<style>.modal-content::before { background-image: url(../images/sun2.gif); }</style>");
                    }



                }
            });

            $.ajax({
                url: './php/time.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    lat: e.latlng.lat,
                    lng: e.latlng.lng
                },
                success: function (result) {

                    $('#sunrise').html(result.data.sunrise);
                    $('#sunset').html(result.data.sunset);
                    $('#timeZone').html(result.data.timezoneId);
                    $('#time').html(result.data.time);


                }
            });






            $.ajax({
                url: './php/forecast.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    lat: e.latlng.lat,
                    lng: e.latlng.lng
                },
                success: function build(result) {



                    var weatherCity = result.data.city_name;
                    var weekF = result.data.data;

                    $('.city').html(`Weather in ${weatherCity},<br>${countryName}`);
                    $('.description').html(main);
                    $('.temp').html(`${temp}&deg;`);
                    $('#hi').html(`H: ${hi} &deg;`);
                    $('#lo').html(`L: ${lo} &deg;`);

                    var week = document.getElementById('week')

                    var fullW = [];

                    for (i = 0; i < weekF.length; i++) {

                        var day = weekF[i].datetime;
                        var low = Math.round(weekF[i].low_temp);
                        var high = Math.round(weekF[i].high_temp);
                        var iconD = weekF[i].weather.icon;
                        var body = `<tr>
                                    <td>
                                        <p>${day}</p>
                                    </td>
                                    <td><img src="https://www.weatherbit.io/static/img/icons/${iconD}.png" alt="" width="25" height="25">
                                    </td>
                                    <td id="right">
                                        <p>${high}</p>
                                    </td>
                                    <td id="right">
                                        <p>${low}</p>
                                    </td>
                                </tr>`

                        fullW.push(body);

                    }
                    fullW = fullW.join(' ');
                    week.innerHTML = fullW;

                }

            })

            $.ajax({
                url: './php/hourly.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    lat: e.latlng.lat,
                    lng: e.latlng.lng
                },
                success: function build(result) {

                    var orai = result.data.data;

                    var forecast = document.getElementById('forecast')

                    var fullF = [];

                    for (i = 0; i < orai.length; i++) {

                        var timeStamp = orai[i].timestamp_utc.slice(11, 13);
                        var wIcon = orai[i].weather.icon;

                        var tempE = Math.round(orai[i].temp);


                        var text = `<div>
                            <p>${timeStamp}</p>
                            <img src="https://www.weatherbit.io/static/img/icons/${wIcon}.png" alt="" width="25" height="25"
                                class="rounded mx-auto d-block">
                            <p>${tempE} &deg;</p>
                        </div>`

                        fullF.push(text);

                    }
                    fullF = fullF.join(' ');

                    forecast.innerHTML = fullF;

                }



            })


        },
        error: function (jqXHR, textStatus, errorThrown) {
            // your error code
        }

    });




});


// EasyButton and modal functionality

L.easyButton('fas fa-cloud-sun', function (btn, map) {

    $('#myModal').modal('show');

}, 'Weather forecast').addTo(map);


$(function () {


    // when the modal is closed
    $('#myModal').on('shown.bs.modal', function () {
        $('.modal').append("<style>.modal { height: 100%; }</style>");
        $('.forecast').slick({
            infinite: false,
            slidesToShow: 3
        });
    })
    $('#myModal').on('hidden.bs.modal', function () {
        $('.forecast').slick('unslick');
        $('.modal').append("<style>.modal { height: 0; }</style>");

    });
});

// My location logo

var greenIcon = L.icon({
    iconUrl: '../images/icon.png',

    iconSize: [50, 50],
    shadowSize: [50, 64],
    iconAnchor: [22, 49],
    shadowAnchor: [4, 62],
    popupAnchor: [3, -48]
});

map.locate({ setView: true, maxZoom: 6 });

function onLocationFound(e) {


    $.ajax({
        url: './php/time.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        },
        success: function (result) {

            var name = result.data.countryName;

            L.marker(e.latlng, { icon: greenIcon }).addTo(map)
                .bindPopup(`<h6>You are in ${name}</h6>`).openPopup();


        }
    });

}

map.on('locationfound', onLocationFound);
