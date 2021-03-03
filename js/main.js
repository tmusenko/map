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

$.ajax({
    url: './php/bandom.php',
    type: 'POST',
    dataType: 'json',
    success: function build(result){
       
        stateLayer.addData(result.data);
        $.each(result.data, function (key, entry) {
        var country = entry.properties.name;
        var iso2 = entry.properties.iso_a2;
        countryDropdown.append($('<option></option>').attr('value', iso2).text(country));
    })
    }
})

stateLayer.addTo(map);

map.locate({ setView: true, maxZoom: 6 });


function getPosition() {
    return new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej)
    })
}

function onLocationFound(){
    getData();
    
}


function getData() {
    
     $("#loader-wrapper").attr("style", "display: flex !important");
    
    getPosition().then((res) => {
    

    
    $.ajax({
        url: './php/ziurim.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat: res.coords.latitude,
            lng: res.coords.longitude
        },
        success: function (result) {

            var nameL = result.data.results['0'].components.country;
            var layer = stateLayer._layers[nameL];
            stateLayer.setStyle(style);
            layer.setStyle(highlight);
            map.fitBounds(layer.getBounds());
            
        }
    })

    $.ajax({
        url: './php/time.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat: res.coords.latitude,
            lng: res.coords.longitude
        },
        success: function build(result) {
            
            name = result.data.countryName;

            var content = result.data.countryCode;
            var Lcountry = name.replace(/\s/g, '_');

            popupContent = "<div class='grid'><div id='countryP'><p><img src=https://www.countryflags.io/" + content + "/shiny/64.png width='75' height='75'>" + '&nbsp;&nbsp;' + "<b>Country: </b>" + name + '</div>' +
                "<div id='detailsP'><b>Capital: </b>" + "<span id='capital'></span>" +
                "<br><b>Population: </b>" + '<span id="population"></span>' + ' <span>millions people<span>' +
                "<br><b>Area in SQKM: </b>" + '<span id="area"></span>' +
                "<br><b>Currency: </b>" + '<span id="currency"></span>' + '<span id="rate"></span></div></div>' +
                "<br><div id='weatherP'><b>Weather and time in capital</b>" + ':' +
                '<br><div id="wdetailsP"><img id="pic" width="45" height="45">' + '<span id="temp"></span> ' + '<span id="feels_like"></span>' + '.' + '<br>' + '<img src="../images/sunrise.png" width="48" height="48" class="sun">' + ' The next sunrise is at' + ' <span id="sunrise"></span>' + '<br>' + '<img src="../images/sunset.png" width="48" height="48" class="sun">' + ' The next sunset is at' + ' <span id="sunset"></span>' + '<br>' + '<img src="../images/zone.png" id="timeZ" width="35" height="35">' + ' Time zone is ' + ' <span id="timeZone"></span>' + '<br>' + '<img src="../images/time.png" id="timeC" width="35" height="35">' + ' Current time is' + ' <span id="time"></span></div>' +
                "<br><div id='wikiP'><b>Wikipedia page: </b>" + '<a href=https://en.wikipedia.org/wiki/' + Lcountry + ' target=_blank>Wikipedia</a>' + '</p></div>' + `<br><div class="news"><h2 id="newsT">News</h2><div id="news1"><p id="title1"></p><a id="imgUrl1" target="_blank"><img id="newsImg1" width="90%"></a><p id="description1"></p></div><div id="news2"><p id="title2"></p><a id="imgUrl2" target="_blank"><img id="newsImg2" width="90%"><a/><p id="description2"></p></div><div id="news3"><p id="title3"></p><a id="imgUrl3" target="_blank"><img id="newsImg3" width="90%"></a><p id="description3"></p></div></div>`;


            var infoK = document.getElementById('infoC');

            infoK.innerHTML = popupContent;

           
            $.ajax({
                        url: './php/news.php',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            q: content
                        },
                        success: function (result) {
                            
                        if (result.status.name == "ok") {
                            

                            $('#title1').html(result.data.articles['0'].title);
                            $('#title2').html(result.data.articles['1'].title);
                            $('#title3').html(result.data.articles['2'].title);
                            var newsImg1 = result.data.articles['0'].urlToImage;
                            $('#newsImg1').attr('src', newsImg1);
                            var newsImg2 = result.data.articles['1'].urlToImage;
                            $('#newsImg2').attr('src', newsImg2);
                            var newsImg3 = result.data.articles['2'].urlToImage;
                            $('#newsImg3').attr('src', newsImg3);
                            var imgUrl1 = result.data.articles['0'].url;
                            $('#imgUrl1').attr('href', imgUrl1);
                            var imgUrl2 = result.data.articles['1'].url;
                            $('#imgUrl2').attr('href', imgUrl2);
                            var imgUrl3 = result.data.articles['2'].url;
                            $('#imgUrl3').attr('href', imgUrl3);
                             $('#description1').html(result.data.articles['0'].description);
                            $('#description2').html(result.data.articles['1'].description);
                            $('#description3').html(result.data.articles['2'].description);
                            
                    }

                        }
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
                        var popul = (result.data[0].population)/1000000;
                        var numPop = popul.toFixed(4);
                        $('#population').html(numPop);
                        $('#area').html(result.data[0].areaInSqKm);
                        $('#currency').html(result.data[0].currencyCode);
                        capital = result.data[0].capital;
                        code = result.data[0].countryCode;
                        countryName = result.data[0].countryName
                        currency = result.data[0].currencyCode;



                    }
                    
                     var urlW = './php/wiki.php';
                     var nCapital = capital.replace(/\s/g, '_');
                     var lop = nCapital + '_' + content;
            

             $.ajax({
                        url: './php/location.php',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            q: lop
                        },
                        success: function build(result) {
                        
                        // console.log(result);
                        
                        var openCage = result.data.results[0];
                        
                        var currency = openCage.annotations.currency;
                    $('#currencyName').html((typeof currency !== "undefined") ? currency.name : "Undefined");
                    $('#currencySymbol').html((typeof currency !== "undefined") ? `(${currency.symbol})` : "");
                    
                    (typeof currency !== "undefined") ? (document.getElementById("toCurrency").value = currency.iso_code) : currencyDropdown.prop('selectedIndex', 0);
                            

                         var latt = result.data.results[0].geometry.lat;

                         var longg = result.data.results[0].geometry.lng;

                         var nameC = countryName;
                         var link = capital.replace(/\s/g, '_');


                        var popup = L.responsivePopup().setContent(`<h3 id="nameP">${capital}</h3><h6 id="history">Some intresting information from history about the country:</h6><p id="int"><img src="../images/loading.gif" width="210"></p><a href="https://en.wikipedia.org/wiki/${link},_${nameC}" target="_blank"><p id="seeM">Find out more about capital</p></a>`);

                        var marker = L.marker([latt, longg],
                            {
                                autoPan: false,
                                icon: countryI
                            }).addTo(map);
                            
                        marker.bindPopup(popup);


                    marker.on('click', function (result) {
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
                            
                            if(des != null){

                            var summary = des[0].summary;
                            var wikiU = des[0].wikipediaUrl;
                            var summaryY = des[1].summary;
                            var wikiY = des[1].wikipediaUrl;
                            
                          

                            var text = `<div class="box"><p>${summary} <a href="https://${wikiU}" target="_blank">more details in wikipedia page</a></p></div><button type="button" class="btn btn-primary" id="readmoreB">Read more</button><br><div class="boxB"><p>${summaryY} <a href="https://${wikiY}" target="_blank">more details in wikipedia page</a></p></div><button type="button" class="btn btn-primary" id="readmoreC">Read more</button>`;


                            int.innerHTML = text;
                            
                            }

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

}

                    });


     
                    $.ajax({
                        url: './php/weather.php',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            q: capital
                        },
                        success: function (result) {
                            temp = Math.round(result.data.main.temp);
                            $('#temp').html(`Now is <b>${temp}</b> &#x2103.`);
                            var feels = Math.round(result.data.main.feels_like);
                            main = result.data.weather[0].main;
                            var description = result.data.weather[0].description;
                            $('#feels_like').html(`Feels like <b>${feels} &#8451</b>.<br>  Weather description: ${main},${description}`);
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
                            lat: res.coords.latitude,
                            lng: res.coords.longitude
                        },
                        success: function (result) {
                            var sunrise = result.data.sunrise;
                            var parts = sunrise.split('-' || ' ');
                            var reverse = parts[2];
                            var reverseC = reverse.split(' ');
                            var newB = reverseC[1]+' '+reverseC[0];
                            var newSunrise = newB+'-'+parts[1]+'-'+parts[0];
                            
                            var sunset = result.data.sunset;
                            var parts2 = sunset.split('-' || ' ');
                            var reverse2 = parts2[2];
                            var reverseC2 = reverse2.split(' ');
                            var newB2 = reverseC2[1]+' '+reverseC2[0];
                            var newSunset = newB2+'-'+parts2[1]+'-'+parts2[0];
                            
                            var time = result.data.time;
                            var parts3 = time.split('-' || ' ');
                            var reverse3 = parts3[2];
                            var reverseC3 = reverse3.split(' ');
                            var newB3 = reverseC3[1]+' '+reverseC3[0];
                            var newTime = newB3+'-'+parts3[1]+'-'+parts3[0];

                            $('#sunrise').html(newSunrise);
                            $('#sunset').html(newSunset);
                            $('#timeZone').html(result.data.timezoneId);
                            $('#time').html(newTime);


                        }
                    });






                    $.ajax({
                        url: './php/forecast.php',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            lat: res.coords.latitude,
                            lng: res.coords.longitude
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
                                var parts = day.split('-');
                                var newdate = parts[2]+'-'+parts[1]+'-'+parts[0];

                                day = newdate;
                                var low = Math.round(weekF[i].low_temp);
                                var high = Math.round(weekF[i].high_temp);
                                var iconD = weekF[i].weather.icon;
                                var body = `<tr>
                                    <td>
                                        <p>${day}</p>
                                    </td>
                                    <td><img src="https://www.weatherbit.io/static/img/icons/${iconD}.png" alt="" width="30" height="30">
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
                            lat: res.coords.latitude,
                            lng: res.coords.longitude
                        },
                        success: function build(result) {
                            
                            var orai = result.data.list

                            var forecast = document.getElementById('forecast')

                            var fullF = [];



                            for (i = 0; i < orai.length; i++) {

                                var timeStamp = orai[i].dt_txt.slice(11, 13);
                                var wIcon = orai[i].weather[0].icon;

                                var tempE = Math.round(orai[i].main.temp);


                                var text = `<div>
                            <p>${timeStamp}</p>
                            <img src="https://openweathermap.org/img/w/${wIcon}.png" alt="" width="40" height="40"
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
                        "url": `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=5&countryIds=${code}&minPopulation=1000&sort=population`,
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

 if ($("#loader-wrapper:hidden").length == 0) {
                        $("#loader-wrapper").attr("style", "display: none !important");
                    }

})

}

map.on('locationfound', onLocationFound);

$('#chooseCountry').on('change', function () {
    var chooseC = $("#chooseCountry option:selected").text();
    var layer = stateLayer._layers[chooseC];
    stateLayer.setStyle(style);
    layer.setStyle(highlight);
    map.fitBounds(layer.getBounds());
    latC = layer.getCenter().lat;
    lngC = layer.getCenter().lng;

    var urlW = './php/wiki.php';
    var isoCode = $('#chooseCountry').val();
    var countryN = $("#chooseCountry option:selected").text();
    var countryR = countryN.replace(/\s/g, '_');


    var popupContent = "<div class='grid'><div id='countryP'><p><img src=https://www.countryflags.io/" + isoCode + "/shiny/64.png width='75' height='75'>" + '&nbsp;&nbsp;' + "<b>Country: </b>" + countryN + '</div>' +
        "<div id='detailsP'><b>Capital: </b>" + "<span id='capital'></span>" +
        "<br><b>Population: </b>" + '<span id="population"></span>' + ' <span>millions people<span>' +
        "<br><b>Area in SQKM: </b>" + '<span id="area"></span>' +
        "<br><b>Currency: </b>" + '<span id="currency"></span>' + '<span id="rate"></span></div></div>' +
        "<br><div id='weatherP'><b>Weather and time in capital</b>" + ':' +
        '<br><div id="wdetailsP"><img id="pic" width="45" height="45">' + '<span id="temp"></span> ' + '<span id="feels_like"></span>' + '.' + '<br>' + '<img src="../images/sunrise.png" width="48" height="48" class="sun">' + ' The next sunrise is at' + ' <span id="sunrise"></span>' + '<br>' + '<img src="../images/sunset.png" width="48" height="48" class="sun">' + ' The next sunset is at' + ' <span id="sunset"></span>' + '<br>' + '<img src="../images/zone.png" id="timeZ" width="35" height="35">' + ' Time zone is ' + ' <span id="timeZone"></span>' + '<br>' + '<img src="../images/time.png" id="timeC" width="35" height="35">' + ' Current time is' + ' <span id="time"></span></div>' +
        "<br><div id='wikiP'><b>Wikipedia page: </b>" + '<a href=https://en.wikipedia.org/wiki/' + countryR + ' target=_blank>Wikipedia</a>' + '</p></div>' + `<br><div class="news"><h2 id="newsT">News</h2><div id="news1"><p id="title1"></p><a id="imgUrl1" target="_blank"><img id="newsImg1" width="90%"></a><p id="description1"></p></div><div id="news2"><p id="title2"></p><a id="imgUrl2" target="_blank"><img id="newsImg2" width="90%"><a/><p id="description2"></p></div><div id="news3"><p id="title3"></p><a id="imgUrl3" target="_blank"><img id="newsImg3" width="90%"></a><p id="description3"></p></div></div>`;


    var infoC = document.getElementById('infoC');

    infoC.innerHTML = popupContent;
    
    $.ajax({
                        url: './php/news.php',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            q: isoCode
                        },
                        success: function (result) {

                        if (result.data.totalResults > 2) {
                            

                            $('#title1').html(result.data.articles['0'].title);
                            $('#title2').html(result.data.articles['1'].title);
                            $('#title3').html(result.data.articles['2'].title);
                            var newsImg1 = result.data.articles['0'].urlToImage;
                            $('#newsImg1').attr('src', newsImg1);
                            var newsImg2 = result.data.articles['1'].urlToImage;
                            $('#newsImg2').attr('src', newsImg2);
                            var newsImg3 = result.data.articles['2'].urlToImage;
                            $('#newsImg3').attr('src', newsImg3);
                            var imgUrl1 = result.data.articles['0'].url;
                            $('#imgUrl1').attr('href', imgUrl1);
                            var imgUrl2 = result.data.articles['1'].url;
                            $('#imgUrl2').attr('href', imgUrl2);
                            var imgUrl3 = result.data.articles['2'].url;
                            $('#imgUrl3').attr('href', imgUrl3);
                             $('#description1').html(result.data.articles['0'].description);
                            $('#description2').html(result.data.articles['1'].description);
                            $('#description3').html(result.data.articles['2'].description);
                            
                    }
                    
                    else{
                        $('#title1').html('No news found');
                    }
                    
                   
                        }
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
            
            var countryName


            if (result.status.name == "ok") {




                $('#countryName').html(result.data[0].countryName);
                $('#capital').html(result.data[0].capital);
                var popul = (result.data[0].population)/1000000;
                var numPop = popul.toFixed(4);
                $('#population').html(numPop);
                $('#area').html(result.data[0].areaInSqKm);
                $('#currency').html(result.data[0].currencyCode);
                capital = result.data[0].capital;
                code = result.data[0].countryCode;
                countryName = result.data[0].countryName;
                population =  result.data[0].population;

            }
            
                     var urlA = './php/location.php';
                     var nCapital = capital.replace(/\s/g, '_');
                     var lop = nCapital + '_' + code;
            
             $.ajax({
                        url: './php/location.php',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            q: lop
                        },
                        success: function build(result) {
                            
                          var openCage = result.data.results[0];
                        
                        var currency = openCage.annotations.currency;
                    $('#currencyName').html((typeof currency !== "undefined") ? currency.name : "Undefined");
                    $('#currencySymbol').html((typeof currency !== "undefined") ? `(${currency.symbol})` : "");
                    
                    (typeof currency !== "undefined") ? (document.getElementById("toCurrency").value = currency.iso_code) : currencyDropdown.prop('selectedIndex', 0);
                            
                            
                         var latt = result.data.results[0].geometry.lat;
                         
                         var longg = result.data.results[0].geometry.lng;
                         
                         var nameC = countryName;
                         var link = capital.replace(/\s/g, '_');
                         
                        var popup = L.responsivePopup().setContent(`<h3 id="nameP">${capital}</h3><h6 id="history">Some intresting information from history about the country:</h6><p id="int"><img src="../images/loading.gif" width="210"></p><a href="https://en.wikipedia.org/wiki/${link},_${nameC}" target="_blank"><p id="seeM">Find out more about capital</p></a>`);

                       var marker = L.marker([latt, longg],
                            {
                                autoPan: false,
                                icon: countryI
                            }).addTo(map);
                            
                        marker.bindPopup(popup, {
                    autoClose: true,
                    autoPan: false
                });

                        
                    marker.on('click', function (result) {
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

}

                    });

            $.ajax({
                url: './php/weather.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    q: capital
                },
                success: function (result) {

                    temp = Math.round(result.data.main.temp);
                    $('#temp').html(`Now is <b>${temp}</b> &#x2103.`);
                    var feels = Math.round(result.data.main.feels_like);
                    main = result.data.weather[0].main;
                    var description = result.data.weather[0].description;
                    $('#feels_like').html(`Feels like <b>${feels} &#8451</b>.<br>  Weather description: ${main},${description}`);
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
                        var parts = day.split('-');
                        var newdate = parts[2]+'-'+parts[1]+'-'+parts[0];

                        day = newdate;
    
                        var low = Math.round(weekF[i].low_temp);
                        var high = Math.round(weekF[i].high_temp);
                        var iconD = weekF[i].weather.icon;
                        var body = `<tr>
                                    <td>
                                        <p>${day}</p>
                                    </td>
                                    <td><img src="https://www.weatherbit.io/static/img/icons/${iconD}.png" alt="" width="30" height="30">
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
                    
                    var orai = result.data.list;

                    var forecast = document.getElementById('forecast');

                    var fullF = [];

                    for (i = 0; i < orai.length; i++) {

                        var timeStamp = orai[i].dt_txt.slice(11, 13);
                        var wIcon = orai[i].weather[0].icon;

                        var tempE = Math.round(orai[i].main.temp);

                        var text = `<div>
                            <p>${timeStamp}</p>
                            <img src="https://openweathermap.org/img/w/${wIcon}.png" alt="" width="40" height="40"
                                class="rounded mx-auto d-block">
                            <p>${tempE} &deg;</p>
                        </div>`



                        fullF.push(text);

                    }
                    fullF = fullF.join(' ');
                    forecast.innerHTML = fullF;

                }
            })

            if(population > 60000){
            const settings = {
                "async": true,
                "crossDomain": true,
                "url": `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=5&countryIds=${code}&minPopulation=1000&sort=population`,
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
            }



        },
        error: function (jqXHR, textStatus, errorThrown) {
            // your error code
        }

    });

})






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
    $('.topSmall').append("<style>@media screen and (max-width: 768px) {.topSmall { display: block; }}</style>");

    
})

$('#infoB').click(function () {
    $('#leftside').append("<style>@media screen and (max-width: 768px) {#leftside { display: block; height: auto; }}</style>");
    $('#rightside').show();
    $('.topSmall').append("<style>@media screen and (max-width: 768px) {.topSmall { display: none; }}</style>");
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
            // console.log(data)

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

    })
}




