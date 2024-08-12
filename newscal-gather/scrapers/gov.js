const axios = require('axios');
const cheerio = require('cheerio');

// Splits string at the first occurrence of delimiter
function splitAtFirstOccurrence(str, delimiter) {
  const index = str.indexOf(delimiter);
  if (index === -1) return [str, ''];
  return [str.slice(0, index), str.slice(index + delimiter.length)];
}

// Parses date and time from a string
function parseDateTime(dateTimeStr) {
  const regex = /^\d{1,2} [A-Za-z]+ \d{4} \d{1,2}:\d{2}[ap]m$/;

  if (!regex.test(dateTimeStr)) {
      return undefined;
  }

  const months = {
    January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
    July: '07', August: '08', September: '09', October: '10', November: '11', December: '12'
  };

  const dateTimeSplit = dateTimeStr.split(' ')
  const [day, monthStr, year, timeStr] = dateTimeSplit;
  const month = months[monthStr];
  let [time, period] = timeStr.split(/(am|pm)/);
  period = period || 'am';
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  hours = hours.toString().padStart(2, '0');
  minutes = minutes.toString().padStart(2, '0');

  const dateFormatted = `${year}-${month}-${day.padStart(2, '0')}`;
  const timeFormatted = `${hours}:${minutes}`;

  return { date: dateFormatted, time: timeFormatted };
}

// Scrapes events from a given URL
async function scrapeEvents(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const events = [];

    $('.gem-c-document-list__item').each((i, element) => {
      const title = $(element).find('.gem-c-document-list__item-title a').text().trim();
      const description = $(element).find('.gem-c-document-list__item-description').text().trim();

      const attributes = {};
      $(element).find('.gem-c-document-list__attribute').each((i, attr) => {
        const text = $(attr).text().trim();
        const [key, value] = splitAtFirstOccurrence(text, ":").map(part => part.trim());
        if (key) attributes[key] = value;
      });

      const docType = attributes['Document type'] || '';
      const organisation = attributes['Organisation'] || '';
      const releaseDateTime = attributes['Release date'] || '';
      const state = attributes['State'] || '';

      const dateTime = releaseDateTime ? parseDateTime(releaseDateTime) : undefined;
      const relativeUrl = $(element).find('.gem-c-document-list__item-title a').attr('href');
      const fullUrl = new URL(relativeUrl, url).href;

      events.push({
        title,
        description,
        source: "Government Research & Statistics",
        url: fullUrl,
        ...(dateTime ? dateTime : {})
      });
    });

    return events;
  } catch (error) {
    console.error('Error scraping events:', error);
    return [];
  }
}

// Fetches events from multiple pages
async function getGovEvents(pages=60) {
  const baseUrl = `https://www.gov.uk/search/research-and-statistics?content_store_document_type=upcoming_statistics&order=updated-newest`
  const allEvents = [];

  for (let i = 1; i <= pages; i++) {
    const url = `${baseUrl}&page=${i}`;
    const events = await scrapeEvents(url);
    allEvents.push(...events);
  }

  return allEvents;
}

(async () => {

  // const events = await getGovEvents(3)

  // console.log(JSON.stringify(events))
})()

// Export the function
module.exports = { getGovEvents };
