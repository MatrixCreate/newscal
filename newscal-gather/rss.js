const Parser = require('rss-parser');
const fs = require('fs');

// Create a new instance of RSS parser
const parser = new Parser();

// URL of the RSS feed
const rssUrl = 'https://www.legislation.gov.uk/new/uksi/data.feed';

const scotlandRssUrl = 'https://www.legislation.gov.uk/new/asp/data.feed'

async function fetchAndConvertRSS() {
    try {
        // Parse the RSS feed
        const feed = await parser.parseURL(rssUrl);

        // Convert RSS feed to JSON
        const jsonFeed = {
            title: feed.title,
            description: feed.description,
            items: feed.items.map(item => ({
                title: item.title,
                link: item.link,
                description: item.contentSnippet,
                pubDate: item.pubDate
            }))
        };

        // Save JSON to a file
        fs.writeFileSync('feed.json', JSON.stringify(jsonFeed, null, 2));

        console.log('RSS feed successfully converted to JSON and saved as feed.json');
    } catch (error) {
        console.error('Error fetching or converting RSS feed:', error);
    }
}

// Execute the function
fetchAndConvertRSS();
