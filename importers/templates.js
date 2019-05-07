var XLSX = require('xlsx');

var saveFile = require('../save-json-file');
var markdownService = require('../markdown-service');

exports.writeTemplates = function(workbook) {
  console.log(`\x1B[0;36m`, `>>>> Import: Templates `  , `\x1B[0m` );

  var worksheet = workbook.Sheets['Card types'];
  var json = XLSX.utils.sheet_to_json(worksheet);


  json.forEach((item, idx) => {
    // console.log(`\x1B[0;32m`, `>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ${idx}:${item['Card types']} <<<<<<<<<<<<<<<<<<<<<<<<<<<< `  , `\x1B[0m` );
    console.log(`\x1B[0;36m`, `>>>>  ${idx}:${item['Card types']}`  , `\x1B[0m` );
    try {
      var content = item['Default Description(HTML)'];
      item['Default Description(Markdown)'] = markdownService.html2markdown(content);
    }
    catch(e) {
      console.log(`\x1B[0;31m`, `>>>> ERROR ${idx}:${item['Card types']}` , e , `\x1B[0m` );
    }
    saveFile.writeJsonFile(`templates/${item['Card types']}.md`, item['Default Description(Markdown)'] );

  });

  console.log(`\x1B[0;32m`, `>>>> Templates written to ./data/templates `  , `\x1B[0m` );
  console.log(`\x1B[0;32m`, `>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> `  , `\x1B[0m` );
  return Promise.resolve();
};


