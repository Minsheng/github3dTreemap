Visualizing Github with d3 treemap + threejs
===========
Davidson Zheng

Usage:
- directly open either .html files with web browser, preferrably Chrome
- both visualization scripts use a sample json file from local file server
- if you have your own server, upload the sample data sample_format.json and change the URLs


# Set up local file server with MAMP
# for apache server, need to modify config file to allow CORS(cross-origin-resouce-sharing),
# add the following block of code in YOUR_MAMP_FOLDER/conf/apache/httpd.conf,
# find <FilesMatch "^\.ht">...</FilesMatch> and add below it,

<filesMatch "\.json">
  <ifModule mod_headers.c>
     Header set Access-Control-Allow-Origin "*"
  </ifModule>
</filesMatch>