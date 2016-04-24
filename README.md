# mongo-restore
Simple module for populate data to mongo collection from js/json

## Useful things
It's very important to write code faster and not spend a lot of time for create and manage any fixture for checking if you code work well...
This simple module get you simple and fast method for populating your mongo db collection on the fly.

## Install

I sure, it is normal to use dev dependency for that:

```bash
npm install mongo-restore -D
```

## Usage

Create some directory in you project. Place any files with data there. Run **mongo-restore** just tell him there is it have to looking for you fixtures and how you test base is called:
``` dir
|-project
|--tests
|---fixtures
|----myTestCollection.js  //  (file inners: module.exports = {a: 1, b: 2})
|----myTestColl2.json     // You also can use json type
```

``` javascript
const restore = require('mongo-restore');
// using with promises
restore({path: '/tests/fixtures', dropDb: true})
  .then(res => console.log('test db restored'))
  .catch(err => console.error(err))

// using callback
restore({path: '/tests/fixtures', dropDb: true}, (err, res) => {
  if (err) console.error(err); return;
  console.log('test db restored')
})
```

