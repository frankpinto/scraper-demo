fs = require('fs');
request = require('request');
logger = require('winston');

var main_file = process.argv[1];
var root_dir = path.dirname(main_file);

/* Downloader module does all the work */
var downloader = {
  downloadPage: function(url, filename, callback) {
    // Create place to save page
    var out = root_dir + '/tmp/' + filename;

    // If cache file already exists, leave it
    var alreadyDownloaded = function() {
      if (fs.existsSync(out))
        return true;
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
    request(url, function (error, response, body) {
      this.saveFile(error, response, body);
    });
  },
  saveFile: function(err, response, body) {
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
  return url.replace(/http:\/\/(.*)\.com/, '$1') + '.html';
};


/* This is where the magic happens */
pages_to_download = ['http://google.com/', 'http://yahoo.com', 'http://www.msn.com'];

pages_to_download.forEach(function(page) {
  downloadPage(page, url_to_filename(page), function(err, body) {
    console.log('Uncomment the line below this one to output the body of the page everytime it is retrieved');
    //console.log(body);
  });
});
