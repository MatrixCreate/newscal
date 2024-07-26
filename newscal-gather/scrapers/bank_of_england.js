const playwright = require("playwright");

// Example usage:
// const text = "UK International Reserves - September 2024 (to be published at 9.30am)";
// console.log(extractTime(text)); // Outputs: "9.30am"

// Example usage:
const dateStr = "2024-09-15";
const timeStr = "9.30am";
// console.log(createUTCDate(dateStr, timeStr)); // Outputs UTC timestamp in milliseconds

const getBankOfEnglandEvents = async () => {
  for (const browserType of ["chromium"]) {
    const browser = await playwright[browserType].launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("https://www.bankofengland.co.uk/news/upcoming");

    // Array to hold all events from all pages
    const allEvents = [];

    while (true) {
      // Wait for all network connections to finish
      await page.waitForLoadState("networkidle");

      // Fetch and extract events on the current page
      const events = await page.$$eval("#SearchResults .release", (results) => {
        function extractTime(str) {
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

        function createUTCDate(dateStr, timeStr) {
          // Define a date object from the provided date string
          const [year, month, day] = dateStr.split("-").map(Number);

          // Define regex to parse time components
          const timeRegex = /(\d{1,2})(?:\.(\d{1,2}))?(am|pm)/i;
          const timeMatch = timeStr.match(timeRegex);

          // Return null if time is invalid
          if (!timeMatch) return null;

          let [, hour, minutes, period] = timeMatch;
          hour = Number(hour);
          minutes = minutes ? Number(minutes) : 0;

          // Adjust hour for am/pm
          if (period.toLowerCase() === "pm" && hour !== 12) {
            hour += 12;
          } else if (period.toLowerCase() === "am" && hour === 12) {
            hour = 0;
          }

          // Create a Date object in UTC
          const date = new Date(Date.UTC(year, month - 1, day, hour, minutes));

          return date.getTime(); // Return UTC timestamp in milliseconds
        }
        // Example usage:
        return results.map((result) => {
          // Extract the title
          const title = result.querySelector("h3.list").innerText;

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
          const timePart = extractTime(title);
          const utc = createUTCDate(date, timePart ? timePart : "00:01");
          const allDay = !timePart;

          return {
            title,
            date: {
              day: dateParts[2],
              month: dateParts[1],
              year: dateParts[0],
              timePart,
              utc,
              allDay,
            },
            tags: [parentCategory, childCategory],
            category: "Finance",
            source: "Bank of England",
          };
        });
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

    console.log(JSON.stringify(allEvents, null, 2));

    await browser.close();
    return allEvents;
  }
};

module.exports.getBankOfEnglandEvents = getBankOfEnglandEvents;
