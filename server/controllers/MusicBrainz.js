const package = require("../../package.json");
const version = package.version;

const parseMusicBrainzURL = (endpoint, queryParams) => {
    const root = 'https://musicbrainz.org/ws/2';
    const queryString = Object.entries(queryParams).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
    const url = `${root}${endpoint}?${queryString}`;

    return url;
}

const fetchMusicBrainz = async (endpoint, queryParams) => {
    const url = parseMusicBrainzURL(endpoint, queryParams);
    const response = await fetch(url,{
        method: "GET",
        headers: {
            "Accept": "application/json",
            "User-Agent": `Rewind.le/${version} ( maffie@mail.rit.edu )`,
        }
    });
    const responseJson = await response.json();
    return responseJson;
}

const getAlbumInfo = async (mbid) => {
    return await fetchMusicBrainz(`/release/${mbid}`, {});
}

module.exports = {
    getAlbumInfo,
}