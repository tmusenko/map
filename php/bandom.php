<?php


    $executionStartTime = microtime(true);

    $countryData = json_decode(file_get_contents("../json/borders.json"), true);

    $country = [];

    foreach ($countryData['features'] as $feature) {
        $temp = null;
        $temp = $feature;
       

        array_push($country, $temp);
    }



    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    
    $output['data'] = $country;
 
    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);
?>




