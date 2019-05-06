var XLSX = require('xlsx');
const _ = require('lodash');
var constants = require('../constants');
var utils = require('../utils');
var murmurs = require('./murmurs');
var saveFile = require('../save-json-file');
var markdownService = require('../markdown-service');

const cardIssueMap = {};
const stats = {
    total: 0,
    importCtr: 0,
    errorCtr: 0,
    errored: [],
    unresolvedRelatedCardCount: 0,
    unmatchedRelatedCardCount: 0,
    importStart: new Date(),
    importEnd: null,
    importError: null
  };

exports.import = function(connection, workbook) {
  console.log(`\x1B[0;42m`, `            ${stats.importStart.toUTCString()}             `  , `\x1B[0m` );
  console.log(`\x1B[0;36m`, `>>>> Import: Cards `  , `\x1B[0m` );

  return Promise.all([getGitHubIssues(connection), getExcelCardData(workbook)])
    .then(([githubIssues, mingleCards]) => {
      return mingleCards;
    })
    .then(cards => {
      console.log(`\x1B[0;36m`, `>>>> Importing ${cards.length} Cards...`  , `\x1B[0m` );
      stats.total = cards.length;
      return importCards(connection, cards);
    })
    .then((cards) => {
      const cardsWithUnresolvedRelatedCards = cards.filter(card => {
        return card.__unresolvedRelatedCards;
      });

      if (cardsWithUnresolvedRelatedCards.length) {
        const totalComments = cardsWithUnresolvedRelatedCards.reduce((sum, card) => {
          return sum + card.__unresolvedRelatedCards.length;
        }, 0);

        console.log(`\x1B[0;36m`, `>>>> Importing ${totalComments} Unresolved Related Card Comments...`  , `\x1B[0m` );
        saveFile.writeJsonFile(`cardsWithUnresolvedRelatedCards-${getISODate(stats.importStart)}.json`, JSON.stringify(cardsWithUnresolvedRelatedCards, null, 2));

        return cardsWithUnresolvedRelatedCards.reduce((prev, card) => {
            return prev.then(() =>{
              return createUnresolvedRelatedCardComments(connection, card, cardIssueMap);
            });
          }, Promise.resolve())
          .then(() => {
            saveFile.writeJsonFile(`cards-${getISODate(stats.importStart)}.json`, JSON.stringify(cards, null, 2));
          });
      }
    })
    .then(() => {
      stats.importEnd = new Date();
      // console.log(`\x1B[0;32m`, `##################### DONE #######################  `  , `\x1B[0m` );
      console.log(`\x1B[0;42m`, `                                       DONE                                         `  , `\x1B[0m` );
      console.log(`\x1B[0;36m`, `>>>> Imported ${stats.importCtr} of ${stats.total} Cards `  , `\x1B[0m` );
      if (stats.errorCtr) {
        console.log(`\x1B[0;31m`, `>>>> ${stats.errorCtr} failed to import `  , `\x1B[0m` );
        console.log(`\x1B[0;31m`, `>>>> Check the "data/stats-${getISODate(stats.importStart)}.json" file for information about the errors. `  , `\x1B[0m` );
      }
      saveFile.writeJsonFile(`cardIssueMap-${getISODate(stats.importStart)}.json`, JSON.stringify(cardIssueMap, null, 2));
      saveFile.writeJsonFile(`stats-${getISODate(stats.importStart)}.json`, JSON.stringify(stats, null, 2));
      console.log(`\x1B[0;42m`, `                                                                                     `  , `\x1B[0m` );
      console.log(`\x1B[0;32m`, `\n  Don't forget to verify the markdown templates in ./data/templates and ` , `\x1B[0m` );
      console.log(`\x1B[0;32m`, `  copy them to <alpine_mobile>/.github/ISSUE_TEMPLATE and commit them. \n` , `\x1B[0m` );
      console.log(`\x1B[0;42m`, `                                                                                     `  , `\x1B[0m` );
    })
    .catch(err => {
      stats.importEnd = new Date();
      stats.importError = err;
      console.log(`\n`);
      console.log(`\x1B[0;41m`, `                                      FAILED                                        `  , `\x1B[0m` );
      saveFile.writeJsonFile(`cardIssueMap-errored-${getISODate(stats.importStart)}.json`, JSON.stringify(cardIssueMap, null, 2));
      saveFile.writeJsonFile(`stats-errored-${getISODate(stats.importStart)}.json`, JSON.stringify(stats, null, 2));
      // saveFile.writeJsonFile(`cards-errored-${getISODate(stats.importStart)}.json`, JSON.stringify(cards, null, 2));
      console.log(`\x1B[0;31m`, `>>>> Error importing cards:`, err, `\x1B[0m` );
      console.log(`\x1B[0;31m`, `>>>> Check the "data/stats-errored-${getISODate(stats.importStart)}.json" file for information about the errors. `  , `\x1B[0m` );
      console.log(`\x1B[0;33m`, `>>>> stats `, stats  , `\x1B[0m` );
      // console.log(`\x1B[0;33m`, `>>>> cardIssueMap `, cardIssueMap  , `\x1B[0m` );
    })
    .then(() => {
      console.log(`\x1B[0;42m`, `                           ${stats.importEnd.toUTCString()}                            `  , `\x1B[0m` );
      console.log(`\x1B[0;33m`, `>>>>  Run time: `  , `\x1B[0m` );
      console.log(`\x1B[0;42m`, `                                                                                    `  , `\x1B[0m` );
    });

};


function getExcelCardData(workbook) {

  var worksheet = workbook.Sheets['Cards'];
  var cardsJson = XLSX.utils.sheet_to_json(worksheet);

  console.log(`\x1B[0;36m`, `>>>> Getting Murmurs... `  , `\x1B[0m`);
  const murmursJson = murmurs.getMurmurs(workbook);
  let allRelatedCards = {}; // used to map card# <-> issue# during import


  console.log(`\x1B[0;36m`, `>>>> Processing ${cardsJson.length} Cards... `  , `\x1B[0m`);
  console.log(`\x1B[0;36m`, `>>>> Importing Cards...`  , `\x1B[0m` );

  cardsJson.forEach(card => {
    card.__imported = false;
    card.__murmurs = murmursJson[card.Number] || [];
    card.__relatedCards = getRelatedCards(card);
  });


  // These card#s are not from the "Related Cards" section in the card but from
  // associated cards (Stories, Features, etc) so these should get imported first
  // and have their issue# set before this card is imported so we can add comments(?)
  // referencing the related card issue#
  function getRelatedCards(card) {
    return constants.RELATED_CARD_FIELDS.reduce((list, field) => {
      if (card[field]) {
        const relCardNum = card[field].match(/#(\d*)/)[1];

        if (!~list.indexOf({card: relCardNum, type: field})) {
          // list.push(relCardNum)
          list.push({card: relCardNum, type: field, data: card[field], issue: null});
        }

        if (!allRelatedCards[relCardNum]) {
          allRelatedCards[relCardNum] = {card: relCardNum, type: field, data: card[field], issue: null};
        }
      }
      return list;
    }, []);
  }

  // console.log(`\x1B[0;33m`, `>>>> cardsHash ` , cardsHash , `\x1B[0m` );

  saveFile.writeJsonFile('cards.json', JSON.stringify(cardsJson, null, 2));

  return Promise.resolve(cardsJson);
}

function getGitHubIssues(connection) {
  return connection.octokit.issues.listForRepo({
    owner: connection.defaults.owner,
    repo: connection.defaults.repo
  })
  .then(issues => {
    return issues.data.filter(issue => {
      return !issue.pull_request;
    });
  })
  .catch(err => {
    console.log(`\x1B[0;31m`, `>>>> ERROR issues.listForRepo ` , err , `\x1B[0m` );
  });
}

function createUnresolvedRelatedCardComments(connection, card) {

  return card.__unresolvedRelatedCards.reduce((previous, relatedCard) => {
    return previous.then(function(result) {
      if (result && result.status !== 201) {
        console.log(`\x1B[0;33m`, `>>>> Could not set related card: ${relatedCard.card}:\n`, result  , `\x1B[0m` );
      }

      return connection.octokit.issues.createComment({
          owner: connection.defaults.owner,
          repo: connection.defaults.repo,
          issue_number: card.__issue,
          body: `### ${relatedCard.type}: #${cardIssueMap[relatedCard.card].issue} ${relatedCard.data.replace(/^#\d* /, '')} ([Mingle](https://liquidframeworks.mingle.thoughtworks.com/projects/alpine_mobile/cards/${relatedCard.card}))`
        })
        .delay(5000)
        .catch(err => {
          console.log(`\x1B[0;31m`, `>>>> Error Adding Unresolved Related Card Comment: ${card.Number}:\n`, relatedCard, err, `\x1B[0m` );
        });
    });
  }, Promise.resolve());
}


function importCards(connection, cards) {

  return cards.reduce(function(previous, card) {
    return previous.then(function() {

      return importCard(connection, card)
        .then(issueNumber => {
          card.__imported = true;
          card.__issue = issueNumber;

          stats.importCtr++;
          utils.showProgress(stats.importCtr);
        })
        .catch(err => {
          if (err.status === 403) {
            const errDelay = (parseInt(err.headers['x-ratelimit-reset']) * 1000 - (+new Date())) / 1000 + 5000;
            console.log(`\x1B[0;33m`, `>>>> Error importing card: ${card.Number}:  Exceeded rate limit: Retrying in ${Math.floor(errDelay / 1000)} seconds...`, `\x1B[0m` );

            return Promise.resolve()
              .delay(errDelay)
              .then(() => {
                // return connection.octokitRequest('POST /repos/:owner/:repo/import/issues', issue);
                // utils.showProgress(`${stats.importCtr} retying...`);
                return importCard(connection, card, errDelay);
              })
              .then(issueNumber => {
                card.__imported = true;
                card.__issue = issueNumber;

                stats.importCtr++;
                utils.showProgress(stats.importCtr);
              })
              .catch(err => {
                console.log(`\x1B[0;31m`, `>>>> Error importing card (RETRY): ${card.Number}:\n`, {
                    message: err.message,
                    status: err.status,
                    rateLimit: {
                      'x-ratelimit-limit': err.headers['x-ratelimit-limit'],
                      'x-ratelimit-remaining': err.headers['x-ratelimit-remaining'],
                      'x-ratelimit-reset': err.headers['x-ratelimit-reset']
                    },
                    url: err.request.url,
                    body: err.request.body,
                    documentation_url: err.documentation_url,
                    errors: err.errors
                  }, `\x1B[0m` );

                card.__errored = true;
                card.__error = err;
                stats.errorCtr++;
                stats.errored.push({error: err, card: card});
              });
          }

          console.log(`\x1B[0;31m`, `>>>> Error importing card: ${card.Number}:\n`, err, `\x1B[0m` );

          card.__errored = true;
          card.__error = err;
          stats.errorCtr++;
          stats.errored.push({error: err, card: card});
        });
    });
  }, Promise.resolve())
  .then(() => {
    saveFile.writeJsonFile(`cards-status-${+new Date()}.json`, JSON.stringify(cards, null, 2));
    return cards;
  });
}


function waitOnPendingImport(connection, url, card, retryCount) {
  utils.showProgress(stats.importCtr + ''.padEnd(retryCount+1, '.'));
  return connection.octokitRequest(`GET ${url}`)
    .delay(1000)
    .then((res) => {
      if (res.data.status === 'pending') {
        return waitOnPendingImport(connection, res.data.url);
      }
      return res;
    })
    .catch(err => {
      if (err.status === 404) {
        // try it again...
        retryCount = retryCount || 0;
        if (retryCount < 3) {
          retryCount++;
          console.log(`\x1B[0;33m`, `>>>> Recieved 404 from status check: retrying... (${retryCount})`, retryCount, url, err, `\x1B[0m`);
          return waitOnPendingImport(connection, url, retryCount || 1 );
        }
        else {
          console.log(`\x1B[0;33m`, `>>>> Too many retries... (${retryCount})`, retryCount, url, err, `\x1B[0m`);
        }
      }
      console.log(`\x1B[0;31m`, `>>>> waitOnPendingImport `, url, err, `\x1B[0m` );
      throw err;
    });
}

function importCard(connection, card, delay_ms) {

  const issue = getIssueData(card);
  return connection.octokitRequest('POST /repos/:owner/:repo/import/issues', issue)
    .delay(delay_ms || 1000)
    .then(result => {

      if (result.data.status === 'pending') {
        return waitOnPendingImport(connection, result.data.url, card);
      }
      return result;
    })
    .then(result => {

      if (result && result.data) {
        try {
  // console.log(`\x1B[0;34m`, `>>>> result ` , result.data , `\x1B[0m` );
          const issueNumber = result.data.issue_url.slice(result.data.issue_url.lastIndexOf('/')+1, result.data.issue_url.length);

          cardIssueMap[card.Number] = { card: card.Number, issue: issueNumber, result: (result.status === 200 ? 200 : result) };
  // console.log(`\x1B[0;33m`, `>>>> card/issue ` , cardIssueMap[card.Number].card, cardIssueMap[card.Number].issue, `\x1B[0m` );
  // console.log(`\x1B[0;32m`, `#################################################################  `  , `\x1B[0m` );
          return issueNumber;
        }
        catch(err) {
          console.log(`\x1B[0;31m`, `>>>> UNKNOWN ERROR:  ` , err , `\x1B[0m` );
          console.log(`\x1B[0;33m`, `>>>> result:  ` , result , `\x1B[0m` );
          card.__errored = true;
          card.__error = err;
          stats.errorCtr++;
          stats.errored.push({error: err, card: card, result, issue});
        }
      }
      else {
console.log(`\x1B[0;33m`, `>>>> result (NO DATA) `, result  , `\x1B[0m` );
        card.__errored = 'NODATA';
        stats.errorCtr++;
        stats.errored.push({error: 'NO DATA returned', card: card, result, issue});
      }
    });
}


function getDate(card, op) {
  if (!op) {
    console.log(`\x1B[0;33m`, `>>>> WARNING: getDate(card, op): no 'op' param provided `  , `\x1B[0m` );
    return null;
  }

  var dateList = constants.DATE_FIELDS
    .filter(field => {
      return !!card[field];
    })
    .map(field => {
      return getISODate(card[field]);
    });

  switch(op) {
    case constants.DATE_OPERATORS.MIN:
      return _.min(dateList);

    case constants.DATE_OPERATORS.MAX:
      return _.max(dateList);

    default:
      console.log(`\x1B[0;33m`, `>>>> WARNING: getDate(): Invalid 'op' param provided: ${op} `  , `\x1B[0m` );
      return null;
  }
}

function getISODate(date) {
  return new Date(date).toISOString().replace('.000', '');
}

function getIssueData(card) {

  const data = {
    "issue": {
      "title": null,
      "body": null,
      "labels": [],
      "closed": null,
      // "created_at": card['Date Created(Hidden)'] "2014-01-01T12:34:58Z",
      // "closed_at": card['Moved to Accepted on(Hidden)'], //"2014-01-02T12:24:56Z",
      // "updated_at": "2014-01-03T11:34:53Z",
      // "assignee": "jonmagic",
      // "milestone": 1
    },
    "comments": []
  };

  try {
    data.issue = {
        "title": card.Name,
        "body": `**[Mingle Card: ${card.Number}](https://liquidframeworks.mingle.thoughtworks.com/projects/alpine_mobile/cards/${card.Number})**\n${markdownService.html2markdown(card['Description (HTML)'])}`,
        "labels": [ card.Type, card.Severity, card.Status ].concat((card.Tags && card.Tags.split(',') || [])).filter(x => !!x),
        "closed": (card['Status'] === 'Accepted'),
      };

    const minDate = getDate(card, constants.DATE_OPERATORS.MIN);
    const maxDate = getDate(card, constants.DATE_OPERATORS.MAX);

    if (minDate) {
      data.issue.created_at = minDate;
    }

    if (maxDate) {
      data.issue.updated_at = maxDate;
    }

    if (card['Status'] === 'Accepted' && (card['Moved to Accepted on(Hidden)'] || maxDate)) {
      data.issue.closed_at = (card['Moved to Accepted on(Hidden)'] && getISODate(card['Moved to Accepted on(Hidden)'])) || maxDate;
    }

    card.__relatedCards.forEach(relatedCard => {

      if (parseInt(relatedCard.card) > parseInt(card.Number)) {
        if (!card.__unresolvedRelatedCards) card.__unresolvedRelatedCards = [];
        card.__unresolvedRelatedCards.push(relatedCard);
        // console.log(`\x1B[0;33m`, `>>>> Unresolved Related Card:  ${card.Number} / ${relatedCard.card}`, relatedCard  , `\x1B[0m` );
        stats.unresolvedRelatedCardCount++;
        return;
      }
      if (!cardIssueMap[relatedCard.card]) {
        console.log(`\x1B[0;33m`, `>>>> Unmatched Related Card:  ${card.Number} / ${relatedCard.card}`, relatedCard  , `\x1B[0m` );
        stats.unmatchedRelatedCardCount++;
        return;
      }

      data.comments.push({
          created_at: minDate,
          body: `### ${relatedCard.type}: #${cardIssueMap[relatedCard.card].issue} ${relatedCard.data.replace(/^#\d* /, '')} ([Mingle](https://liquidframeworks.mingle.thoughtworks.com/projects/alpine_mobile/cards/${relatedCard.card}))`
        });
    });

    data.comments = data.comments.concat(card.__murmurs.map(murmur => {
      return {
        created_at: getISODate(murmur.Timestamp),
        body: `${murmur.User} : ${murmur.Timestamp}\n${markdownService.html2markdown(murmur.Murmur)}`
      };
    }));

    if (card['Pull Request']) {
      data.comments.push({
        created_at: maxDate,
        body: `**Pull Request #${card['Pull Request']}**`
      });
    }

    return data;
  }
  catch(err){
    console.log(`\x1B[0;31m`, `>>>> ERROR getIssueData ${card.Number}:` , data, err , `\x1B[0m` );
    throw err;
  }
}
