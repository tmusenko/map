geocoder.on('result', function ({ result }) {
    // Do something with the data
    $.ajax({
        url: "getCountryInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: result.context['0'].short_code.slice(0, 2)
        },
        success: function (result) {

            console.log(result);

            if (result.status.name == "ok") {

                $('#countryName').html(result['data'][0]['countryName']);
                $('#capital').html(result['data'][0]['capital']);
                // $('#txtLanguages').html(result['data'][0]['languages']);
                $('#population').html(result['data'][0]['population']);
                $('#area').html(result['data'][0]['areaInSqKm']);
                // $('#txtCurrencyCode').html(result['data'][0]['currencyCode']);


            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            // your error code
        }
    });


});
