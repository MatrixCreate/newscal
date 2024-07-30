const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

// Array of 10 different sources
const sources = [
  'NHS',
  'CDC',
  'WHO',
  'FDA',
  'UNICEF',
  'Johns Hopkins University',
  'Harvard Health',
  'Mayo Clinic',
  'MedlinePlus',
  'World Health Organization'
];


// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate 1000 Markdown files
for (let i = 0; i < 1001; i++) {
  const date = faker.date.between('2024-01-01', '2025-12-31');
  const formattedDate = formatDate(date);
  const uuid = uuidv4();
  const filename = `${uuid}-${formattedDate}.md`;
  const filePath = path.join(__dirname, `../content/events/${filename}`);
  const source = sources[Math.floor(Math.random() * sources.length)];

  const markdownContent = `---
extra:
  description: ${faker.lorem.sentence({ min: 2, max: 20 })}
  date:
    allDay: true
    allMonth: false
    day: ${date.getDate()}
    month: ${date.getMonth() + 1}
    timePart: ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}
    utc: ${date.getTime()}
    year: ${date.getFullYear()}
  url: ${faker.internet.url()}
taxonomies:
  source:
  - ${source}
title: ${faker.lorem.sentence({ min: 5, max: 8 })}
---
`;

  fs.writeFileSync(filePath, markdownContent, 'utf8');
  console.log(`Created file: ${filename}`);
}

console.log('Generation complete!');
