function convertTo24Hour(time) {
    if (!time || typeof time !== 'string') return null;
    // Updated regex to handle more formats, including dot as separator
    const timeRegex = /^(1[0-2]|0?[1-9])(?:[:.]([0-5][0-9]))?\s*(am|pm)?$/i;
    const match = time.match(timeRegex);
    if (!match) return undefined;
    let [_, hour, minute, period] = match;
    hour = parseInt(hour, 10);
    minute = minute ? parseInt(minute, 10) : 0;
    if (period) {
        period = period.toLowerCase();
        if (period === 'pm' && hour !== 12) {
            hour += 12;
        } else if (period === 'am' && hour === 12) {
            hour = 0;
        }
    } else if (hour === 12) {
        hour = 0; // Handle 12 AM as 00:00
    }
    // Pad hour and minute with leading zeros if necessary
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

module.exports.convertTo24Hour = convertTo24Hour