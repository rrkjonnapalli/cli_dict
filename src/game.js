'use strict';
const rl = require('readline');
const Dict = require('./dict');

let getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));

let getRandomWord = (cb) => {
  cb(null, 'hello');
};

let readline = null;

class Game {

  constructor() {
    readline = rl.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.initialize((err) => {
      if (err) throw err;
      this.startPlay();
    });
  }

  initialize(cb) {
    console.log('Loading...');
    this.hintTypes = ['definitions', 'synonyms', 'antonyms', 'random'];
    this.gameCount = 0;
    this.defCount = 0;
    this.synCount = 0;
    this.antCount = 0;
    this.showedSynonyms = [];
    getRandomWord((err, word) => {
      this.word = word;
      if (err) throw new Error(err);
      Dict.get(word, (error, data) => {
        console.log('Loading completed!!!');
        this.info = data;
        cb();
      });
    });
  }

  startPlay() {
    this.gameCount += 1;
    readline.question('Press enter to continue...', (answer) => {
      if (answer === '') this.start();
    });
  }

  start() {
    console.log('You are now entered into the game.');
    console.log('**********************************');
    console.log('Definition of the word:', this.info.definitions[0]);
    this.defCount += 1;
    if (Array.isArray(this.info.synonyms) && this.synCount < (this.info.synonyms.length || 0)) {
      console.log('Synonym of the word:', this.info.synonyms[this.synCount]);
      this.synCount += 1;
    } else if (Array.isArray(this.info.antonyms) && this.antCount < (this.info.antonyms.length || 0)) {
      console.log('Antonym of the word:', this.info.antonyms[this.antCount]);
      this.antCount += 1;
    }
    console.log('**********************************');
    this.showInGameMenu();
  }

  showAfterGameMenu() {
    console.log('**********************************');
    console.log('1. Want to play again???');
    console.log('2. Quit');
    console.log('**********************************');
    readline.question('Select an option : ', (answer) => {
      let choice = null;
      try {
        choice = parseInt(answer);
      } catch (error) {
        throw error;
      }
      switch (choice) {
        case 1:
          this.gameCount += 1;
          if (this.gameCount > 3) {
            console.log('Take some rest and play again...');
            console.log('Exiting.....');
            process.exit(0);
          }
          this.initialize((err) => {
            if (err) throw err;
            this.startPlay();
          });
          break;
        case 2:
          console.log('Exiting the game...');
          process.exit(0);
          return;
        default:
          console.log('Invalid option!!! Choose a correct option.');
          this.showInGameMenu();
      }
    });
  }

  showInGameMenu() {
    console.log('**********************************');
    console.log('1. Get a hint!!');
    console.log('2. Quit');
    console.log('3. Answer');
    console.log('**********************************');
    readline.question('Select an option : ', (answer) => {
      let choice = null;
      try {
        choice = parseInt(answer);
      } catch (error) {
        throw error;
      }
      switch (choice) {
        case 1:
          this.showHint();
          break;
        case 2:
          console.log('Exiting the game...');
          process.exit(0);
          return;
        case 3:
          this.getAnswer();
          break;
        default:
          console.log('Invalid option!!! Choose a correct option.');
          this.showInGameMenu();
      }
    });
  }

  showHint() {
    let n = this.hintTypes.length;

    let hidx = getRandomInt(n); //2; // one of the random hint
    let type = this.hintTypes[hidx];
    let hint = this.getHint(type);
    if (!hint) {
      this.hintTypes.splice(hidx, 1);
      if (this.hintTypes.length < 1) {
        console.log('Sorry we do not have anymore hints.');
        this.showInGameMenu();
      }
      else this.showHint();
    } else {
      console.log(`${type} of the word is ::: ${hint}.`);
      this.showInGameMenu();
    }
  }

  getHint(type) {
    let hints = this.info[type];
    if (type === 'definitions' && this.defCount < (hints.length || 0)) {
      this.defCount += 1;
      return this.info[type][this.defCount - 1];
    }
    else if (type === 'synonyms' && this.synCount < (hints.length || 0)) {
      this.synCount += 1;
      let hint = this.info[type][this.synCount - 1];
      this.showedSynonyms.push(hint);
      return hint;
    }
    else if (type === 'antonyms' && this.antCount < (hints.length || 0)) {
      this.antCount += 1;
      return this.info[type][this.antCount - 1];
    }
    else return null;
  }

  getAnswer() {
    readline.question('Enter the word that can match the above info : ', (answer) => {
      answer = answer.toLowerCase();
      this.checkAnswer(answer);
    });
  }

  checkAnswer(answer) {
    if (this.showedSynonyms.includes(answer)) {
      console.log('Sorry!!! This is already revealed.');
      this.showInGameMenu();
    } else if (this.word === answer || this.info.synonyms.includes(answer)) {
      console.log('You won');
      this.showAfterGameMenu();
    } else {
      console.log('Sorry!!! wrong answer');
      this.showInGameMenu();
    }
  }

}

module.exports = Game;