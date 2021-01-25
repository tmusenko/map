// Maps

var url = './json/borders.json';

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
    'color': 'rosybrown',
    'fillOpacity': 0,
    'weight': 4,
    'opacity': 1
};

var infoI = L.icon({
    iconUrl: '../images/info.png',

    iconSize: [45, 45],
    shadowSize: [50, 64],
    iconAnchor: [22, 49],
    shadowAnchor: [4, 62],
    popupAnchor: [9, -48]
});

var countryI = L.icon({
    iconUrl: '../images/country.png',

    iconSize: [45, 45],
    shadowSize: [50, 64],
    iconAnchor: [22, 49],
    shadowAnchor: [4, 62],
    popupAnchor: [3, -48]
});

var cityI = L.icon({
    iconUrl: '../images/city.png',

    iconSize: [40, 40],
    shadowSize: [50, 64],
    iconAnchor: [22, 49],
    shadowAnchor: [4, 62],
    popupAnchor: [0, -48]
});


function forEachFeature(feature, layer) {
    layer._leaflet_id = feature.properties.name;

}

var stateLayer = L.geoJson(null, { onEachFeature: forEachFeature, style: style });


var latC;
var lngC;


let countryDropdown = $('#chooseCountry');

countryDropdown.empty();
countryDropdown.append('<option selected="true" disabled>Choose a Country</option>');
countryDropdown.prop('selectedIndex', 0);

$.getJSON(url, function (data) {
    stateLayer.addData(data);


    $.each(data.features, function (key, entry) {
        var country = entry.properties.name;
        var iso2 = entry.properties.iso_a2;
        countryDropdown.append($('<option></option>').attr('value', iso2).text(country));
    })
});

stateLayer.addTo(map);

$('#chooseCountry').on('change', function () {
    var chooseC = $("#chooseCountry option:selected").text();
    var layer = stateLayer._layers[chooseC];

    stateLayer.setStyle(style);
    layer.setStyle(highlight);
    map.fitBounds(layer.getBounds());
    latC = layer.getCenter().lat;
    lngC = layer.getCenter().lng;

    var urlW = './php/wiki.php';
    var urlC = './json/capital.json';
    var isoCode = $('#chooseCountry').val();
    var countryN = $("#chooseCountry option:selected").text();
    var countryR = countryN.replace(/\s/g, '_');


    var popupContent = "<div class='grid'><div id='countryP'><p><img src=https://www.countryflags.io/" + isoCode + "/shiny/64.png width='75' height='75'>" + '&nbsp;&nbsp;' + "<b>Country: </b>" + countryN + '</div>' +
        "<div id='detailsP'><b>Capital: </b>" + "<span id='capital'></span>" +
        "<br><b>Population: </b>" + '<span id="population"></span>' + ' <span>people<span>' +
        "<br><b>Area of country: </b>" + '<span id="area"></span>' + ' <span>&#13218<span>' +
        "<br><b>Currency: </b>" + '<span id="currency"></span>' + '<span id="rate"></span></div></div>' +
        "<br><div id='weatherP'><b>Weather and time in capital</b>" + ':' +
        '<br><div id="wdetailsP"><img id="pic" width="45" height="45">' + '<span id="temp"></span> ' + '<span id="feels_like"></span>' + '.' + '<br>' + '<img src="../images/sunrise.png" width="48" height="48" class="sun">' + ' The next sunrise is at' + ' <span id="sunrise"></span>' + '<br>' + '<img src="../images/sunset.png" width="48" height="48" class="sun">' + ' The next sunset is at' + ' <span id="sunset"></span>' + '<br>' + '<img src="../images/zone.png" id="timeZ" width="35" height="35">' + ' Time zone is ' + ' <span id="timeZone"></span>' + '<br>' + '<img src="../images/time.png" id="timeC" width="35" height="35">' + ' Current time is' + ' <span id="time"></span></div>' +
        "<br><div id='wikiP'><b>Wikipedia page: </b>" + '<a href=https://en.wikipedia.org/wiki/' + countryR + ' target=_blank>Wikipedia</a>' + '</p></div>';


    var infoC = document.getElementById('infoC');

    infoC.innerHTML = popupContent;




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



            if (countryN == nameC) {

                var popup = L.responsivePopup().setContent(`<h3 id="nameP">${nameP}</h3><a href="${cPhoto}" target="_blank"><img id="cPhoto" src="${cPhoto}" width="100"></a><h6 id="history">Some intresting information from history about the country:</h6><p id="int"><img src="../images/loading.gif" width="210"></p><a href="https://en.wikipedia.org/wiki/${link},_${nameC}" target="_blank"><p id="seeM">Find out more about capital</p></a>`);

                var marker = L.marker([latt, longg],
                    {
                        autoPan: true,
                        icon: countryI
                    });
                marker.bindPopup(popup, {
                    autoClose: false,
                    autoPan: false
                });

                markers.addLayer(marker);




            }
        }

        map.addLayer(markers);




        markers.on('click', function (result) {
            var latitude = result.latlng.lat;
            var longitude = result.latlng.lng;
            map.setView(new L.LatLng(latitude, longitude));




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


                    var summary = des[0].summary;
                    var wikiU = des[0].wikipediaUrl;
                    var summaryY = des[1].summary;
                    var wikiY = des[1].wikipediaUrl;



                    var text = `<div class="box"><p>${summary} <a href="https://${wikiU}" target="_blank">more details in wikipedia page</a></p></div><button type="button" class="btn btn-primary" id="readmoreB">Read more</button><br><div class="boxB"><p>${summaryY} <a href="https://${wikiY}" target="_blank">more details in wikipedia page</a></p></div><button type="button" class="btn btn-primary" id="readmoreC">Read more</button>`;


                    int.innerHTML = text;

                    $('#readmoreB').click(function () {
                        $('.box').toggleClass("showContent");
                        var replaceText = $('.box').hasClass('showContent') ? 'Read Less' : 'Read More';
                        $('#readmoreB').text(replaceText);
                    }),
                        $('#readmoreC').click(function () {
                            $('.boxB').toggleClass("showContent");
                            var replaceTextB = $('.boxB').hasClass('showContent') ? 'Read Less' : 'Read More';
                            $('#readmoreC').text(replaceTextB);
                        });
                }


            });



        });



    });




    $.ajax({
        url: "php/countryInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: isoCode
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


            const settings = {
                "async": true,
                "crossDomain": true,
                "url": `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=5&countryIds=${code}&minPopulation=10000&sort=population`,
                "method": "GET",
                "headers": {
                    "x-rapidapi-key": "0c0c8a0b94mshf14d48e784f1c85p11b943jsn49ce24f1806e",
                    "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
                }
            };

            $.ajax(settings).done(function (response) {
                // 	console.log(response);

                var markers = L.markerClusterGroup({
                    showCoverageOnHover: false
                });

                for (i = 0; i < response.data.length; i++) {
                    var lat = response.data[i].latitude;
                    var lng = response.data[i].longitude;
                    var city = response.data[i].city;
                    var countryI = response.data[i].country;
                    var countryCodeI = response.data[i].countryCode;
                    var popupC = `<h3>${city}, ${countryI}</h3>`;

                    marker = L.marker([lat, lng], {
                        autopan: true,
                        icon: cityI,
                    }).addTo(map);



                    marker.bindPopup(popupC, {
                        autoPan: true,
                        autoClose: false
                    });



                    markers.addLayer(marker);
                }
                map.addLayer(markers);
            });



        },
        error: function (jqXHR, textStatus, errorThrown) {
            // your error code
        }

    });

})



map.locate({ setView: true, maxZoom: 6 });





function onLocationFound(e) {

    var nameL;

    $.ajax({
        url: './php/time.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        },
        success: function (result) {

            nameL = result.data.countryName;

            var content = result.data.countryCode;
            var Lcountry = nameL.replace(/\s/g, '_');

            popupContent = "<div class='grid'><div id='countryP'><p><img src=https://www.countryflags.io/" + content + "/shiny/64.png width='75' height='75'>" + '&nbsp;&nbsp;' + "<b>Country: </b>" + nameL + '</div>' +
                "<div id='detailsP'><b>Capital: </b>" + "<span id='capital'></span>" +
                "<br><b>Population: </b>" + '<span id="population"></span>' + ' <span>people<span>' +
                "<br><b>Area of country: </b>" + '<span id="area"></span>' + ' <span>&#13218<span>' +
                "<br><b>Currency: </b>" + '<span id="currency"></span>' + '<span id="rate"></span></div></div>' +
                "<br><div id='weatherP'><b>Weather and time in capital</b>" + ':' +
                '<br><div id="wdetailsP"><img id="pic" width="45" height="45">' + '<span id="temp"></span> ' + '<span id="feels_like"></span>' + '.' + '<br>' + '<img src="../images/sunrise.png" width="48" height="48" class="sun">' + ' The next sunrise is at' + ' <span id="sunrise"></span>' + '<br>' + '<img src="../images/sunset.png" width="48" height="48" class="sun">' + ' The next sunset is at' + ' <span id="sunset"></span>' + '<br>' + '<img src="../images/zone.png" id="timeZ" width="35" height="35">' + ' Time zone is ' + ' <span id="timeZone"></span>' + '<br>' + '<img src="../images/time.png" id="timeC" width="35" height="35">' + ' Current time is' + ' <span id="time"></span></div>' +
                "<br><div id='wikiP'><b>Wikipedia page: </b>" + '<a href=https://en.wikipedia.org/wiki/' + Lcountry + ' target=_blank>Wikipedia</a>' + '</p></div>';


            var infoK = document.getElementById('infoC');

            infoK.innerHTML = popupContent;



            stateLayer._layers[nameL].on('locationfound');
            var layer = stateLayer._layers[nameL];
            stateLayer.setStyle(style);
            layer.setStyle(highlight);
            map.fitBounds(layer.getBounds());



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


                    if (nameL == nameC) {

                        var popup = L.responsivePopup().setContent(`<h3 id="nameP">${nameP}</h3><a href="${cPhoto}" target="_blank"><img id="cPhoto" src="${cPhoto}" width="100"></a><h6 id="history">Some intresting information from history about the country:</h6><p id="int"><img src="../images/loading.gif" width="210"></p><a href="https://en.wikipedia.org/wiki/${link},_${nameC}" target="_blank"><p id="seeM">Find out more about capital</p></a>`);

                        var marker = L.marker([latt, longg],
                            {
                                autoPan: false,
                                icon: countryI
                            });
                        marker.bindPopup(popup);

                        markers.addLayer(marker);


                    }
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

                            var summary = des[0].summary;
                            var wikiU = des[0].wikipediaUrl;
                            var summaryY = des[1].summary;
                            var wikiY = des[1].wikipediaUrl;

                            var text = `<div class="box"><p>${summary} <a href="https://${wikiU}" target="_blank">more details in wikipedia page</a></p></div><button type="button" class="btn btn-primary" id="readmoreB">Read more</button><br><div class="boxB"><p>${summaryY} <a href="https://${wikiY}" target="_blank">more details in wikipedia page</a></p></div><button type="button" class="btn btn-primary" id="readmoreC">Read more</button>`;


                            int.innerHTML = text;

                            $('#readmoreB').click(function () {
                                $('.box').toggleClass("showContent");
                                var replaceText = $('.box').hasClass('showContent') ? 'Read Less' : 'Read More';
                                $('#readmoreB').text(replaceText);
                            }),
                                $('#readmoreC').click(function () {
                                    $('.boxB').toggleClass("showContent");
                                    var replaceTextB = $('.boxB').hasClass('showContent') ? 'Read Less' : 'Read More';
                                    $('#readmoreC').text(replaceTextB);
                                });
                        }


                    });


                });



            });


            $.ajax({
                url: "php/countryInfo.php",
                type: 'POST',
                dataType: 'json',
                data: {
                    country: content
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

                    var currency;




                    if (result.status.name == "ok") {

                        $('#countryName').html(result.data[0].countryName);
                        $('#capital').html(result.data[0].capital);
                        $('#population').html(result.data[0].population);
                        $('#area').html(result.data[0].areaInSqKm);
                        $('#currency').html(result.data[0].currencyCode);
                        capital = result.data[0].capital;
                        code = result.data[0].countryCode;
                        countryName = result.data[0].countryName
                        currency = result.data[0].currencyCode;



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



                    const settings = {
                        "async": true,
                        "crossDomain": true,
                        "url": `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=5&countryIds=${code}&minPopulation=10000&sort=population`,
                        "method": "GET",
                        "headers": {
                            "x-rapidapi-key": "0c0c8a0b94mshf14d48e784f1c85p11b943jsn49ce24f1806e",
                            "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
                        }
                    };

                    $.ajax(settings).done(function (response) {
                        var markers = L.markerClusterGroup({
                            showCoverageOnHover: false
                        });

                        for (i = 0; i < response.data.length; i++) {
                            var lat = response.data[i].latitude;
                            var lng = response.data[i].longitude;
                            var city = response.data[i].city;
                            var countryP = response.data[i].country;


                            var popupC = `<h3>${city}<br> ${countryP}</h3>`;



                            marker = L.marker([lat, lng], {
                                autopan: true,
                                icon: cityI,
                            }).addTo(map);



                            marker.bindPopup(popupC, {
                                autoPan: true,
                            });

                            markers.addLayer(marker);
                        }

                        map.addLayer(markers);

                    });


                },
                error: function (jqXHR, textStatus, errorThrown) {
                    // your error code
                }

            });




        }

        // }


    });


}

map.on('locationfound', onLocationFound);


// EasyButton and modal functionality


L.easyButton({
    id: 'button1',  // an id for the generated button
    position: 'topleft',      // inherited from L.Control -- the corner it goes in
    type: 'replace',          // set to animate when you're comfy with css
    leafletClasses: true,     // use leaflet classes to style the button?
    states: [{                 // specify different icons and responses for your button
        stateName: 'get-center',
        onClick: function (button, map) {
            $('#myModal').modal('show');
        },
        title: 'Weather forecast',
        icon: 'fas fa-cloud-sun'
    }]
}).addTo(map);


L.easyButton({
    id: 'button2',  // an id for the generated button
    position: 'topleft',      // inherited from L.Control -- the corner it goes in
    type: 'replace',          // set to animate when you're comfy with css
    leafletClasses: true,     // use leaflet classes to style the button?
    states: [{                 // specify different icons and responses for your button
        stateName: 'get-center',
        onClick: function (button, map) {
            $("#absolute").toggle();
        },
        title: 'Exchange rates',
        icon: 'fas fa-wallet'
    }]
}).addTo(map);

$('button.close').click(function () {
    $('#absolute').hide();
})

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

$('#mapB').click(function () {
    $('#rightside').hide();
    $('#leftside').show();
})

$('#infoB').click(function () {
    $('#leftside').hide();
    $('#rightside').show();
})



$('#convertBtn').click(function () {
    processExchange()
})

let currencyDropdown = $('.currencyDropdown');

currencyDropdown.empty();
currencyDropdown.append('<option selected="true" disabled>Choose Currency</option>');
currencyDropdown.prop('selectedIndex', 0);

$.getJSON("json/exchange.json", function (currencies) {
    $.each(currencies, function (key, entry) {
        currencyDropdown.append($('<option></option>').attr('value', entry.code).text(`${entry.name} (${entry.symbol})`));
    })
});




function processExchange() {

    $.ajax({
        type: 'GET',
        url: 'php/photo.php',
        dataType: 'json',
        success: function (data) {
            console.log(data)

            if (data.status.name == "OK") {

                // Open Exchange Rates Data
                var openExchangeRates = data.openExchangeRates.rates;

                var exchangeAmount = parseFloat($('#exchangeAmount').val());
                var fromCurrency = $('#fromCurrency option:selected').val()
                var toCurrency = $('#toCurrency option:selected').val()

                var exchangeRate = openExchangeRates[toCurrency] / openExchangeRates[fromCurrency]
                var exchangeRecieved = exchangeAmount * exchangeRate

                $.getJSON('json/exchange.json', function (currencies) {
                    $('#toCurrencySymbol').html(currencies[toCurrency].symbol);
                })

                $('#exchangeRecieved').html(Math.round(exchangeRecieved, 2));

            }
        }
        // error: function(jqXHR, textStatus, errorThrown) {

        // }

    })
}
