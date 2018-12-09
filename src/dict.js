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
  let words = ['abrupt', 'beautiful', 'delicate', 'delightful', 'firm', 'light', 'truth', 'quick', 'Willful', 'Brutal', 'Cheerful', 'Uneasy', 'Random', 'Expert', 'Wicked', 'Never', 'long', 'possible', 'loud'];
  let idx = Dict.getRandomInt(words.length);
  cb(null, words[idx].toLowerCase());
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

let _formatResult = (results, opts, cb) => {
  let DEFINITIONS = [];
  let EXAMPLES = [];
  let SYNONYMS = [];
  let ANTONYMS = [];

  if (typeof results === 'object' && results.error) {
    let result = {};
    for (let key of Object.keys(opts)) {
      result[key] = [];
    }
    return cb(null, result);
  }

  for (let result of results) {
    let lEntries = result.lexicalEntries;
    if (!lEntries || !lEntries.length) continue;
    for (let lEntry of lEntries) {
      let entries = lEntry.entries;
      if (!entries || !entries.length) continue;
      for (let entry of entries) {
        let senses = entry.senses;
        if (!senses || !senses.length) continue;
        for (let sense of senses) {
          // definitions
          if (opts.definitions) {
            let definitions = sense.definitions || [];
            definitions = definitions.concat(sense.short_definitions || []);
            for (let dfn of definitions) {
              let val = dfn.toLowerCase();
              if (DEFINITIONS.includes(val)) continue;
              DEFINITIONS.push(val);
            }
          }

          // examples
          if (opts.examples) {
            let examples = sense.examples || [];
            for (let ex of examples) {
              let val = ex.text.toLowerCase();
              if (EXAMPLES.includes(val)) continue;
              EXAMPLES.push(val);
            }
          }

          // synonyms
          if (opts.synonyms) {
            let synonyms = sense.synonyms || [];
            for (let synonym of synonyms) {
              let val = synonym.text.toLowerCase();
              if (SYNONYMS.includes(val)) continue;
              SYNONYMS.push(val);
            }
          }

          // antonyms
          if (opts.antonyms) {
            let antonyms = sense.antonyms || [];
            for (let antonym of antonyms) {
              let val = antonym.text.toLowerCase();
              if (ANTONYMS.includes(val)) continue;
              ANTONYMS.push(val);
            }
          }
        }
      }
    }
  }

  let result = {};
  if (opts.definitions) result.definitions = DEFINITIONS;
  if (opts.examples) result.examples = EXAMPLES;
  if (opts.synonyms) result.synonyms = SYNONYMS;
  if (opts.antonyms) result.antonyms = ANTONYMS;
  cb(null, result);
};

class Dict {

  static getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  static _details(word, opts, cb) {
    options.url = `https://od-api.oxforddictionaries.com/api/v1/entries/en/${word}`;
    if (typeof opts === 'function') {
      cb = opts;
      opts = { definitions: true };
    }
    _handleRequest(options, (_, results) => {
      _formatResult(results, opts, cb);
    });
  }

  static definition(word, cb) {
    Dict._details(word, cb);
  }

  static synonyms(word, cb) {
    options.url = `https://od-api.oxforddictionaries.com/api/v1/entries/en/${word}/synonyms`;

    _handleRequest(options, (_, results) => {
      _formatResult(results, { synonyms: true }, cb);
    });
  }

  static antonyms(word, cb) {
    options.url = `https://od-api.oxforddictionaries.com/api/v1/entries/en/${word}/antonyms`;
    _handleRequest(options, (_, results) => {
      _formatResult(results, { antonyms: true }, cb);
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
      let result = {};
      for (let data of results) {
        Object.assign(result, data);
      }
      cb(null, result);
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