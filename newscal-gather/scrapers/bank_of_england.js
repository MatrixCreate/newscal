const playwright = require("playwright");

const { convertTo24Hour } = require('../util')

// Example usage:
// const text = "UK International Reserves - September 2024 (to be published at 9.30am)";
// console.log(extractTime(text)); // Outputs: "9.30am"

// Example usage:
const dateStr = "2024-09-15";
const timeStr = "9.30am";
// console.log(createUTCDate(dateStr, timeStr)); // Outputs UTC timestamp in milliseconds

function extractTime(str) {
  if (!str || typeof str != "string")
    return null

  // Define regex pattern to match time
  const regex = /(\d{1,2}(\.\d{1,2})?)(am|pm)/i;

  // Execute regex on the string
  const match = str.match(regex);

  // If a match is found, return the time
  if (match) {
    return match[0];
  } else {
    return null; // No time found
  }
}

const ctx = { convertTo24Hour, extractTime }

const getBankOfEnglandEvents = async () => {
  for (const browserType of ["chromium"]) {
    const browser = await playwright[browserType].launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.exposeFunction('extractTime', extractTime)
    await page.exposeFunction('convertTo24Hour', convertTo24Hour)

    await page.goto("https://www.bankofengland.co.uk/news/upcoming");

    // Array to hold all events from all pages
    const allEvents = [];

    while (true) {
      // Wait for all network connections to finish
      await page.waitForLoadState("networkidle");

      // Fetch and extract events on the current page
      const events = await page.$$eval("#SearchResults .release", async (results) => {
        const items = results.map(async (result) => {
          // Extract the title
          const title = result.querySelector("h3.list").innerText;
          const url = result.getAttribute('href')

          // Extract the date
          const dateElement = result.querySelector("time.release-date");

          const date = dateElement
            ? dateElement.getAttribute("datetime")
            : null;

          // Extract the tags
          const tagsElement = result.querySelector(".release-tag");
          const tags = tagsElement
            ? tagsElement.innerText.trim().split(" // ")
            : "";
          const parentCategory = tags[0];
          const childCategory = tags[1];
          const dateParts = date.split("-").map((n) => parseInt(n));

          const extractedTime = await window.extractTime(title)
          const timePart = await window.convertTo24Hour(extractedTime);
          // const timePart = await window.extractTime(title);
          // const utc = createUTCDate(date, timePart ? timePart : "00:01");
          const allDay = !timePart;

           const d = {date: {
              day: dateParts[2],
              month: dateParts[1],
              year: dateParts[0],
              time: JSON.stringify(timePart),
              // utc,
              allDay,
            }}
          return {
            title,
            url: `https://www.bankofengland.co.uk${url}`,
            date,
            time: timePart,
            extractedTime,
            description: `${parentCategory} - ${childCategory}`,
            // tags: [parentCategory, childCategory],
            // category: "Finance",
            source: "Bank of England",
          };
        });
        return Promise.all(items)
      });

      // Add the current page's events to the allEvents array
      allEvents.push(...events);

      try {
        await Promise.all([
          page.click(".list-pagination__link--next", { timeout: 200 }),
          page.waitForLoadState("networkidle"),
        ]);
      } catch (e) {
        break;
      }
    }

    await browser.close();
    return allEvents;
  }
};

(async () => {
  const events = await getBankOfEnglandEvents()

})()

module.exports.getBankOfEnglandEvents = getBankOfEnglandEvents;
