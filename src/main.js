import DataTable from 'datatables.net-dt';
import 'datatables.net-responsive-dt';
import { Calendar } from '@fullcalendar/core';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';

const SOURCE_COL = 2;
const DATE_COL = 3;

function isInThePast(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to 00:00:00

  const inputDate = new Date(dateString + 'T00:00:00'); // Parse input date

  return inputDate < today; // Compare dates
}

window.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#eventsTable')) {
    let table = new DataTable('#eventsTable', {
      responsive: true
    });

    const pastEventsEl = document.querySelector('.js-past-events');
    const hideFutureEventsEl = document.querySelector('.js-future-events');

    const updateOption = () => {
      const showPast = pastEventsEl.checked;
      const hideFuture = hideFutureEventsEl.checked;
      //console.log({ showPast, hideFuture })

      table.column(DATE_COL).search((dateStr) => {
        const isPast = isInThePast(dateStr);
        if (showPast && hideFuture) { //
          // console.log({ dateStr, isPast })
          return isPast;
        } else if (showPast && !hideFuture) { // everything
          return true;
        } else if (!showPast && hideFuture) {
          return false;
        } else { // (!showPast && !hideFuture)
          return !isPast; // Show all if neither option is selected
        }
      }).draw();
    };

    if (pastEventsEl) {
      updateOption();
      pastEventsEl.addEventListener('change', updateOption);
    }

    if (hideFutureEventsEl) {
      hideFutureEventsEl.addEventListener('change', updateOption);
    }

    const filteredSources = new Set();

    document.querySelectorAll('.js-source').forEach(sourceEl => {
      const updateSourceEl = () => {
        const name = sourceEl.value;

        if (sourceEl.checked) {
          filteredSources.delete(name);
        } else {
          filteredSources.add(name);
        }

        updateSearch(table, filteredSources);
      };

      updateSourceEl();
      updateSearch(table, filteredSources);

      sourceEl.addEventListener('change', () => {
        updateSourceEl();
        updateSearch(table, filteredSources);
      });
    });
  }
});

function updateSearch(table, filteredSources) {
  table
    .column(SOURCE_COL)
    .search(text => !filteredSources.has(text))
    .draw();
}


window.addEventListener('DOMContentLoaded', () => {
  const calendarEl = document.querySelector('.calendar')

  if (calendarEl) {
    console.log(window.calEvents)
    const calendar = new Calendar(calendarEl, {
      plugins: [ dayGridPlugin, listPlugin  ],
      viewType: "listMonth",
      events:  [...window.calEvents, ],
    })

    calendar.render()
  }
})