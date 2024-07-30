const { createMarkdownFiles } = require('./saveEvents');
const { getBankOfEnglandEvents } = require('./scrapers/bank_of_england');
const { getNHSEvents } = require('./scrapers/nhs');
const { getOnsEvents } = require('./scrapers/ons');
// const { getBankOfEnglandEvents } = require('./scrapers/bank_of_england');
//const getControlRisksEvents = require('./scrapers/control_risks')
//const getParliamentEvents = require('./scrapers/parliament')
const { getRoyalEvents } = require('./scrapers/royal_events');

const { getControlRisksEvents } = require('./scrapers/control_risks');

(async () => {
  //const boeEvents = await getBankOfEnglandEvents()
  /*
  const nhsEvents = await getNHSEvents();
  const onsEvents = await getOnsEvents();
  const royalEvents = await getRoyalEvents()
  const boeEvents = await getBankOfEnglandEvents()

  const all = [
    ...nhsEvents,
    ...onsEvents,
    ...royalEvents
  ]
    */

  const controlRisksEvents = await getControlRisksEvents()

  createMarkdownFiles(controlRisksEvents)
  // createMarkdownFiles(all)
})()