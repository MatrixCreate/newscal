const axios = require('axios');
const cheerio = require('cheerio');

// Splits string at the first occurrence of delimiter
function splitAtFirstOccurrence(str, delimiter) {
  const index = str.indexOf(delimiter);
  if (index === -1) return [str, ''];
  return [str.slice(0, index), str.slice(index + delimiter.length)];
}


const months = {
  January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
  July: '07', August: '08', September: '09', October: '10', November: '11', December: '12'
};

const fullDateTimeRegex = /^\d{1,2} [A-Za-z]+ \d{4} \d{1,2}:\d{2}[ap]m$/;
const monthYearRegex = /^[A-Za-z]+ \d{4}$/;
const timeRegex  = /\b(\d{1,2}):(\d{2})(am|pm)\b/;

const getDate = (dateTimeStr) => {
  if (!dateTimeStr) {
    return
  }
  const isFullDate = fullDateTimeRegex.test(dateTimeStr);
  const isMonthYear = monthYearRegex.test(dateTimeStr);
  const dateTimeSplit = dateTimeStr.split(' ');

  if (isMonthYear) {
    const [monthStr, year] = dateTimeSplit;
    const month = months[monthStr];
    return { date: `${year}-${month}-01`, allMonth: true }
  }

  if (isFullDate) {
    const [day, monthStr, year] = dateTimeSplit;
    const month = months[monthStr];
    return { date: `${year}-${month}-${day.padStart(2, '0')}`, allMonth: false };
  }

  return null
};

const SOURCES = {
  'Office for National Statistics': 'ONS',
  'Department for Environment, Food & Rural Affairs': 'Defra',
  'Ministry of Justice': 'MoJ',
  'Ministry of Defence': 'MoD',
  'Closed organisation: NHS Digital': 'NHS',
  'HM Treasury': 'HM Treasury',
  'Bona Vacantia': 'Bona Vacantia',
  'Department for Work and Pensions': 'DWP',
  'Department of Health (Northern Ireland)': 'Dept. of Health (NI)',
  'Department for Transport': 'DfT',
  'Department for Education': 'DfE',
  'HM Revenue & Customs': 'HMRC',
  'NHS England': 'NHS',
  'Natural England': 'Natural England',
  'Ofcom': 'Ofcom',
  'Ofsted': 'Ofsted',
  'The Insolvency Service': 'Insolvency Service',
}

const getTime = (dateTimeStr) => {
  const match = dateTimeStr.match(timeRegex)

  if (!match) {
    return undefined
  }

  let [_, hour, minute, period] = match

  const time = `${hour}:${minute}`;

  period = period || 'am';
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  hours = hours.toString().padStart(2, '0');
   minutes = minutes.toString().padStart(2, '0');

  return `${hours}:${minutes}`;
};

// Parses date and time from a string
function parseDateTime(dateTimeStr) {
  const dateTime = getDate(dateTimeStr)
  if (!dateTime) {
    return null
  }
  const { date, allMonth } = dateTime;
  const time = getTime(dateTimeStr);

  return { date, time, allMonth };
}

// Scrapes events from a given URL
async function scrapeEvents(url, hasPublished = false) {
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
      const organisation = attributes['Organisation']
        ? attributes['Organisation'].replace(/and \d+ others?/gi, '').trim()
        : '';
      const releaseDateTime = attributes['Release date'] || '';
      const state = attributes['State'] || '';

      const dateTime = releaseDateTime ? parseDateTime(releaseDateTime) : undefined;
      const relativeUrl = $(element).find('.gem-c-document-list__item-title a').attr('href');
      const fullUrl = new URL(relativeUrl, url).href;

      let source = `${organisation ? `${organisation}` : ''}`

      if (SOURCES[organisation]) {
        source = `${SOURCES[organisation]}`
      }

      if (dateTime) {
        events.push({
          title,
          description: `${description}${docType ? ` - ${docType}` : ''}${state ? ` (${state})` : ''}`,
          source,
          url: fullUrl,
          dataSource: 'Gov Research & Statistics',
          originalSource: organisation,
          ...dateTime,
        });
      }

    });

    return events;
  } catch (error) {
    console.error('Error scraping events:', error);
    return [];
  }
}

// Fetches events from multiple pages
async function getGovEvents(pages=80) {
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
   // const events = await getGovEvents(50)

   // console.log(JSON.stringify(events))
})()

// Export the function
module.exports = { getGovEvents };
