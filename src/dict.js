'use strict';
const request = require('request');
const asnc = require('async');
const cnfg = require('config');

const oxfordAuth = cnfg.get('oxford');

let options = {
  method: 'GET',
  headers: oxfordAuth
};

let getWordOfDay = (cb) => {
  cb(null, 'bad');
};


let _handleRequest = (options, cb) => {
  request(options, (err, response, body) => {
    if (err) throw new Error(err);
    if (typeof body !== 'object') {
      try {
        body = JSON.parse(body);
      } catch (error) { }
    }
    if (!body || !body.results || !body.results.length) return cb(null, { error: true, msg: 'No data' });
    cb(null, body.results);
  });
};

class Dict {


  static _details(word, opts, cb) {
    options.url = `https://od-api.oxforddictionaries.com/api/v1/entries/en/${word}`;
    if (typeof opts === 'function') {
      cb = opts;
      opts = { definitions: true };
    }
    _handleRequest(options, (_, results) => {
      cb(null, results);
    });
  }

  static definition(word, cb) {
    Dict._details(word, cb);
  }

  static synonyms(word, cb) {
    options.url = `https://od-api.oxforddictionaries.com/api/v1/entries/en/${word}/synonyms`;

    _handleRequest(options, (_, results) => {
      cb(null, results);
    });
  }

  static antonyms(word, cb) {
    options.url = `https://od-api.oxforddictionaries.com/api/v1/entries/en/${word}/antonyms`;
    _handleRequest(options, (_, results) => {
      cb(null, results);
    });
  }

  static examples(word, cb) {
    Dict._details(word, { examples: true }, cb);
  }

  static get(word, cb) {
    asnc.parallel([
      (callback) => {
        Dict._details(word, { definitions: true, examples: true }, callback);
      },
      (callback) => {
        Dict.synonyms(word, callback);
      },
      (callback) => {
        Dict.antonyms(word, callback);
      }
    ], (err, results) => {
      if (err) return cb(err);
      cb(null, results);
    });
  }

  static day(cb) {
    getWordOfDay((err, word) => {
      if (err) return cb(err);
      console.log(word);
      Dict.get(word, cb);
    });
  }

}

module.exports = Dict;