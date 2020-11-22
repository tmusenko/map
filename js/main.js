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


    var popupContent = "<p><img src=https://www.countryflags.io/" + content + "/shiny/64.png width='30' height='30'>" + '&nbsp;&nbsp;' + "<b>Country: </b>" + feature.properties.name + 
        "<br><b>Capital: </b>" + "<span id='capital'></span>" +
        "<br><b>Population: </b>" + '<span id="population"></span>' + ' <span>people<span>' +
        "<br><b>Area of country: </b>" + '<span id="area"></span>' + ' <span>&#13218<span>' +
        "<br><b>Currency: </b>" + '<span id="currency"></span>' + '<span id="rate"></span>' +
        "<br><b>Weather in <span id='countryName'><span></b>" + ':' + '<br><img id="pic" width="45" height="45">' + '<span id="temp"></span> ' + '<span id="feels_like"></span>' + '.' +
        "<br><b>Wikipedia page: </b>" + '<a href=https://en.wikipedia.org/wiki/' + country + ' target=_blank>Wikipedia</a>' + '</p>';



    layer.bindPopup(popupContent, {
        minWidth: 300,
        autoPan: false
    });

    layer.on("click", function (e) {
        stateLayer.setStyle(style); 
        layer.setStyle(highlight);  
        map.fitBounds(layer.getBounds());
    });

}

var stateLayer = L.geoJson(null, { onEachFeature: forEachFeature, style: style });

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
        var nameA = a.label, nameB = b.label
        if (nameA < nameB) 
            return -1
        if (nameA > nameB)
            return 1
        return 0 
    })

    $("#autocomplete").autocomplete("option", "source", arr);

    $("#autocomplete").on("autocompleteselect", function (event, ui) {
        polySelect(ui.item.label);  
            });
}

function polySelect(a) {
    map._layers[a].fire('click');  
    var layer = map._layers[a];
    map.fitBounds(layer.getBounds());  
}


// Clock


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

// Country Info 


$("#autocomplete").on("autocompleteselect", function ({ result }, ui) {
    $.ajax({
        url: "php/countryInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: ui.item.value
        },
        success: function (result) {

            // console.log(result);

            if (result.status.name == "ok") {

                $('#countryName').html(result['data'][0]['countryName']);
                $('#capital').html(result['data'][0]['capital']);
                $('#population').html(result['data'][0]['population']);
                $('#area').html(result['data'][0]['areaInSqKm']);
                $('#currency').html(result['data'][0]['currencyCode']);


            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });


});

stateLayer.on('click', function (e) {
    $.ajax({
        url: "php/countryInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: e.layer.feature.properties.iso_a2
        },
        success: function (result) {

            // console.log(result);

            if (result.status.name == "ok") {

                $('#countryName').html(result['data'][0]['countryName']);
                $('#capital').html(result['data'][0]['capital']);
                $('#population').html(result['data'][0]['population']);
                $('#area').html(result['data'][0]['areaInSqKm']);
                $('#currency').html(result['data'][0]['currencyCode']);


            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            // your error code
        }
    });


});


// Weather info 

$("#autocomplete").on("autocompleteselect", function ({ result }, ui) {
    $.ajax({
        url: "./php/weather.php",
        type: 'POST',
        dataType: 'json',
        data: {
            q: ui.item.label
        },
        success: function (result) {


            // console.log(result);


            if (result.status.name == "ok") {

                var temp = Math.round(((result['data']['main']['temp']) - 273.15) * 10) / 10;
                $('#temp').html(temp + '&#x2103')
                var feels = Math.round(((result['data']['main']['feels_like']) - 273.15) * 10) / 10;
                var main = result['data']['weather']['0']['main']
                var description = result['data']['weather']['0']['description']
                $('#feels_like').html('Feels like ' + feels + '&#8451' + '. ' + main + ', ' + description)
                var pic = result['data']['weather']['0']['icon'];
                $('#pic').attr('src', "https://openweathermap.org/img/wn/" + pic + "@2x.png");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    })
});


stateLayer.on('click', function (e) {

    $.ajax({
        url: "./php/weather.php",
        type: 'POST',
        dataType: 'json',
        data: {
            q: e.layer.feature.properties.name
        },
        success: function (result) {


            // console.log(result);


            if (result.status.name == "ok") {

                var temp = Math.round(((result['data']['main']['temp']) - 273.15) * 10) / 10;
                $('#temp').html(temp + '&#x2103')
                var feels = Math.round(((result['data']['main']['feels_like']) - 273.15) * 10) / 10;
                var main = result['data']['weather']['0']['main']
                var description = result['data']['weather']['0']['description']
                $('#feels_like').html('Feels like ' + feels + '&#8451' + '. ' + main + ', ' + description)
                var pic = result['data']['weather']['0']['icon'];
                $('#pic').attr('src', "https://openweathermap.org/img/wn/" + pic + "@2x.png");



            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    })
});




