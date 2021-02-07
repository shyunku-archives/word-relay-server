const express = require('express');
const router = express.Router();

const crawl = require('../crawl');

router.get('/meaning', (req, res) => {
    let query = req.query['query'];
    crawl.getMeanings(query, (result) => {
        let wordMap = result['searchResultMap']['searchResultListMap']['WORD'];
        let totalResultNum = wordMap.total;
        let searchedWord = wordMap.query;
        let meaningArr = wordMap.items.map(item => {

            let firstElem = item['meansCollector'][0];

            return {
                rank: item['rank'],
                source: item['sourceDictnameKO'],
                type: firstElem['partOfSpeech'],
                means: firstElem['means'].map(mitem => mitem.value.replace(/<[^>]*>/g, "")),
                exactMatch: item['exactMatch']
            };
        });

        let data = {
            totalResultNum: totalResultNum,
            targetWord: searchedWord,
            meanings: meaningArr
        };
        
        res.send(data);
    });    
});

module.exports = router;