const fs = require('fs')

function extractUniqueSources(dataArray) {
  // Use a Set to store unique sources
  const sourcesSet = new Set();

  // Iterate over each object in the dataArray
  dataArray.forEach(item => {
    // Add the source to the Set
    sourcesSet.add(item.source);
  });

  // Convert the Set back to an array
  return Array.from(sourcesSet);
}


const itemsString = fs.readFileSync('./content/events/events.json', 'utf-8')


const items = JSON.parse(itemsString)

const sources = extractUniqueSources(items)

fs.writeFileSync('./content/events/sources.json', JSON.stringify(sources), 'utf-8')

