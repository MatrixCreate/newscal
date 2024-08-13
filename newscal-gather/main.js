const fs = require('fs');
const { getBankOfEnglandEvents } = require('./scrapers/bank_of_england');
const { getNHSEvents } = require('./scrapers/nhs');
const { getOnsEvents } = require('./scrapers/ons');
const { getControlRisksEvents } = require('./scrapers/control_risks');
const { getParliamentEvents } = require('./scrapers/parliament');
const { getRoyalEvents } = require('./scrapers/royal_events');
const { getGovEvents } = require('./scrapers/gov')

const { extractSources } = require('./extract-sources');

const fetchEventsSafely = async (fetchFunction) => {
  try {
    return await fetchFunction();
  } catch (error) {
    console.error(`Failed to fetch events: ${error.message}`);
    return [];
  }
};

(async () => {
  // Fetch events with error handling
  const govEvents = await fetchEventsSafely(getGovEvents)
  const nhsEvents = await fetchEventsSafely(getNHSEvents)
  const nestedEvents = await Promise.all([
    fetchEventsSafely(getBankOfEnglandEvents),
    fetchEventsSafely(getOnsEvents),
    fetchEventsSafely(getRoyalEvents),
    fetchEventsSafely(getControlRisksEvents),
    //fetchEventsSafely(getParliamentEvents),
  ]);

  // Combine results
  const allEvents = [...(nestedEvents.flat()), ...nhsEvents, ...govEvents ]

  // File path
  const path = './content/events/events.json';

  // Load existing events from file if it exists
  let existingEvents = [];
  if (fs.existsSync(path)) {
    existingEvents = JSON.parse(fs.readFileSync(path, 'utf-8'));
  }

  // Function to create a unique key from title and date
  const getUniqueKey = (event) => `${event.title}-${event.date}`;

  // Merge new events with existing events
  const uniqueEventsMap = new Map();

  // Add existing events to the map
  existingEvents.forEach(event => uniqueEventsMap.set(getUniqueKey(event), event));

  // Add new events to the map, overwriting duplicates
  allEvents.forEach(event => uniqueEventsMap.set(getUniqueKey(event), event));

  const uniqueEvents = Array.from(uniqueEventsMap.values());

  // Save merged events to file
  fs.writeFileSync(path, JSON.stringify(uniqueEvents, null, 2), 'utf-8');

  // Extract sources
  extractSources();
})();
