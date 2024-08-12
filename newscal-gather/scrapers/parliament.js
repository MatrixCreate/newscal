const { chromium } = require('playwright');
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36";

// Function to generate date URLs
const generateUrls = (startDate, endDate) => {
  const urls = [];
  const currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const url = `https://whatson.parliament.uk/commons/${year}-${month}-${day}/`;
    urls.push(url);

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return urls;
};

// Function to get events from a URL
const getParliamentEventsForUrl = async (page, url) => {
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForSelector('.item-card-list .card', { timeout: 2000 });

    const items = await page.$$eval('.item-card-list .card', (cards) => {
      const monthToNumber = (month) => {
        const months = {
          Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
          Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
        };
        return months[month] || '00';
      };

      return cards.map(card => {
        const titleElement = card.querySelector('.secondary-info');
        const categoryElement = card.querySelector('.primary-info span');
        const monthElement = card.querySelector('.calendar-sheet .month');
        const dayElement = card.querySelector('.calendar-sheet .day');
        const yearElement = card.querySelector('.calendar-sheet .year');
        const linkElement = card.querySelector('.overlay-link');

        const title = titleElement ? titleElement.textContent.trim() : '';
        const category1 = categoryElement ? categoryElement.textContent.trim() : '';
        const month = monthElement ? monthElement.textContent.trim() : '';
        const day = dayElement ? dayElement.textContent.trim() : '';
        const year = yearElement ? yearElement.textContent.trim() : '';
        const link = linkElement ? 'https://whatson.parliament.uk' + linkElement.getAttribute('href') : '';

        const finalTitle = title || category1;
        const date = year && month && day ? `${year}-${monthToNumber(month)}-${day.padStart(2, '0')}` : '';

        if (!date) {
          return null;
        }

        return {
          title: finalTitle,
          description: category1,
          date,
          url: link,
          source: 'Parliament',
        };
      });
    });

    return items.filter(item => item !== null);
  } catch (error) {
    console.error('Error fetching or processing data:', error);
    return [];
  }
};

// Function to get events between two dates
const getParliamentEventsBetweenDates = async (startDate, endDate) => {
  const urls = generateUrls(startDate, endDate);
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ userAgent, bypassCSP: true });
  const page = await context.newPage();
  const allEvents = [];

  for (const url of urls) {
    const events = await getParliamentEventsForUrl(page, url);
    allEvents.push(...events);
  }

  await context.close();
  await browser.close();

  return allEvents;
};

// Example usage
(async () => {
  if (process.argv[2] == '-t' || process.argv[2] == '--test') {
    const startDate = '2024-09-01';
    const endDate = '2024-09-03';
    const events = await getParliamentEventsBetweenDates(startDate, endDate);
    console.log(events);
  }
})();

module.exports.getParliamentEventsBetweenDates = getParliamentEventsBetweenDates;
// module.exports.getParliamentEvents = () => getParliamentEventsBetweenDates();
