var TurndownService = require('turndown');
var turndownService = new TurndownService();

exports.html2markdown = function(content) {

  turndownService.addRule('pre-formatted', {
    filter: ['pre'],
    replacement: function (content) {
      return '```\n' + content + '\n```';
    }
  });

  function convertTables(html) {
    // This is primarily for the Defect Setup table under Steps To Reproduce but should work any table
    html = html.replace(/<table.*>/g, '\n<pre>\n| | |\n|-|-|');
    html = html.replace(/<\/table>/g, '</pre>\n\n');
    html = html.replace(/<.?tbody>|<\/tr>\r\s*<tr>|<.?tr>/g, '');
    html = html.replace(/<\/th>\r\s*<td>|<.?th>|<.?td>/g, '|');
    html = html.replace(/\|\r\s*\|/g, '|\n|');
    return html;
  }

  // content = content.replace(/(\{\{.*\}\})/, '<pre>$1</pre>');
  // content = content.replace(/{{/g, '<pre>{{').replace(/}}/g, '}}</pre>');
  // item['Default Description(HTML)'] && console.log(`\x1B[0;33m`, content , `\x1B[0m` )
  // content = content.replace(/<table.*>/g, '\n<pre>\n| | |\n|-|-|')
  // content = content.replace(/<\/table>/g, '</pre>\n\n')
  // content = content.replace(/<.?tbody>|<\/tr>\r\s*<tr>|<.?tr>/g, '')
  // content = content.replace(/<\/th>\r\s*<td>|<.?th>|<.?td>/g, '|')
  // content = content.replace(/\|\r\s*\|/g, '|\n|')
  content = convertTables(content);
  // item['Default Description(HTML)'] && console.log(`\x1B[0;32m`, content , `\x1B[0m` )
  return turndownService.turndown(content);
};
