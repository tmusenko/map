<?php

//     $executionStartTime = microtime(true);

//     $countryData = json_decode(file_get_contents("../json/borders.json"), true);

// $ch = curl_init();
// 	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
// 	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// 	curl_setopt($ch, CURLOPT_URL,$countryData);

// 	$result=curl_exec($ch);

// 	curl_close($ch);

// 	$decode = json_decode($result,true);	

// 	$output['status']['code'] = "200";
// 	$output['status']['name'] = "ok";
// 	$output['status']['description'] = "mission saved";
// 	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
// 	$output['data'] = $decode;
	
// 	header('Content-Type: application/json; charset=UTF-8');

// 	echo json_encode($output); 



    $executionStartTime = microtime(true);

    $countryData = json_decode(file_get_contents("../json/borders.json"), true);

    $country = [];

    foreach ($countryData['features'] as $feature) {
        $temp = null;
        $temp = $feature;
        // $temp['name'] = $feature['properties']['name'];

        array_push($country, $temp);
    }

    // usort($country, function ($item1, $item2) { 
    //     return $item1['name'] <=> $item2['name'];
    // });

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    // $output['data'] = $decode;
    
    $output['data'] = $country;
 
    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);
?>




