var exec = require('child_process').exec;
var fs = require('fs');

exports.getTimestamp = function() {
  var date = new Date();
  var hour = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var milliseconds = date.getMilliseconds();

  return '[' +
         ((hour < 10) ? '0' + hour: hour) +
         ':' +
         ((minutes < 10) ? '0' + minutes: minutes) +
         ':' +
         ((seconds < 10) ? '0' + seconds: seconds) +
         '.' +
         ('00' + milliseconds).slice(-3) +
         '] ';
};

exports.pad = function(n) {
  return (n < 10) ? ("0" + n).slice(-2) : n;
};

let lastValue = '';
exports.showProgress = function(val) {
  if (typeof val !== 'string') val = (val+1).toString();
  lastValue = val;
  let x=0;
  process.stdout.write(''.padEnd(lastValue.length, ' '));
  for(x=0; x < lastValue.length; x++) {
    process.stdout.write("\b");
  }

  process.stdout.write(lastValue);
  for(x=0; x < lastValue.length; x++) {
    process.stdout.write("\b");
  }
};


// ############################################################################

exports.runDelay = function(prom, delay) {
  // GitHub has a rate limit of 5000 requests per hour.  They suggest if you're making a large
  // number of  POST, PATCH, PUT, or DELETE requests for a single user or client ID, wait at
  // least one second between each request:
  // https://developer.github.com/v3/#rate-limiting
  // https://developer.github.com/v3/guides/best-practices-for-integrators/#dealing-with-abuse-rate-limits
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      prom
        .then(resolve)
        .catch(reject);
    }, delay || 2000);
  });
};


function delay(t, v) {
   return new Promise(function(resolve) {
       setTimeout(function() {
        resolve(v);
      }, t || 1000);
   });
}

// delay polyfill
(function () {
  if (typeof Promise.prototype.delay === 'function') {
    return;
  }
  Promise.prototype.delay = function(t) {
      return this.then(function(value) {
          return delay(t, value);
      });
  };
})();


// ############################################################################
// promisify methods
// ############################################################################

// make promise version of fs.readFile()
fs.readFileAsync = function(filename) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filename, 'utf8', function(err, data){
      if (err)
        reject(err);
      else
        resolve(data);
    });
  });
};

// make promise version of fs.readDir()
fs.readdirAsync = function(path) {
  return new Promise(function(resolve, reject) {
    fs.readdir(path, 'utf8', function(err, items) {
      // console.log(items);
      if (err)
        reject(err);
      else
        resolve(items);
    });
  });
};

// make promise version of exec()
exports.execAsync = function(cmd) {
  return new Promise(function(resolve, reject) {
// console.log(' >>>> execAsync exec(cmd)', cmd);
    exec(cmd, function(err, stdout, stderr) {
console.log('\033[0;32m', '>>>>  execAsync callback cmd', cmd  , '\033[0m' );
console.log('\033[0;36m', '>>>>  execAsync callback stdout', typeof stdout, stdout  , '\033[0m' );
console.log('\033[0;33m', '>>>>  execAsync callback stderr ', stderr  , '\033[0m' );
      var result = {};
      try {
        result = stdout && JSON.parse(stdout) || {};
      }
      catch(e) {
        console.log('\033[0;31m', '>>>>  execAsync callback: JSON.parse(stdout) ERROR:', e, '\n', typeof stdout, stdout  , '\033[0m' );
      }

      if (err || result.status !== 0) {
        console.log('\033[0;31m', '>>>> ERROR: ', JSON.stringify(result), '\033[0m' );
        reject(err || result);
      }
      else {
// if (debug)
// console.log(' >>>> execAsync resolve ');
        // curl seems to output on stderr
        resolve(stdout + '\n' + stderr);
      }
    });
  });
};