const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

// Function to format date and time
function formatDate(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr ? timeStr.split(':').map(Number) : [9, 0]; // Default to 9 AM if timeStr is not provided
  const date = new Date(year, month - 1, day, hour, minute);

  return {
    day,
    month,
    year,
    timePart: timeStr || '09:00', // Default to 09:00 if timeStr is not provided
    utc: date.getTime(),
    allDay: !timeStr // Set allDay to true if timeStr is not provided
  };
}

// Function to create Markdown files
function createMarkdownFiles(dataArray) {
  dataArray.forEach(item => {
    const { title, date, time, source, url } = item;
    const description = item.description
      ? item.description.replace(':', '-')
      : ''
    const dateInfo = formatDate(date, time);
    const slugifiedTitle = slugify(title, { lower: true, remove: /[*+~.()'"!:@]/g })
      .replace('/', '-')
      .replace(',', '')
      .replace(':', '');

    // Create the filename in the format 'slugified-title-YYYY-MM-DD.md'
    const filename = `${slugifiedTitle}-${dateInfo.year}-${String(dateInfo.month).padStart(2, '0')}-${String(dateInfo.day).padStart(2, '0')}.md`.replace(',', '');

    // Define the file path in the 'events' directory
    const dir = path.join(__dirname, '../content/events');
    const filePath = path.join(dir, filename);

    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      console.log(`File already exists: ${filePath}. Skipping.`);
      return; // Skip to the next item
    }

    const markdownContent = `---
title: "${title}"

taxonomies:
  source:
    - ${source}

extra:
  url: ${url}
  description: ${description}
  date: {
    day: ${dateInfo.day},
    month: ${dateInfo.month},
    year: ${dateInfo.year},
    timePart: "${dateInfo.timePart}",
    utc: ${dateInfo.utc},
    allDay: ${dateInfo.allDay},
    allMonth: ${item.allMonth},
  }
---
`;

    // Ensure the 'events' directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    // Write to a file in the 'events' directory
    fs.writeFileSync(filePath, markdownContent);
    console.log(`File created: ${filePath}`);
  });
}

module.exports.createMarkdownFiles = createMarkdownFiles