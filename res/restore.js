'use strict';

const path = require('path');
const mi = require('mongoimport');
const fs = require('fs');
const async = require('async');
const exec = require('exec');
var child_process = require('child_process');

const ROOT_PATH = process.cwd();

const DEFAULT = {
  host: 'localhost',
  port: '27017',
  db: 'test',
  method: 'series'
}

function log(text) {
  
}

function dropDb(db, cb) {
  child_process.exec(`mongo ${db} --eval "db.dropDatabase()"`, (err, stdOut, stdErr) => {
    cb(err);
  });
}

const fetchData = (filePath, cb) => {
  const ph = path.parse(filePath);
  const reqPath = path.join(ph.dir, ph.name);

  return require(reqPath);
}

const restoreCollection = (filePath, params ) => cb => {
  const fileName = path.basename(filePath);
  const colName = fileName.split('.')[0];

  const config = {
    fields: fetchData(filePath),
    db: params.db,
    collection: colName,
    host: `${params.host}:${params.port}`,
    callback: cb
  }

  if (params.username) {
    config.username = options.username;
  }

  if (params.password) {
    config.password = options.password
  }

  mi(config);
}

const getCollectionPaths = (dir, cb) => {
  // replace(/\.[^.]*$/, '')
  fs.readdir(dir, (err, list) => cb(err, list.map(file => path.join(dir, file))));
}

/**
 * Restore all found files to mongo collections.
 *
 * @param config
 *
 * @param config.db {String}
 * @optional
 * @default text
 * 
 * @param config.path {String}
 * @required
 *
 * @param config.dropDb {boolean}
 * @optional
 * @default true
 *
 * @param config.host
 * @default localhost
 *
 * @param config.port
 * @optional
 * @default 'localhost'
 *
 * @param config.username
 * @optional
 *
 * @param config.password
 * @optional
 *
 */
function restore(config, callback) {
  const params = Object.assign({}, config, DEFAULT);

  if (typeof config !== 'object') {
    throw new Error('Config is not received.');
  }

  if (!params.path) {
    throw new Error('Path to mock db must be specified in config.');
  }
  
  const dbPath = path.join(ROOT_PATH, params.path);
  const asyncMethod = params.method === 'series' ? async.series : async.parallel;

  async.waterfall([
    /* Drop db before restore operations if it is specified in config */
    (next) => params.dropDb ? dropDb(params.db, next) : next(null),

    /* Collect all files from specified directory */
    (next) => getCollectionPaths(dbPath, next),

    /* Collect restore functions for each collection */
    (paths, next) => next(null, paths.map(p => restoreCollection(p, params))),

    /* Do restore in series or parallel mode */
    (funcList, next) => asyncMethod(funcList, next)
  ], callback)
}

function denodeify(func, args) {

  return new Promise((resolve, reject) => {
    const callback = (err, res) => {
      return !err ? resolve(res) : reject(err);
    }

    const extraArgs = Array.prototype.slice.call(args);
    extraArgs.push(callback);

    func.apply(this, extraArgs);
  })
}

module.exports = function(config, cb) {
  return arguments.length === 1 ? denodeify(restore, arguments) : restore(config, cb);
}

