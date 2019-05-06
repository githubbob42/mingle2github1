# Notes

### ZenHub

- API:
-- https://github.com/ZenHubIO/API


### alpine-mobile

repo-id: `14151083`
(https://github.com/ZenHubIO/API#endpoint-reference)


## Import Tasks


### Lookup imports:

#### Issue templates (card types)
- I think this need to be written out to `.github/ISSUE_TEMPLATES` folder

#### Team members
- need to test if already exists

#### Tags and Statues
- comma separeted
- import as `Labels`
- https://developer.github.com/v3/issues/labels/

#### Labels
- Tags
- Statuses
- Severity
- Type


### Main imports:

#### Cards
- https://developer.github.com/v3/issues/
- https://developer.github.com/v3/issues/assignees/

#### Murmurs
- https://developer.github.com/v3/issues/comments/
- https://developer.github.com/v3/issues/assignees/




## Cards


- read `CSV` as `JSON`
```js
var workbook = XLSX.readFile('./Alpine Mobile data.xlsx');
var worksheet = workbook.Sheets['Card types'];
var json = XLSX.utils.sheet_to_json(worksheet);
```

- should probably try to reduce/hash the cards by #s
- add a `related` property to it
-


