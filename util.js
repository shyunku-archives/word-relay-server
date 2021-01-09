function getRandomInt(max) {
    min = 0;
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function randSeedStr(str, len) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let res = "";
    for (let i = 0; i < len; i++) {
        res += chars.charAt(Math.floor(randSeedFloat(str + i) * chars.length));
    }
    return res;
}

function randSeedHexStr(str, len) {
    const chars = "ABCDEF0123456789";
    let res = "";
    for (let i = 0; i < len; i++) {
        res += chars.charAt(Math.floor(randSeedFloat(str + i) * chars.length));
    }
    return res;
}

function ellipsisString(str, len){
    if(str.length <= len){
        return str;
    }

    return str.substring(0, len - 1) + "...";
}

function randSeedFloat(str) {
    let seed = xmur3(str);
    let rand = mulberry32(seed());
    return rand();
}

function xmur3(str) {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
        h = h << 13 | h >>> 19;
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

function mulberry32(a) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}