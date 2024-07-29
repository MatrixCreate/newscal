import DataTable from 'datatables.net-dt';
import 'datatables.net-responsive-dt';
import { Calendar } from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';

const SOURCE_COL = 1
const DATE_COL = 2

function isInThePast(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to 00:00:00

  const year = dateString.split('-')[0]
  const inputDate = new Date(dateString + 'T00:00:00'); // Parse input date
  if (year == '2023') {
    console.log(inputDate < today)
  }

  return inputDate < today; // Compare dates
}


window.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#eventsTable')) {
    let table = new DataTable('#eventsTable', {
        responsive: true
    });

    const pastEventsEl = document.querySelector('.js-past-events')

    if (pastEventsEl) {
      const updateOption = () => {
        const shouldShowPast = pastEventsEl.checked
        if (shouldShowPast) {
          table.column(DATE_COL).search((text) => true).draw()
        } else {
          table.column(DATE_COL).search((dateStr) => !isInThePast(dateStr)).draw()
        }
      }

      updateOption()

      pastEventsEl.addEventListener('change', (e) => {
        updateOption()
      })
    }

    const filteredSources = new Set()

    document.querySelectorAll('.js-source').forEach(sourceEl => {
      const updateSourceEl = () => {
        const name = sourceEl.value

        if (sourceEl.checked) {
          filteredSources.delete(name)
        } else {
          filteredSources.add(name)
        }

        updateSearch(table, filteredSources)
      }

      updateSourceEl()
      updateSearch(table, filteredSources)

      sourceEl.addEventListener('change', () => {
        updateSourceEl()
        updateSearch(table, filteredSources)
      })
    })
  }
})


function updateSearch(table, filteredSources) {
  table
    .column(SOURCE_COL)
    .search(text => !filteredSources.has(text))
    .draw()
}

window.addEventListener('DOMContentLoaded', () => {
  const calendarEl = document.querySelector('.calendar')

  if (calendarEl) {
    console.log(window.calEvents)
    const calendar = new Calendar(calendarEl, {
      plugins: [ dayGridPlugin ],
      viewType: "dayGridMonth",
      events:  [...window.calEvents, ],
    })

    calendar.render()
  }
})