const parseLastFmURL = (endpoint, queryParams) => {
    const root = 'http://ws.audioscrobbler.com/2.0/';
    const queryString = Object.entries(queryParams).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
    const url = `${root}?api_key=${process.env.API_KEY}&method=${endpoint}&${queryString}&format=json`;

    return url;
}

const fetchLastFm = async (endpoint, queryParams) => {
    const url = parseLastFmURL(endpoint, queryParams);
    const response = await fetch(url,{
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    const responseJson = await response.json();
    return responseJson;
}

const findAccount = async (username) => {
    const response = await fetchLastFm('user.getinfo', { user: username });
    if (response.error) {
        switch(response.error) {
            case 8:
            case 11:
            case 16:
                return {
                    "code": 502,
                    "json": {
                        "error": "Last.fm server error."
                    }
                };
            case 6:
                return {
                    "code": 404,
                    "json": {
                        "error": "Couldn't find account."
                    }
                };
            default:
                console.log(response);
                return {
                    "code": 500,
                    "json": {
                        "error": "An error occured."
                    }
                };
        }
    }

    return {
        "code": 200,
        "json": {
            "realname": response.user.realname,
            "username": response.user.name,
            "image": response.user.image.find((image => image.size === "large"))["#text"].replace("\\", "")
        }
    };
}

const getLastFm = async (req, res) => {
    const link = decodeURIComponent(req.query.link);

    const response = await fetch(link, {
        method: "GET"
    });

    const contentType = response.headers.get("Content-Type") || 'application/octet-stream';

    const fileBuffer = await response.arrayBuffer();
    res.type(contentType).send(Buffer.from(fileBuffer));
}

module.exports = {
    findAccount,
    getLastFm,
}