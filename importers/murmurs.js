var XLSX = require('xlsx');
var saveFile = require('../save-json-file');

exports.import = function() {};

exports.getMurmurs = function(workbook) {

  var worksheet = workbook.Sheets['Murmurs'];
  var murmursJson = XLSX.utils.sheet_to_json(worksheet);

  const murmursHash = murmursJson.reduce((hash, murmur) => {
    if (murmur.Card === 'Project') return hash;

    const relCardNum = murmur.Card.match(/#(\d*)/)[1];
    if (!hash[relCardNum]) hash[relCardNum] = [];

    hash[relCardNum].push(murmur);
    return hash;
  }, {});

  saveFile.writeJsonFile(`Murmurs.json`, JSON.stringify(murmursHash, null, 2) );
  return murmursHash;
};

