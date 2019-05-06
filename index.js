#!/usr/local/bin/node

const XLSX = require('xlsx');
const prompt = require('prompt');

if (process.argv.length !== 3) {
  console.log(`\x1B[0;36m`, `>>>> Usage: ${path.basename(process.argv[1])} <importOptions-file>`  , `\x1B[0m` );
  return;
}

const importOptionsFile = process.argv[2];

const importOptions = require(`./${importOptionsFile}`);
// const importOptions = require('./importOptions.js');
const templates = require('./importers/templates');
const labels = require('./importers/labels');
const cards = require('./importers/cards');


function getLoginInfo() {
  const schema = {
    properties: {
      // username: {
      //   default: importOptions.username, //'githubbob42',
      //   required: true
      // },
      // password: {
      //   hidden: true,
      //   replace: '*',
      //   required: true
      // },
      owner: {
        default: importOptions.owner, //'githubbob42',
        required: true
      },
      repo: {
        default: importOptions.repo, //'mingle2github1',
        required: true
      },
      acceptHeader: {
        default: importOptions.acceptHeader, //'application/vnd.github.golden-comet-preview+json',
        required: false
      },
      githubPAToken: {
        default: importOptions.githubPAToken, //'application/vnd.github.golden-comet-preview+json',
        description: 'GitHub Personal Access Token',
        required: true
      },
      xlsFile: {
        default: importOptions.xlsFile, //'application/vnd.github.golden-comet-preview+json',
        description: 'XLSX File',
        required: true
      }
    }
  };

  // Start the prompt
  prompt.start();

  return new Promise((resolve) => {
    prompt.get(schema, function (err, result) {
      if (err) {
        console.log(`\x1B[0;31m`, `>>>>  exiting...`  , `\x1B[0m` );
        process.exit(0);
      }
      else {
        resolve({...result});
      }
    });
  });
}

function authenticateGitHub(prompts) {
  const {owner, repo, acceptHeader, ...auth} = prompts;

  const octokit = require('@octokit/rest')({
    auth: `token ${auth.githubPAToken}`,
    owner: owner,
    repo: repo
  });

  const octokitRequest = require('@octokit/request').defaults({
    headers: {
      authorization: `token ${auth.githubPAToken}`,
      accept: `application/vnd.github.golden-comet-preview+json`
    },
    owner: owner,
    repo: repo
  });

  const connection = { octokit, octokitRequest, defaults: {owner, repo, headers: {acceptHeader}, delay_ms: importOptions.defaultTrottleMS || 1000} };

  return Promise.resolve(connection);
}


console.log(`\x1B[0;42m`, `              Mingle to GitHubub Import               `  , `\x1B[0m` );

getLoginInfo()
.then(auth => {
  return authenticateGitHub(auth);
})
.then((connection) => {

  if (!connection.octokit) {
    console.log(`\x1B[0;31m`, `>>>> GitHub not authenticated `  , `\x1B[0m` );
    process.exit(0);
  }

  var workbook = XLSX.readFile(importOptions.xlsFile);

  return templates.writeTemplates(workbook)
    .then(() => {
      return labels.import(connection, workbook);
    })
    .then(() => {
      return cards.import(connection, workbook);
    });

});

