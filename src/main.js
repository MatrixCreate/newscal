import DataTable from 'datatables.net-dt';
import 'datatables.net-responsive-dt';
import { Calendar } from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';


window.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#eventsTable')) {
    let table = new DataTable('#eventsTable', {
        responsive: true
    });

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
    .column(1)
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