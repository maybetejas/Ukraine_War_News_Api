const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const { response } = require('express');
const app = express();
const PORT = process.env.PORT || 3000

const sites = [
    {
        name: "Al Jazeera",
        address: "https://www.aljazeera.com/tag/ukraine-russia-crisis/",
        base: 'https://www.aljazeera.com'
    },
    {
        name: 'BBC',
        address: 'https://www.bbc.com/news/world-60525350',
        base: 'https://www.bbc.com'
    },
    {
        name: 'The Guardian',
        address: 'https://www.theguardian.com/world/ukraine',
        base: ''
    }
];

const content = [];

sites.forEach(site => {
    axios.get(site.address).then(response => {
        const html = response.data;
        const $ = cheerio.load(html)

        $('a:contains("Ukraine")', html).each(function () {
            const title = $(this).text();
            const url = $(this).attr('href');

            content.push({
                title,
                url: site.base + url,
                site: site.name
            })
        })
    }).catch(err => { console.log(err) })
})

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname + '/index.html')
})

app.get('/news', (req, res) => {
    res.json(content)
})

app.get('/news/:id', async (req, res) => {

    const id = req.params.id;

    const siteAddress = sites.filter(site => site.name == id)[0].address
    const siteUrlBase = sites.filter(site => site.name == id)[0].base

    axios.get(siteAddress).then(response => {
        const html = response.data;
        const $ = cheerio.load(html)
        const specificContent = []

        $('a:contains("Ukraine")', html).each(function () {
            const title = $(this).text()
            const url = $(this).attr('href')
            specificContent.push({
                title,
                url: siteUrlBase + url,
                source: id
            })
        })
        res.json(specificContent)
    }).catch(err => { console.log(err) })

})

app.listen(PORT, (err) => {
    if (err) console.log(err)
    console.log('💓')
})