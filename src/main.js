import DataTable from 'datatables.net-dt';
import 'datatables.net-responsive-dt';

window.addEventListener('DOMContentLoaded', () => {
  let table = new DataTable('#myTable', {
      responsive: true
  });

})