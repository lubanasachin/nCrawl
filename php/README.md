## nCrawl (PHP)

nCrawl

- is a simple web crawler service developed in PHP.
- records the static web contents (JS, CSS, Images) for each URI crawled.

#### Download the Zip

[Click here](https://github.com/lubanasachin/nCrawl/archive/master.zip)
to download the zip file.

### Usage

To run nCrawl, execute following command from the project directory

```shell
nohup php run.php "http://xyz.com" > /location/to/log/file.log &
disown
tail -f /localtion/to/log/file.log
```