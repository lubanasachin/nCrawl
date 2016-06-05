## nCrawl (NodeJS)


- nCrawl is a simple web crawler service developed in NodeJS.

- nCrawl records the static web contents for each URI crawled.

	Static content:
		Javascript attached
		Stylesheet attached
		Images attached

- nCrawl makes use of multiple cores to crawl multiple URI's.
- nCrawl uses Redis to manage pending & processed URI's in queue.
- nCrawl provides a simple web interface to see list of URI's processed.
- nCrawl web interface is developed using AngularJS

The following links may be useful:

- [Developer overview](http://blog.gocardless.com/post/19695292096/goingcardless-an-introduction-to-gocardless-for) of GoCardless
- [Documentation](https://gocardless.com/docs/php/merchant_client_guide) for individual merchants
- [Documentation](https://gocardless.com/docs/php/partner_client_guide) for [partners](http://blog.gocardless.com/post/19743008707/goingcardless-our-partner-system-explained) (multiple merchants)
- Our [introductory guide](http://blog.gocardless.com/post/17945439079/gocardless-php-library) to using the PHP library
- Some more [advanced PHP library usage](http://blog.gocardless.com/post/17945439079/gocardless-php-library)
- [Code samples](https://github.com/gocardless/gocardless-php/tree/master/examples)
- Our CodeIgniter [plugin](https://github.com/gocardless/codeigniter-gocardless) and [spark](http://getsparks.org/packages/GoCardless/versions/HEAD/show)
- You can also use GoCardless via the [PHP Payments](https://github.com/calvinfroedge/PHP-Payments) library and [CodeIgniter Payments](http://getsparks.org/packages/codeigniter-payments/versions/HEAD/show) spark
- [Full library reference](http://gocardless.github.com/gocardless-php/)
- Our developer support [Campfire chat room](https://gocardless.campfirenow.com/3ae88)

### Installation

The files you need to use the GoCardless API are in the /lib folder.

#### Install from source

```console
$ git clone git://github.com/gocardless/codeigniter-gocardless.git application/third_party/gocardless
```

#### Download the Zip

[Click here](https://github.com/gocardless/codeigniter-gocardless/zipball/0.3.2)
to download the zip file.

#### Installing with Sparks

```console
$ php tools/spark install -v0.3.2 gocardless
```

### Usage

Sign up for an account at GoCardless.com. Copy your app id and secret
from the developer tab and paste them into config/gocardless.php. Then use
the following to load the spark:

```php
$this->config->load('gocardless');
$this->load->spark('gocardless/0.3.2');
```