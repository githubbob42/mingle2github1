var fs = require('fs');

exports.writeJsonFile = (fileName, data) => {
  fs.writeFileSync(`./data/${fileName}`, data);
};

exports.appendJsonFile = (fileName, data) => {
  fs.appendFileSync(`./data/${fileName}`, data);
};

