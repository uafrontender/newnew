var fs = require('fs');
var files = fs.readdirSync('./en-US/');
console.log(files);

let wordCount = 0;
let allWords = [];

files.forEach((fileName) => {
  const data = fs.readFileSync(`./en-US/${fileName}`);
  const json = JSON.parse(data);
  const jsonString = JSON.stringify(json);
  const filteredJsonString = jsonString.replaceAll(/\\n/g, '');

  const matches = filteredJsonString.matchAll(/".*?":"(.*?)"/g);
  const texts = Array.from(matches, (m) => m[1]);

  texts.forEach((text) => {
    const wordMathces = text.matchAll(/([\w'’\p{L}]+)/g);
    const words = Array.from(wordMathces, (m) => m[1]);
    filteredWords = words.filter((word) => word !== '{{' && word !== '}}');
    wordCount += filteredWords.length;
    allWords = [...allWords, ...filteredWords];
  });
});

console.log(wordCount);
//fs.writeFile('./words.txt', allWords.join(', '), () => {});*/
