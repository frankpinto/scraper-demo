fs = require('fs');
path = require('path');
request = require('request');
logger = require('winston');

var main_file = process.argv[1];
var root_dir = path.dirname(main_file) + '/';

/* Downloader module does all the work */
var downloader = {
  downloadPage: function(url, filename, callback) {
    var cache_directory = 'tmp/';

    if (!fs.existsSync(cache_directory))
      fs.mkdirSync(cache_directory);

    // Create place to save page
    var out = root_dir + cache_directory + filename;

    // If cache file already exists return it
    var alreadyDownloaded = function() {
      if (fs.existsSync(out))
      {
        return true;
      }
      else
        return false;
    };

    if (alreadyDownloaded())
    {
      fs.readFile(out, {encoding: 'utf-8'}, function (err, file_contents) {
        callback(null, file_contents);
      });
      return;
    }

    // If doesn't, download page and save it!
    var parent_object = this;
    request(url, function (error, response, body) {
      parent_object.saveFile(error, response, out, body, callback);
    });
  },
  saveFile: function(err, response, out, body, callback) {
    // Inform user of filename
    logger.info('Attempting to write file ' + out);

    // If something goes wrong, let user now
    if (err)
    {
      logger.error(err);
      callback(err, null);
      return;
    }
    else if (response.statusCode != 200)
    {
      logger.warn(response);
      callback();
      return;
    }

    // If all good, write file
    fs.writeFile(out, body, function(err) {
      if (err)
        return logger.error(err);

      logger.info('File written.');
      callback(null, body);
    });
  }
};


/* Small helper function */
var url_to_filename = function(url) {
  return url.replace(/http:\/\/(www\.)?(.*)\.com\//, '$2') + '.html';
};


/* This is where the magic happens */
pages_to_download = ['http://google.com/', 'http://yahoo.com/', 'http://www.msn.com/'];

pages_to_download.forEach(function(page) {
  downloader.downloadPage(page, url_to_filename(page), function(err, body) {
    logger.info('Uncomment the line below this one to output the body of the page everytime it is retrieved');
    //logger.info(body);
  });
});
