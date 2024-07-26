const { chromium } = require("playwright");
const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36";

const getRoyalEvents = async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent, bypassCSP: true });
  const allEvents = [];

  try {
    let pageNumber = 0;
    let hasNextPage = true;

    while (hasNextPage) {
      const page = await context.newPage();
      await page.goto(
        `https://www.royal.uk/media-centre/future-engagements?page=${pageNumber}`
      );
      await page.waitForSelector(".listing-item", { timeout: 2000 });

      // Extract events
      const items = await page.$$eval(".listing-item", (elements) => {
        return elements.map((element) => {
          const title = element
            .querySelector(".listing-item__title")
            .innerText.trim();
          const description = element
            .querySelector(
              ".listing-item__content > p:not(.listing-item__published)"
            )
            .innerText.trim();
          const dateElement = element.querySelector(
            ".listing-item__published time"
          );
          const date = new Date(dateElement.getAttribute("datetime"));

          return {
            title,
            description,
            date: {
              day: date.getUTCDate(),
              month: date.getUTCMonth() + 1,
              year: date.getUTCFullYear(),
            },
          };
        });
      });

      allEvents.push(...items);

      // Check for next page
      const nextButton = await page.$(".pager__item--next a");
      if (nextButton) {
        pageNumber++;
      } else {
        hasNextPage = false;
      }

      await page.close();
    }
  } catch (e) {
    console.log(e);
  } finally {
    await context.close();
    await browser.close();
  }

  return allEvents;
};

module.exports = getRoyalEvents;
