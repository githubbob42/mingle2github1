# Mingle2Github

This is a hack I threw together to migrate [Thoughtworks Mingle](https://www.thoughtworks.com/mingle) to GitHub Issues, since Mingle is at "[End Of Life](https://www.thoughtworks.com/mingle/docs/mingle_eol.html)" and will be shutdown soon.

It's a NodeJS app that reads from an Excel spreadsheet (data dump) exported from Mingle and uses the new (not finallized) [GitHub Import API](https://gist.github.com/jonmagic/5282384165e0f86ef105)

Freely available, use at your own risk, feel free to fork and modify for you own needs, yada, yada, yada...

Since I was migrating two different Mingle projects, I used an importOptions file to store the default options for my imports:

```js
module.exports = {
  username: 'githubbob42',
  owner: 'githubbob42',
  repo: 'mingle2github2',
  acceptHeader: 'application/vnd.github.golden-comet-preview+json',
  githubPAToken: 'githubPAToken goes here',
  xls: 'Alpine Mobile data.xlsx'
};
```

It did a pretty decent job of importing (only 3 failed Cards out of 6500+ Cards and 1500+ Murmurs/Comments).  I think all of the failed cards were due to issues with the API failing and not the script itself and they all (except 1) reimported using the script below.

There is a `_rerun.js` script that you can use to re-import any failed Issues (just copy the `issue` json data from the `stats-<timestap>.json` file).


