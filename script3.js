geocoder.on('result', function ({ result }) {

    $.ajax({
        url: "show.php",
        type: 'POST',
        dataType: 'json',
        data: {
            q: result.text
        },
        success: function (result) {


            console.log(result);


            if (result.status.name == "ok") {

             var temp = Math.round(((result['data']['main']['temp']) - 273.15) * 10) / 10;
             $('#temp').html(temp + ' &#8451')
            //  $('#temp').html(Math.round(((result['data']['main']['temp']) - 273.15) * 10) / 10);
             var feels = Math.round(((result['data']['main']['feels_like']) -273.15) * 10) / 10;
             var main = result['data']['weather']['0']['main']
             var description = result['data']['weather']['0']['description']
             $('#feels_like').html('Feels like ' + feels + ' &#8451' + '. ' +  main + ', ' + description)
            //  $('#feels_like').html(Math.round(((result['data']['main']['feels_like']) - 273.15) * 10) / 10);
             $('#wCountry').html(result['data']['sys']['country']);
            //  $('#wDescription').html(result['data']['weather']['0']['description']);
             var city = result['data']['name'];
             $('#wCity').html(city + ', ');
                // $('#wCity').html((result['data']['name']) + ', ');
             var pic = result['data']['weather']['0']['icon'];
                // $('#pic').html('https://openweathermap.org/img/wn/' + (result['data']['weather']['0']['icon']) + '@2x.png');
             $('#pic').attr('src', "https://openweathermap.org/img/wn/" + pic + "@2x.png");



            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            // your error code
        }
    })
});

