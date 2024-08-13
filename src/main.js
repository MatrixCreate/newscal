import DataTable from 'datatables.net-dt';
import 'datatables.net-responsive-dt';
import { Calendar } from '@fullcalendar/core';
//import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import Fuse from 'fuse.js'

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

    const updateSourceEl = (sourceEl) => {
      const name = sourceEl.value;

      if (sourceEl.checked) {
        filteredSources.delete(name);
      } else {
        filteredSources.add(name);
      }

      updateSearch(table, filteredSources);
    };

    document.querySelectorAll('.js-source').forEach(sourceEl => {
      updateSourceEl(sourceEl);
      updateSearch(table, filteredSources);

      sourceEl.addEventListener('change', () => {
        updateSourceEl(sourceEl);
        updateSearch(table, filteredSources);
      });
    });

    // Function to select all checkboxes
    function selectAll() {
      document.querySelectorAll('.checkbox.js-source').forEach(checkbox => {
        checkbox.checked = true;
        updateSourceEl(checkbox);
      });
      updateSearch(table, filteredSources)
    }

    // Function to deselect all checkboxes
    function selectNone() {
      document.querySelectorAll('.checkbox.js-source').forEach(checkbox => {
        checkbox.checked = false;
        updateSourceEl(checkbox);
      });
      updateSearch(table, filteredSources)
    }

    // Add event listeners to buttons
    document.querySelector('.js-all-sources').addEventListener('click', selectAll);
    document.querySelector('.js-no-sources').addEventListener('click', selectNone)
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
      plugins: [ dayGridPlugin, /*listPlugin*/  ],
      viewType: "listMonth",
      events:  [...window.calEvents, ],
    })

    calendar.render()
  }
})

window.addEventListener('DOMContentLoaded', () => {
    // Sample data extraction
  const items = Array.from(document.querySelectorAll('.js-sources .label-text')).map(label => label.textContent);

  // Create a Fuse instance
  const fuse = new Fuse(items, { includeScore: true, threshold: 0.3 });

  // Function to filter items
  function filterItems(query) {
    const results = fuse.search(query).map(result => result.item);

    document.querySelectorAll('.js-sources .form-control').forEach(control => {
      const text = control.querySelector('.label-text').textContent;
      if (query == '') {
        control.style.display = 'block';  // Show
        return
      }

      if (results.includes(text)) {
        control.style.display = 'block';  // Show
      } else {
        control.style.display = 'none';   // Hide
      }
    });
  }

  // filterItems('England');  // Pass your query here

  document.querySelector('.js-search').addEventListener('keyup', (e) => {
    filterItems(e.target.value)
  })
})