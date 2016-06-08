<?php

	include_once('crawler.php');
	$starttime = time();
	echo "Started Crawling: ".date('Y-m-d h:i:s',$starttime)."\n";
	$url = empty($argv[1]) ?  '' : $argv[1];
	$crawl = new Crawler($url);
	$output = $crawl->output;
	print_r($output);
	echo "Ended: ".date('Y-m-d h:i:s')."\n";
