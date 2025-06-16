const fs = require('fs');

const journal = fs.readFileSync('journal.md', 'utf-8').toLowerCase();

const stageKeywords = {
  seed:    ['why', 'what if', 'purpose', 'begin'],
  spiral:  ['loop', 'again', 'cycle', 'pattern'],
  flame:   ['fight', 'burn', 'prove', 'rise', 'struggle'],
  shadow:  ['alone', 'lost', 'mirror', 'shadow', 'sin', 'regret'],
  vow:     ['vow', 'promise', 'i swear', 'i choose'],
  core:    ['return', 'peace', 'aware', 'full circle', 'still']
};

let detectedStage = 'seed';
let highestMatch = 0;

for (const [stage, keywords] of Object.entries(stageKeywords)) {
  let count = keywords.reduce((acc, word) => acc + (journal.includes(word) ? 1 : 0), 0);
  if (count > highestMatch) {
    highestMatch = count;
    detectedStage = stage;
  }
}

fs.writeFileSync('loop.json', JSON.stringify({ stage: detectedStage }, null, 2));
console.log(`Detected stage: ${detectedStage}`);