'use strict';
const Dict = require('./src/dict');
const Game = require('./src/game');

let type = process.argv[2];
let methods = {
  'def': 'definition',
  'ex': 'examples',
  'ant': 'antonyms',
  'syn': 'synonyms',
  'get': 'get'
};

if (['def', 'syn', 'ant', 'ex', 'get'].includes(type) && process.argv.length > 3) {
  let word = process.argv[3];
  word = word.toLowerCase();
  let method = methods[type];
  Dict[method](word, (err, data) => {
    console.log(data);
  });
} else if (type === 'play') {
  let game = new Game();
} else if (type === undefined) {
  Dict.day((err, data) => {
    console.log(data);
  });
} else {
  let word = type;
  Dict.get(word, (err, data) => {
    console.log(data);
  });
}