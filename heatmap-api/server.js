const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.get('/heatmap-data', (req, res) => {
    fs.readFile('/Users/polina/heatmapproj/heatmap-api/data/mapdata.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send("Error reading data");
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/heatmap.html');
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

