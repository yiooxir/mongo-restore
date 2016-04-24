'use strict';

require('mocha');
require('should');
const restore = require('../res/restore');

describe('#restore', () => {
  it('Should drop db and populate new date', done => {
    restore({path: '/test/fixtures', dropDb: true})
      .then(() => done())
      .catch(done)
  })

  it('Should drop db and populate new date using callback', done => {
    restore({path: '/test/fixtures', dropDb: true}, (err, res) => {
      done(err);
    })
  })
})

