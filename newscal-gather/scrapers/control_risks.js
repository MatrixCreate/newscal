function parseDate(dateStr) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const parseSingleDate = (day, month, year) => {
        const monthIndex = months.indexOf(month);
        if (monthIndex === -1) return null;
        return { day: parseInt(day, 10), month: monthIndex + 1, year: parseInt(year, 10) };
    };

    const parseMonthYear = (month, year) => {
        const monthIndex = monthsFull.indexOf(month);
        if (monthIndex === -1) return null;
        return { day: null, month: monthIndex + 1, year: parseInt(year, 10) };
    };

    const singleDatePattern = /^(\d{1,2}) (\w{3}) (\d{4})$/;
    const rangeDatePattern = /^(\d{1,2})-(\d{1,2}) (\w{3}) (\d{4})$/;
    const monthRangePattern = /(\d{1,2}) (\w{3})-(\d{1,2}) (\w{3}) (\d{4})/;

    //const monthYearPattern = /^(\w{3,9}) (\d{4})$/; // For "November 2024"
    const monthYearPattern = /(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})/;

    //console.log(dateStr.trim(), monthYearPattern.test(dateStr.trim()))

    if (singleDatePattern.test(dateStr)) {
        const [, day, month, year] = dateStr.match(singleDatePattern);
        const parsedDate = parseSingleDate(day, month, year);
        if (parsedDate) return { ...parsedDate, info: "" };
    } else if (rangeDatePattern.test(dateStr)) {
        const [, startDay, , month, year] = dateStr.match(rangeDatePattern);
        const parsedDate = parseSingleDate(startDay, month, year);
        if (parsedDate) return { ...parsedDate, info: "" };
    } else if (monthRangePattern.test(dateStr)) {
        const [, startDay, startMonth, , , year] = dateStr.match(monthRangePattern);
        const parsedDate = parseSingleDate(startDay, startMonth, year);
        if (parsedDate) return { ...parsedDate, info: "" };
    } else if (monthYearPattern.test(dateStr.trim())) {
        const [, month, year] = dateStr.match(monthYearPattern);
        console.log({ month, year })
        const parsedMonthYear = parseMonthYear(month, year);
        if (parsedMonthYear) return { ...parsedMonthYear, info: "" };
    }

    return { day: null, month: null, year: null, info: dateStr };
}

// // Example usage:
// console.log(parseDate("4 Jul 2024"));            // { day: 4, month: 7, year: 2024, info: "" }
// console.log(parseDate("5-6 Jul 2024"));          // { day: 5, month: 7, year: 2024, info: "" }
// console.log(parseDate("20 Jul-10 Aug 2024"));    // { day: 20, month: 7, year: 2024, info: "" }
// console.log(parseDate("November 2024"));         // { day: null, month: 11, year: 2024, info: "" }
// console.log(parseDate("Early-Mid November 2024"));         // { day: null, month: 11, year: 2024, info: "" }
// console.log(parseDate("invalid date"));          // { day: null, month: null, year: null, info: "invalid date" }

const axios = require('axios');
const cheerio = require('cheerio');

async function getControlRisksEvents() {
    try {
        // Replace this URL with the actual URL of your webpage
        const { data } = await axios.get('https://www.controlrisks.com/our-thinking/geopolitical-calendar');

        const $ = cheerio.load(data);
        const events = [];

        $('tbody tr').each((index, element) => {
            const $row = $(element);
            const $firstCell = $row.find('td').first();
            const dateText = $firstCell.text().trim();
            const date = dateText ? parseDate(dateText) : '';

            const $titleCell = $row.find('td').eq(1);
            const title = $titleCell.text().trim();

            const $locationCell = $row.find('td').eq(2);
            const location = $locationCell.text().trim();

            const $descriptionRow = $row.next('.border-bottom');
            const description = $descriptionRow.find('.info').text().trim();

            if (date && title && location) {
                events.push({
                    title,
                    date,
                    location,
                    description
                });
            }
        });

        console.log(JSON.stringify(events, null, 2));

    } catch (error) {
        console.error('Error fetching or parsing data:', error);
    }
}


module.exports = getControlRisksEvents