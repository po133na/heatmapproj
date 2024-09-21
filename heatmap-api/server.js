const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();
const PORT = 4000;


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/heatmap.html');
});


app.get('/external-final', async (req, res) => {
    const lat = req.query.lat;
    const lon = req.query.lon;

    try {
        const [responseAps, responseHouses, responseMc] = await Promise.all([
            axios.get(`https://catalog.api.2gis.com/3.0/items?q=жилой&type=building&subtype=living_area&point=${lon}%2C${lat}&radius=1000&fields=items.structure_info.apartments_count,items.point&key=de1246eb-2761-4da8-88a9-df6095139d02`),
            axios.get(`https://catalog.api.2gis.com/3.0/items?type=building&point=${lon}%2C${lat}&key=de1246eb-2761-4da8-88a9-df6095139d02&fields=items.purpose_code,items.point&radius=1000`),
            axios.get(`https://catalog.api.2gis.com/3.0/items?type=building&subtype=place&point=${lon}%2C${lat}&key=de1246eb-2761-4da8-88a9-df6095139d02&fields=items.purpose_code,items.point`)
        ]);

        const dataMc = responseMc.data.result.items || [];
        const filteredDataMc = dataMc.filter(item => item.purpose_code === 42);
        const extractedDataMc = filteredDataMc.map(item => ({
            latObj: item.point ? item.point.lat : null,
            lonObj: item.point ? item.point.lon : null
        }));

        const dataAps = responseAps.data.result.items || [];
        const extractedDataAps = dataAps.map(item => {
            const purpose_name = item.purpose_name;
            const apartments_count = item.structure_info ? item.structure_info.apartments_count : 0;

            let ppl_amount = 0;
            if (['Коттедж', 'Частный дом', 'Таунхаус', 'Сооружение'].includes(purpose_name)) {
                ppl_amount = 5;
            } else if (purpose_name === 'Жилой дом') {
                ppl_amount = apartments_count * 3.2;
            } else {
                ppl_amount = apartments_count * 5;
            }

            let scale = 'MISSING';
            if (ppl_amount >= 1000) {
                scale = 10;
            } else if (ppl_amount >= 600) {
                scale = 6;
            } else if (ppl_amount >= 300) {
                scale = 3;
            } else if (ppl_amount >= 1) {
                scale = 1;
            }

            return {
                lat: item.point ? item.point.lat : null,
                lon: item.point ? item.point.lon : null,
                ppl_amount,
                scale
            };
        });
        const dataHouses = responseHouses.data.result.items || [];
        const filteredDataHouses = dataHouses.filter(item => [71, 70, 48].includes(item.purpose_code));
        const extractedDataHouses = filteredDataHouses.map(item => {
            const ppl_amount = 5;

            let scale = 'MISSING';
            if (ppl_amount >= 1000) {
                scale = 10;
            } else if (ppl_amount >= 600) {
                scale = 6;
            } else if (ppl_amount >= 300) {
                scale = 3;
            } else if (ppl_amount >= 1) {
                scale = 1;
            }

            return {
                lat: item.point ? item.point.lat : null,
                lon: item.point ? item.point.lon : null,
                ppl_amount,
                scale
            };
        });
        const combinedData = {
            latObj: extractedDataMc[0] ? extractedDataMc[0].latObj : null,
            lonObj: extractedDataMc[0] ? extractedDataMc[0].lonObj : null,
            results: [...extractedDataAps, ...extractedDataHouses]
        };
        res.json(combinedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});


app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

