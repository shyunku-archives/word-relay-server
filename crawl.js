// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
const axios = require('axios');

// https://ac-dict.naver.com/enko/ac?st=11&r_lt=11&q=unique&_callback=window.__jindo2_callback._4956

module.exports = {
    getMeanings: function(query, resolve){
        let url = `https://en.dict.naver.com/api3/enko/search?query=${query}&m=pc&range=word&page=1&lang=ko`;
        axios.get(url)
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                throw err;
            });
    }
}