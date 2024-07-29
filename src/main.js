import DataTable from 'datatables.net-dt';
import 'datatables.net-responsive-dt';
import { Calendar } from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';

window.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#myTable')) {
    let table = new DataTable('#myTable', {
        responsive: true
    });
  }

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