  
<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    // Open Exchange Rates

    $openExchangeRatesUrl = "https://openexchangerates.org/api/latest.json?app_id=4689172d1bf54c9da7fa08c0fcae130d";

    $ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$openExchangeRatesUrl);
    
	$openExchangeRatesResult=curl_exec($ch);
    curl_close($ch);
    $openExchangeRatesResult = json_decode($openExchangeRatesResult,true);	

    // Final Output
	$output['status']['code'] = "200";
	$output['status']['name'] = "OK";
    $output['openExchangeRates'] = $openExchangeRatesResult;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output);

?>


