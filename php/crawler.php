<?php


class Crawler {
	
	public $output = [];
	private $seen = [];
	public $baseUrl,$host,$scheme, $url;

	/**
	* default constructor to validate given URI
	*
	*/
	public function __construct($url) {
		$this->url = $url;
		if(!$this->__validateUrl($url)) return;
		$this->__crawlMe([$this->url]);
	}


	/**
	* validate given URI, if it is a fully qualified domain uri
	* @returns false on error
	*/
	private function __validateUrl() {
		if(empty($this->url)) {
			echo "Please provide a FQDN URI\n";
			return 0;
		}
		$urlInfo 	= parse_url($this->url);
		list($host,$scheme) =  array($urlInfo['host'],$urlInfo['scheme']);
		if(empty($host) || empty($scheme)) {
			echo "URI specified is not valid\n";
			return 0;
		}
		$this->host = $host;
		$this->scheme = $scheme;
		$this->baseUrl	= "$scheme://$host";
		$this->output = array($this->url => ['image' => [], 'css' => [], 'script'=> []]);
		return 1;
	}

	/**
	* crawl a given set of URI's
	* @params array of URI to be crawled
	*/
	private function __crawlMe($inputArr) {
		foreach($inputArr as $url) {
			list($status,$html) = $this->__getPageSource($url);
			echo "\nCrawling: $url <<$status>>";	
			if($status == 404) continue;
			if(!empty($html)) {
				$htmlDoc = new DOMDocument();	
				libxml_use_internal_errors(TRUE);
				$htmlDoc->loadHTML($html);
				$linkArr = $this->getLinks($url,$htmlDoc);
				$this->__getImages($url,$htmlDoc);
				$this->__getStyleSheets($url,$htmlDoc);
				$this->__getJavascripts($url,$htmlDoc);
				if(count($linkArr) > 0) $this->__crawlMe($linkArr);
			}
		}		
	}

	/**
	* Get links found in the source code for a given URI
	* @params string $url & object DOM ref
	* @returns array of links that are valid
	*/
	private function getLinks($url,$htmlDoc) {
		$linkArr = array();
		$href = $htmlDoc->getElementsByTagName('a');
		foreach ($href as $htag) {
			$link = trim($htag->getAttribute('href'));
			if(empty($link) || in_array($link,$this->seen)) continue;
			array_push($this->seen, $link);
			if(substr($link,0,2) == '//') continue;
			if(substr($link,0,1) == '.') $link = substr($link,1);
			if(substr($link,0,1) == '/') $link = $this->baseUrl.$link;
			if(strpos($link,'#') !== false) $link = substr($link,0,strpos($link,'#'));
			if(substr($link,0,7) == 'mailto:') $link = "[$link]";
			$reg = "/^http(s?)\:\/\/{$this->host}/i";
			if(!preg_match($reg,$link)) continue;
			$link = rtrim($link,'/');
			$scheme = parse_url($link,PHP_URL_SCHEME);
			$altScheme = ($scheme === 'https') ? 'http' : 'https';
			$altLink = str_replace($scheme,$altScheme,$link);
			if(isset($this->output[$link]) || isset($this->output[$altLink])) continue;
			$this->output[$link] = array('image'	=> [], 'css' => [], 'script' =>	[]);
			array_push($linkArr,$link);
		}
		return $linkArr;
	}

	/**
	* Get Images found in the source code for a given URI
	* @params string $link & object DOM ref
	* @returns array of images that are valid
	*/
	private function __getImages($link,$htmlDoc) {
		$image = $htmlDoc->getElementsByTagName('img');
		echo "\nImages found:\n";
		foreach ($image as $imgtag) {
			$img = trim($imgtag->getAttribute('src'));
			if(empty($img)) continue;
			if(substr($img,0,2) == '//') $img = $img;
			else if(substr($img,0,1) == '/') $img = $this->baseUrl.$img;
			if(in_array($img,$this->output[$link]['image'])) continue;
			echo "$img\n";
			array_push($this->output[$link]['image'],$img);
		}
	}

	/**
	* Get css found in the source code for a given URI
	* @params string $link & object DOM ref
	* @returns array of css that are valid
	*/
	private function __getStyleSheets($link,$htmlDoc) {
		$css = $htmlDoc->getElementsByTagName('link');
		echo "\nCSS found:\n";
		foreach ($css as $csstag) {
			$rel = trim(strtolower($csstag->getAttribute('rel'))); 
			if($rel === 'stylesheet') {
				$cssfile = trim($csstag->getAttribute('href'));
				if(empty($cssfile)) continue;
				if(substr($cssfile,0,1) == '/') $cssfile = $this->baseUrl.$cssfile;
				if(in_array($cssfile,$this->output[$link]['css'])) continue;
				echo "$cssfile\n";
				array_push($this->output[$link]['css'],$cssfile);
			}
		}		
	}

	/**
	* Get javascripts found in the source code for a given URI
	* @params string $link & object DOM ref
	* @returns array of scripts that are valid
	*/
	private function __getJavascripts($link,$htmlDoc) {
        $script = $htmlDoc->getElementsByTagName('script');
		echo "\nScripts found:\n";
        foreach ($script as $scrtag) {
            $scr = trim($scrtag->getAttribute('src'));
            if(empty($scr)) continue;
			if(substr($scr,0,2) == '//') $scr = $scr;
            else if(substr($scr,0,1) == '/') $img = $this->baseUrl.$scr;
            if(in_array($scr,$this->output[$link]['script'])) continue;
			echo "$scr\n";
            array_push($this->output[$link]['script'],$scr);
        }		
	}	

	/**
	* Get source code for a given URI
	* @params string $url
	* @returns page status (http) & source code
	*/
	private function __getPageSource($url,$timeout=5) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST,false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
		curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
		$data = curl_exec($ch);
		$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		return array($status,$data);
	}



}
