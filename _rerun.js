const util = require('util');
const path = require('path');
require('./utils');
const markdownService = require('./markdown-service')

if (process.argv.length !== 3) {
  console.log(`\x1B[0;36m`, `>>>> Usage: ${path.basename(process.argv[1])} <importOptions-file>`  , `\x1B[0m` );
  return;
}

const importOptionsFile = process.argv[2];
const importOptions = require(`./${importOptionsFile}`);

const octokit = require('@octokit/rest')({
  auth: `token ${importOptions.githubPAToken}`,
  owner: importOptions.owner,
  repo: importOptions.repo
});

const octokitRequest = require('@octokit/request').defaults({
  headers: {
    authorization: `token ${importOptions.githubPAToken}`,
    accept: `application/vnd.github.golden-comet-preview+json`
  },
  owner: importOptions.owner,
  repo: importOptions.repo
});






var issues = [
  {
    "issue": {
      "title": "Prevent PBI's with Parents being used with Rules",
      "body": "**[Mingle Card: 743](https://liquidframeworks.mingle.thoughtworks.com/projects/alpine_mobile/cards/743)**\nTODO – rluo 10/24/2016 15:20\n----------------------------\n\nonly allow Parent\\_Item\\_\\_c = null AND ParentRequired = false?\n\n*   If Rule.PriceBook\\_Item\\_\\_c != null, the rule is TicketItem rule, don’t use PriceBookItem with Parent\\_Item\\_\\_c != null for RuleAction\n*   While Rule.PriceBookItem\\_\\_c = null, RuleAction priceBookItem should be the top level item, i.e. Parent\\_Item\\_\\_c = null AND ParentRequired = false. That means PriceBookItems with Parent\\_Item\\_\\_c!=null OR ParentRequired= true are not allowed for RuleActions.\n\nNarrative \n----------\n\nAs a back office user that configures the Rule Engine, I can make certain items required on Quotes and Tickets.  I should NOT be able to require Price Book Items that have a parent already defined on them and it can/will cause havoc in the the system.\n\nAcceptance Criteria\n-------------------\n\n_Make sure that when adding price book items to a Rule, that the PBI does not already have a parent item set on it._\n\n_When adding a parent item on a PBI, make sure that PBI is not already used in a Rule (back door scenario)._\n\nAnalysis\n--------\n\n*   We need to create a validation rule that prevents PBI’s with parents from being added to Rules/Actions.  \n    *   (Back Door Scenario) Note that this will not catch occurrences where the add a parent to a PBI after the PBI was added to a Rule/Action.\n*   We need to create at trigger to prevent PBI’s from adding a parent if they are already used in a Rule/Action to cover the back door scenario.\n    *   You can only do this through the declarative screens and not the PBB – so probably not needed.\n*   Add a filter that prevents PBI’s with children from being listed when adding PBI to Rule Action.\n\nRelated Stories\n---------------\n\n[http://emorypeak.basecamp.liquidframeworks.com:8080/projects/alpine\\_mobile/cards/4365](http://emorypeak.basecamp.liquidframeworks.com:8080/projects/alpine_mobile/cards/4365)\n\n[http://emorypeak.basecamp.liquidframeworks.com:8080/projects/alpine\\_mobile/cards/4364](http://emorypeak.basecamp.liquidframeworks.com:8080/projects/alpine_mobile/cards/4364)\n\nTasks\n-----\n\nTest Plan\n---------",
      "labels": [
        "Story",
        "Backlog",
        "Managed Package",
        "Managed Package"
      ],
      "closed": false,
      "created_at": "2016-09-20T05:00:00Z",
      "updated_at": "2016-10-25T05:00:00Z"
    },
    "comments": []
  },
  {
    "issue": {
      "title": "PBB: You can't add duplicate child items",
      "body": "**[Mingle Card: 1119](https://liquidframeworks.mingle.thoughtworks.com/projects/alpine_mobile/cards/1119)**\nSteps to reproduce\n------------------\n\n```\n| | |\n|-|-|\n \n  \n   |**Version #**|\n   |1.211/73|\n  \n  \n   |**OS**|\n   |Windows 10|\n  \n  \n   |**Browser**|\n   |Chrome 61|\n  \n  \n   |**Username**|\n   |agadmin@35demo.com|\n  \n  \n   |**Password**|\n   |Use LastPass|\n  \n \n\n```\n\n1.  Open the **PC Test** price book.\n2.  Open the **Price Book Builder**.\n3.  Add a catalog item to the price book.\n4.  Select the **Add Child Items** button next to the item on the **Item** grid.\n5.  Select a catalog item.\n6.  Select the **Add Child Items** button to close the **Item** picker.\n7.  Select the **Add Child Items** button next to the item on the **Item** grid.\n\nExpected result\n---------------\n\nThe catalog item you selected in **Step 5** above displays available for selection and you can add it as a duplicate child item.\n\nActual Result\n-------------\n\nThe catalog item you selected in **Step 5** above doesn’t display available for selection and you can’t add it as a duplicate child item.\n\nRelated Cards\n-------------\n\n#384\n\nTest Plan\n---------\n\npbb/pr61\n\nNew managed package not needed.\n\n**Test Result **\n\n```\n| | |\n|-|-|\n \n  \n   \n   \n\n  \n   **Result:** Passed  \n    \n\n   |\n  \n  \n   \n   \n\n**Fixed Version:** pbb/pr61\n\n   |\n  \n  \n   \n   \n\n**Login:**  agadmin@35demo.com/LastPass\n\n   \n\n   |\n  \n  \n   \n   \n\n**OS:** Windows 10 **/Browser:** IE 11.726.15063.0  \n    \n\n   |\n  \n \n\n```\n\n**Testing Notes:**\n\nVerified that you can add duplicate child items to parent. See the screen shot below\n\n!1119.JPG!\n\nTEST CASE ; PBB- Ability to add duplicate child items to a parent (1119)\n------------------------------------------------------------------------",
      "labels": [
        "Defect",
        "Archive",
        "Customer Reported",
        "Newalta",
        "McDonough",
        "Newalta",
        "McDonough"
      ],
      "closed": false,
      "created_at": "2017-12-18T06:00:00Z",
      "updated_at": "2018-01-08T06:00:00Z"
    },
    "comments": [
      {
        "created_at": "2018-01-08T06:00:00Z",
        "body": "**Pull Request #61**"
      }
    ]
  },
  {
    "issue": {
      "title": "scrollbar issue on mac",
      "body": "**[Mingle Card: 1264](https://liquidframeworks.mingle.thoughtworks.com/projects/alpine_mobile/cards/1264)**\nSteps to reproduce\n------------------\n\n```\n| | |\n|-|-|\n \n  \n   |**Version #**|\n   | |\n  \n  \n   |**OS**|\n   | |\n  \n  \n   |**Browser**|\n   | |\n  \n  \n   |**Username**|\n   | |\n  \n  \n   |**Password**|\n   | |\n  \n \n\n```\n\n1.  using a Mac, goto TIB\n\nExpected result\n---------------\n\n_Scrollbar should show on grids, when needed_\n\n_!Screen\\_Shot\\_2018-04-17\\_at\\_9.20.55\\_AM.png!_\n\nActual Result\n-------------\n\n_No scrollbars_\n\n_!Screen\\_Shot\\_2018-04-17\\_at\\_9.37.13\\_AM.png!_\n\nRelated Cards\n-------------\n\nTest Plan\n---------\n\ntib/pr156\n\nQA Note:\n\n*   Test Status: Passed\n*   PR Build: TIB/pr156\n*   Username/Password: sysadmin@test4.com/computer45\n*   Test case name: **Updated TIB 1: Ticket Item Builder and Price Book Item Picker flyout (840,796,976, 1264)**\n*   Environment: salesforce.com\n*    devices tested on: MacBook Pro\n*   Test Note: I was able to reproduce this defect on my Mac machine by launching TIB. After applying pr156 to TIB, i was able to verify that the scroll bar is now displayed on the TIB grid as displayed below:  \n    _**Lightning: **_  \n    !clip-5b11-d947.png!{height: 457px; width: 1000px;}\n*   _**Classic:​**_!clip-581c-c0dd.png!{height: 459px; width: 1000px;}",
      "labels": [
        "Defect",
        "Archive",
        "Ticket Item Builder",
        "Ticket Item Builder"
      ],
      "closed": false,
      "created_at": "2018-04-24T05:00:00Z",
      "updated_at": "2018-04-24T05:00:00Z"
    },
    "comments": [
      {
        "created_at": "2018-04-24T05:00:00Z",
        "body": "**Pull Request #156**"
      }
    ]
  },
  {
    "issue": {
      "title": "Custom setting for sync size",
      "body": "**[Mingle Card: 1534](https://liquidframeworks.mingle.thoughtworks.com/projects/alpine_mobile/cards/1534)**\nNote – rluo 10/1/2018 10:00\n---------------------------\n\nBeta Package Id: 04t1Y000000tFLEQA2\n\nSyncPacketSize\\_\\_c\n\nDefault Value: 60\n\nNarrative\n---------\n\nAcceptance Criteria\n-------------------\n\nThere is a custom setting telling Mobile what size packets to use. Please add this custom setting to the managed package.\n\nRelated Stories\n---------------\n\nTasks\n-----\n\nTest Plan\n---------",
      "labels": [
        "Story",
        "Archive",
        "Needs Documentation",
        "Needs Documentation"
      ],
      "closed": false,
      "created_at": "2018-10-01T05:00:00Z",
      "updated_at": "2018-10-01T05:00:00Z"
    },
    "comments": [
      {
        "created_at": "2018-10-01T05:00:00Z",
        "body": "**Pull Request #795**"
      }
    ]
  },
  {
    "issue": {
      "title": "Data Grid Breaks when a user add fields they don't have permissions to.",
      "body": "**[Mingle Card: 1786](https://liquidframeworks.mingle.thoughtworks.com/projects/alpine_mobile/cards/1786)**\nSteps to reproduce\n------------------\n\n```\n| | |\n|-|-|\n \n  \n   |**Version #**|\n   | |\n  \n  \n   |**OS**|\n   | |\n  \n  \n   |**Browser**|\n   | |\n  \n  \n   |**Username**|\n   | |\n  \n  \n   |**Password**|\n   | |\n  \n \n\n```\n\n1.  Remove permissions to FX5\\_\\_Contact\\_\\_c field on Ticket Item Object.\n2.  Go to 'Ticket' > Open a ticket > Grid Edit > Add a 'FX5\\_\\_Contact\\_\\_c' field.\n\nExpected result\n---------------\n\nThe Component should throw an error message saying ‘User does not have permission to this field’\n\nActual Result\n-------------\n\n_A component error is thrown_\n\n!clip-6516-c7e2.png!{height: 487px; width: 1000px;}\n\nRelated Cards\n-------------\n\nTest Plan\n---------",
      "labels": [
        "Defect",
        "Business Analysis",
        "Lightning",
        "Lightning",
        "FX_DataGrid"
      ],
      "closed": false
    },
    "comments": []
  },
  {
    "issue": {
      "title": "FXL DataGrid - RTF field value - Entering data with several lines , display as single line.",
      "body": "**[Mingle Card: 1791](https://liquidframeworks.mingle.thoughtworks.com/projects/alpine_mobile/cards/1791)**\nSteps to reproduce\n------------------\n\n```\n| | |\n|-|-|\n \n  \n   |**Version #**|\n   |LMP 1.31|\n  \n  \n   |**OS**|\n   |MacBook Pro|\n  \n  \n   |**Browser**|\n   |Chrome|\n  \n  \n   |**Username**|\n   |serukulla@setest.com|\n  \n  \n   |**Password**|\n   |testing101|\n  \n \n\n```\n\n1.  Ensure Data grid is setup on the ticket page with RTF field.\n    \n2.  Double click the RTF field to enter the value.\n3.  Using Shift+Enter buttons - Add data with several lines\n4.  Click enter button to complete editing  / Save the changes\n\nExpected result\n---------------\n\nData should be displayed with several lines as entered.\n\nActual Result\n-------------\n\nData displayed as single line. Selecting the field to Edit will display data in several lines.\n\nNote: This issue exists in version 1.29 .\n\n!clip-c3ab-d0cd.png!\n\n!clip-f46d-a8a4.png!\n\n!clip-3471-325e.png!\n\nRelated Cards\n-------------\n\nTest Plan\n---------",
      "labels": [
        "Defect",
        "Business Analysis",
        "Lightning",
        "Lightning",
        "FX_DataGrid"
      ],
      "closed": false
    },
    "comments": []
  },
  {
    "issue": {
      "title": "Status change via mobile when \"invoiced\" status is set in back office",
      "body": "**[Mingle Card: 1793](https://liquidframeworks.mingle.thoughtworks.com/projects/alpine_mobile/cards/1793)**\nSteps to reproduce\n------------------\n\n```\n| | |\n|-|-|\n \n  \n   |**Version #**|\n   |4325|\n  \n  \n   |**OS**|\n   |Windows|\n  \n  \n   |**Browser**|\n   |Chrome    |\n  \n  \n   |**Username**|\n   | |\n  \n  \n   |**Password**|\n   | |\n  \n \n\n```\n\n1.  Use case – a Ticket is left in ‘in progress’ status while field user goes on PTO.  Back office users progress the ticket to “invoiced” status.  When the field user goes back to the field they change the status to ‘dispatch review’ and then syncs ( does not sync before they start their shift) which is a training issue.  After the user syncs the ticket reverts back to a dispatch review status from invoiced in back office. Ideally a field user syncs when they start their day but in this case, they didn’t and they were able to revert the invoiced ticket status.\n2.  Then do that\n3.  Followed by this\n\nExpected Result\n---------------\n\n_upload sync error to prevent an invoiced status from reverting _\n\nActual Result\n-------------\n\n_Ticket status set to “dispatch review” from “invoiced”_\n\nRelated Cards\n-------------\n\nTest Plan\n---------",
      "labels": [
        "Defect",
        "Business Analysis",
        "Customer Reported",
        "Customer Reported",
        "Nine Energy"
      ],
      "closed": false
    },
    "comments": []
  }
];




console.log(`\x1B[0;42m`, `                             RERUN                             ` , `\x1B[0m` );;
console.log(`\x1B[0;32m`, `>>>> ReImporting ${issues.length} issues...\n`  , `\x1B[0m` );

// console.log(`\x1B[0;36m`, `>>>> issues ` , JSON.stringify(issues, null, 2) , `\x1B[0m` );


function waitOnPendingImport(url) {
console.log(`\x1B[0;33m`, `>>>> ACTUAL waitOnPendingImport ENTER`, url  , `\x1B[0m` );
  return octokitRequest(`GET ${url}`)
    .then((res) => {
      if (res.data.status === 'pending') {
console.log(`\x1B[0;36m`, `>>>> ACTUAL waitOnPendingImport PENDING`, url  , `\x1B[0m` );
        return
          waitOnPendingImport(res.data.url)
          .delay(1000);
      }
console.log(`\x1B[0;34m`, `>>>> ACTUAL waitOnPendingImport IMPORTED`, url  , `\x1B[0m` );
      return res;
    })
    .catch(err => {
      console.log(`\x1B[0;31m`, `>>>> ACTUAL waitOnPendingImport WTF `, err  , `\x1B[0m` );
    });
}

function importCards(connection, issues, cardIssueMap, stats) {

  return issues.reduce(function(previous, card, idx) {
    return previous.then(function() {

      return octokitRequest('POST /repos/:owner/:repo/import/issues', card)
        .delay(1000)
        .then((result) => {
// console.log(`\x1B[0;36m`, `>>>> import result ` , result , `\x1B[0m` );

          if (result.data.status === 'pending') {
            return waitOnPendingImport(result.data.url);
          }
console.log(`\x1B[0;32m`, `>>>> import successful ` , result.data , `\x1B[0m` );
          return result;
        })
        .then(result => {

          console.log(`\x1B[0;32m`, `>>>> DONE ` , result , `\x1B[0m` );;
        });

      });
  }, Promise.resolve())
}

importCards(null, issues)
.then(result => {

  console.log(`\x1B[0;42m`, `                             DONE                             ` , `\x1B[0m` );;

});
