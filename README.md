## nCrawl (NodeJS)

nCrawl

- is a simple web crawler service developed in NodeJS.
- records the static web contents (JS, CSS, Images) for each URI crawled.
- makes use of multiple cores to crawl multiple URI's.
- uses Redis to manage pending & processed URI's in queue.
- provides a simple web interface to see list of URI's processed.
- web interface is developed using AngularJS

The following links may be useful:

- [Cheerio](https://github.com/cheeriojs/cheerio) for jQuery like HTML DOM parser
- [Node-Redis](https://github.com/NodeRedis/node_redis) for Redis

### Installation

To install nCrawl, make sure following are installed

```console
node
npm
express
```

Run following commands to install dependent packages 

```console
npm install cheerio --save
npm install redis --save
npm install express --save
npm install request --save
```

or Simply, execute
```console
npm install
```

#### Download the Zip

[Click here](https://github.com/lubanasachin/nCrawl/archive/master.zip)
to download the zip file.

### Usage

To run nCrawl, execute following command from the project directory

```shell
nohup node index.js "http://xyz.com" > /location/to/log/file.log &
disown
tail -f /localtion/to/log/file.log
```

To view crawling data report,

```console
http://localhost:8000/
```

### Report Interface

![Report Dashboard](http://meetonsnap.com/dashboard.png)

### View URI Details (images, css, js)

![Report Dashboard](http://meetonsnap.com/viewdetails.png)
