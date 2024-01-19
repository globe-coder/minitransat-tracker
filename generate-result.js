const { Console } = require('console');
const fs = require('fs');

const inputJson = fs.readFileSync('boats.json', 'utf8');
const inputTracks = fs.readFileSync('tracks.json', 'utf8');
const jsonData = JSON.parse(inputJson);
const jsonTracks = JSON.parse(inputTracks);

const result = {
    "result": {}
};

function findLocById(tracks, id) {
    for (const track of tracks) {
        if (track.id === id) {
            return track.loc;
        }
    }
    return null; // Return null if id is not found
}

const boats = jsonData.reports.history;
const boatsData = boats[0].lines

for (let i = 0; i < boatsData.length; i++) {
    const racestatus = boatsData[i][1];
    if (racestatus != "RAC") {
        continue
    }
    const sail = parseInt(boatsData[i][0]);
    const locForId = findLocById(jsonTracks.tracks, sail);
    let lastLocDatetime = locForId[0][0];
    const trackDataArray = boatsData[i][21];
    const track = [];
    const firstPoint = [
        (locForId[0][1] / 100000),
        (locForId[0][2] / 100000)
    ];
    track.push(firstPoint);

    for (let j = 0; j < locForId.length - 1; j++) {
        lastLocDatetime += locForId[j + 1][0];
        const transformedPoint = [
            (locForId[j + 1][1] / 100000) + track[j][0],
            (locForId[j + 1][2] / 100000) + track[j][1]
        ];
        track.push(transformedPoint);
    }

    const lastPoint = [
        trackDataArray[0][1],
        trackDataArray[0][2]
    ];
    track.push(lastPoint);

    result.result[sail] = {
        "heading": boatsData[i][7],
        "rank": boatsData[i][2],
        "sail": sail,
        "timestamp": lastLocDatetime,
        "lat_dec": 46.27500,
        "lon_dec": 1.47500,
        "speed": boatsData[i][8],
        "1hour_heading": 0,
        "1hour_speed": 0,
        "1hour_vmg": 0,
        "1hour_distance": 0,
        "lastreport_heading": 0,
        "lastreport_speed": 0,
        "lastreport_vmg": 0,
        "lastreport_distance": 0,
        "24hour_heading": boatsData[i][15],
        "24hour_speed": 0,
        "24hour_vmg": boatsData[i][18],
        "24hour_distance": boatsData[i][16],
        "dtf": boatsData[i][4],
        "dtl": boatsData[i][5],
        "dtp": boatsData[i][6],
        "darksky_twd": "-",
        "darksky_tws": "-",
        "darksky_air": "-",
        "finished": "true",
        "total_time": "74d 03h 35min 46s",
        "track": track
    };
}

const resultJson = JSON.stringify(result, null, 4);
fs.writeFileSync('boats_result.json', resultJson, 'utf8');
