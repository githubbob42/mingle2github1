var XLSX = require('xlsx');
var constants = require('../constants');
var saveFile = require('../save-json-file');
var utils = require('../utils');
const _ = require('lodash');


exports.import = function(connection, workbook) {
  console.log(`\x1B[0;36m`, `>>>> Import: Labels `  , `\x1B[0m` );

  function isSame(a, b) {
    return (a.name === b.name);
  }

  return Promise.all([getGitHubLabels(connection), getExcelLabelData(workbook)])
    .then(([githubLabels, mingleLabels]) => {

// console.log(`\x1B[0;36m`, `>>>> githubLabels ` , githubLabels.length,  githubLabels , `\x1B[0m` );
// console.log(`\x1B[0;33m`, `>>>> mingleLabels ` , mingleLabels.length, mingleLabels , `\x1B[0m` );

      var newLabels = _.uniqWith(_.differenceWith(mingleLabels, githubLabels, isSame), isSame);
      // console.log(`\x1B[0;32m`, `>>>> newLabels ` , newLabels.length, newLabels , `\x1B[0m` );
      return newLabels;
    })
    .then(labels => {
      console.log(`\x1B[0;36m`, `>>>> Importing ${labels.length} Labels...`  , `\x1B[0m` );
      return importLabels(connection, labels);
    })
    .then((status) => {
      console.log(`\x1B[0;36m`, `>>>> Imported ${status.imported} of ${status.total} Labels `  , `\x1B[0m` );
      console.log(`\x1B[0;32m`, `>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> `  , `\x1B[0m` );
    });
};


function getExcelLabelData(workbook) {
  var worksheet = workbook.Sheets['Cards'];
  var json = XLSX.utils.sheet_to_json(worksheet);


  function genLabel(name) {
    return {
      "name": name,
      // "description": name,
      "color": '0e9ecf' //"32416e"
    };
  }

  var labels = json.reduce((list, card) => {
    constants.FIELDS_WITH_LABELS.forEach(field => {
      if (card[field]) {
        card[field].split(',').forEach(label => {
          if (!~list.indexOf(label)) {
            list.push(genLabel(label));
          }
        });
      }
    });
    return list;
  }, []);

  return Promise.resolve(labels);
}


function getGitHubLabels(connection) {


  return connection.octokit.paginate('GET /repos/:owner/:repo/labels', {
    owner: connection.defaults.owner,
     repo: connection.defaults.repo,
  })
  .then(labels => {
    // issues is an array of all issue objects
    return labels;
  })
  .catch(err => {
    console.log(`\x1B[0;31m`, `>>>> ERROR labels ` , err , `\x1B[0m` );
  });
}

function importLabels(connection, labels) {

  let ctr = 0;
  return labels.reduce(function(previous, label) {
    return previous.then(function() {

      return connection.octokit.issues.createLabel({
          owner: connection.defaults.owner,
          repo: connection.defaults.repo,
          name: label.name,
          color: label.color
        })
        .delay(500)
        .then((result) => {
          if (result && result.status !== 201) {
            console.log(`\x1B[0;33m`, `>>>> Could not import label: ${label.name}:\n`, result  , `\x1B[0m` );
          }
          else {
            ctr++;
          }

          utils.showProgress(ctr);

          return result;
        })
        .catch(err => {
          if (err.errors && err.errors[0] && err.errors[0].code === 'already_exists') {
            console.log(`\x1B[0;33m`, `${ctr}`, `\x1B[0m` );
            console.log(`\x1B[0;33m`, `>>>> Label (${label.name}) already exists: attempting update...\n`, `\x1B[0m` );

            return connection.octokit.issues.updateLabel({
                owner: connection.defaults.owner,
                repo: connection.defaults.repo,
                current_name: label.name.toLowerCase(),
                name: label.name
              })
              .then((result) => {
                ctr++;
                utils.showProgress(ctr);
                return result;
              })
              .catch(err => {
                console.log(`\x1B[0;31m`, `>>>> Error updating label: ${label.name}:\n`, err  , `\x1B[0m` );
                // console.log(`\x1B[0;31m`, `>>>> Error updating label: ${label.name}:\n`, {
                //     message: err.message,
                //     status: err.status,
                //     rateLimit: {
                //       'x-ratelimit-limit': err.headers['x-ratelimit-limit'],
                //       'x-ratelimit-remaining': err.headers['x-ratelimit-remaining'],
                //       'x-ratelimit-reset': err.headers['x-ratelimit-reset']
                //     },
                //     url: err.request.url,
                //     body: err.request.body,
                //     documentation_url: err.documentation_url,
                //     errors: err.errors
                //   }, `\x1B[0m` );
              });
          }

          console.log(`\x1B[0;33m`, `>>>> Error importing label: ${label.name}: Retrying...`, `\x1B[0m` );

          return Promise.resolve()
            .delay(2000)
            .then(() => {
              return connection.octokit.issues.createLabel({
                owner: connection.defaults.owner,
                repo: connection.defaults.repo,
                name: label.name,
                color: label.color
              });
            })
            .then((result) => {
              if (result && result.status !== 201) {
                console.log(`\x1B[0;33m`, `>>>> Could not import label: ${label.name}:\n`, result  , `\x1B[0m` );
              }
              else {
                ctr++;
              }

              utils.showProgress(ctr);
              return result;
            })
            .catch(err => {
              console.log(`\x1B[0;33m`, `${ctr}`, `\x1B[0m` );
              console.log(`\x1B[0;31m`, `>>>> Error importing label: ${label.name}:\n`, err  , `\x1B[0m` );
              // console.log(`\x1B[0;31m`, `>>>> Error importing label: ${label.name}:\n`, {
              //     message: err.message,
              //     status: err.status,
              //     rateLimit: {
              //       'x-ratelimit-limit': err.headers['x-ratelimit-limit'],
              //       'x-ratelimit-remaining': err.headers['x-ratelimit-remaining'],
              //       'x-ratelimit-reset': err.headers['x-ratelimit-reset']
              //     },
              //     url: err.request.url,
              //     body: err.request.body,
              //     documentation_url: err.documentation_url,
              //     errors: err.errors
              //   }, `\x1B[0m` );
              saveFile.appendJsonFile('labels-errored.json', JSON.stringify({label, err}, null, 2) );
            });

        });
    });
  }, Promise.resolve())
  .then(() => {
    return {
      total: labels.length,
      imported: ctr
    };
  });

}
