const Parser = require("rss-parser");

let parser = new Parser();

/**
 * @typedef {Object} DateTime
 * @property {string} date - The date part of the ISO 8601 string.
 * @property {string} time - The time part of the ISO 8601 string.
 */

/**
 * @typedef {Object} Event
 * @property {string} title - The title of the event.
 * @property {string} description - The description of the event.
 * @property {string} source - The source of the event.
 * @property {DateTime} [dateTime] - The date and time of the event.
 */

/**
 * Converts an ISO 8601 date string to an object with date and time.
 * @param {string} isoDate - The ISO 8601 date string.
 * @returns {DateTime | null} An object with date and time, or null if isoDate is not provided.
 */
const isoToDateTime = (isoDate) => {
  if (isoDate) {
    const date = isoDate.split("T")[0];
    const time = isoDate.split("T")[1].split(".")[0];
    return {
      date,
      time,
    };
  }
  return null;
};

/**
 * Converts an RSS item to an event object.
 * @param {string} source - The source of the RSS feed.
 * @returns {(item: { title: string, summary: string, isoDate?: string }) => Event} A function that converts an RSS item to an event object.
 */
function itemToEvent(source) {
  return (item) => {
    const dateTime = isoToDateTime(item.isoDate);
    const publDateTime = isoToDateTime(item.pubDate)
    return {
      title: item.title,
      description: item.summary,
      source,
      url: item.link,
      ...(dateTime ? dateTime : {}),
    };
  };
}

/**
 * Fetches and parses RSS feed, then converts items to events.
 * @param {string} rssFeedUrl - The URL of the RSS feed.
 * @param {string} source - The source of the RSS feed.
 * @returns {Promise<Event[]>} A promise that resolves to an array of event objects.
 */
async function rssToEvents(rssFeedUrl, source) {
  const feed = await parser.parseURL(rssFeedUrl);
  return feed.items.map(itemToEvent(source));
}

module.exports.rssToEvents = rssToEvents;

(async () => {
  // const items = await rssToEvents(
  //   "https://www.legislation.gov.uk/new/data.feed", "Legislation"
  // );
  // console.log(JSON.stringify(items, null, 2));
})();
