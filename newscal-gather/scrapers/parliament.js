const { chromium } = require('playwright');
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"

// URL to fetch data from
const url = 'https://whatson.parliament.uk/events/commons/thisweek/';

const getParliamentEvents = async (url) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent, bypassCSP: true });

  try {
    const page = await context.newPage();
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForSelector('.item-card-list .card', { timeout: 2000 });

    // Extract information for each item
    const items = await page.$$eval('.item-card-list .card', (cards) => {
      // Convert month abbreviation to number
      const monthToNumber = (month) => {
        const months = {
          Jan: '01',
          Feb: '02',
          Mar: '03',
          Apr: '04',
          May: '05',
          Jun: '06',
          Jul: '07',
          Aug: '08',
          Sep: '09',
          Oct: '10',
          Nov: '11',
          Dec: '12'
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

        // If title is not found, use category1 as title
        const finalTitle = title || category1;

        const date = year && month && day
          ? `${year}-${monthToNumber(month)}-${day.padStart(2, '0')}`
          : '';

        return {
          title: finalTitle,
          category1: category1,
          date: date,
          link: link
        };
      });
    });

    return items;
  } catch (error) {
    console.error('Error fetching or processing data:', error);
  } finally {
    await context.close();
    await browser.close();
  }
};

(async () => {
  const events = await getParliamentEvents(url);
  console.log(events);
})();
