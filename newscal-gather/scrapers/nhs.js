const axios = require('axios');
const cheerio = require('cheerio');
const proxies  = require('../proxies')

const baseUrl = 'https://digital.nhs.uk/search/publicationStatus/false?searchTab=data&sort=date&publiclyAccessible=false&r61_r1:page=';
const pageSize = 10;


async function fetchPage(pageNumber) {
  const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];

  try {
    const response = await axios.get(`${baseUrl}${pageNumber}&r61_r1:pageSize=${pageSize}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching page ${pageNumber}:`, error);
    return null;
  }
}

function extractData(html) {
  const $ = cheerio.load(html);
  const results = [];

  $('.cta.cta--detailed').each((index, element) => {
    const titleElement = $(element).find('.cta__title');
    const dateElement = $(element).find('[data-uipath="ps.search-results.result.date"]');

    const title = titleElement.text().trim();
    const dateText = dateElement.text().trim();
    const { date, allMonth } = formatDate(dateText);
    const url = 'https://digital.nhs.uk' + titleElement.attr('href');
    const source = "NHS";

    if (title && date) {
      results.push({ title, date, url, source, allMonth });
    }
  });

  return results;
}

function formatDate(dateText) {
  const months = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };

  const parts = dateText.split(' ');

  if (parts.length === 3) {
    const [day, month, year] = parts;
    const monthIndex = months[month];
    return {
      date: `${year}-${monthIndex}-${day.padStart(2, '0')}`,
      allMonth: false
    };
  } else if (parts.length === 2) {
    const [month, year] = parts;
    const monthIndex = months[month];
    return {
      date: `${year}-${monthIndex}-01`,
      allMonth: true
    };
  }

  // Default to a placeholder if format is unexpected
  return {
    date: 'Invalid-Date',
    allMonth: false
  };
}

async function getNHSEvents() {
  let page = 1;
  let hasMorePages = true;
  const allResults = [];

  while (hasMorePages && page <= 50) {
    console.log(`Fetching page ${page}...`, `${baseUrl}${page}&r61_r1:pageSize=${pageSize}`);
    const html = await fetchPage(page);
    if (html) {
      const data = extractData(html);
      if (data.length > 0) {
        allResults.push(...data);
        page++;
      } else {
        hasMorePages = false;
      }
    } else {
      hasMorePages = false;
    }
  }

 console.log(JSON.stringify(allResults, null, 2));
  return allResults
}

module.exports.getNHSEvents = getNHSEvents