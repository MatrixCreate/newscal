const axios = require('axios');
const cheerio = require('cheerio');
const { convertTo24Hour } = require('../util')

const baseUrl = 'https://www.ons.gov.uk/releasecalendar';
let hasMorePages = true;
let page = 1;

async function scrapePage(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const results = [];

    $('.ons-list:not(.ons-list--icons) .ons-list__item').each((i, el) => {
      const item = $(el);
      const titleLink = item.find('a')
      const title = titleLink.data('gtm-release-title');
      const date = titleLink.data('gtm-release-date');
      const time = convertTo24Hour(titleLink.data('gtm-release-time'));
      const url = 'https://www.ons.gov.uk' + titleLink.attr('href')
      const allText = item.text()

      if (allText.indexOf('Confirmed') == -1) {
        return
      }

      results.push({
        title,
        date: formatDate(date),
        time,
        url,
        source: "ONS",
      });
    });

    return results;
  } catch (error) {
    console.error(`Error scraping page: ${error.message}`);
    return [];
  }
}

function formatDate(dateStr) {
  // Convert dateStr to string if it's a number
  const dateString = dateStr.toString();
  return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6)}`;
}


async function getOnsEvents() {
  let allResults = [];
  while (hasMorePages && page < 50) {
    const url = `${baseUrl}?highlight=true&limit=10&page=${page}&release-type=type-upcoming&sort=date-newest`;
    // console.log('Fetching...', url)
    const results = await scrapePage(url);
    if (results.length === 0) {
      hasMorePages = false;
    } else {
      allResults = allResults.concat(results);
      page++;
    }
  }

  console.log(JSON.stringify(allResults))
  return allResults
}

// getOnsEvents();

module.exports.getOnsEvents = getOnsEvents