const axios = require('axios');
const fs = require('fs');

// ========================= TAKEN 'AS IS' FROM CHROME ========================
// UInt8Array constructor implementation from Chrome, used to decode geovoile
// responses is not available in nodeJS, so we directly copy this 
// implementation from Chrome devtools. Not very nice but it does the job ;-)

var _0Xedc3 = function (_0xc5c0x2) {
	var _0xc5c0x3 = 10219599;
	var _0xc5c0x4 = 10361048;
	var _0xc5c0x5 = 4455634;
	var _0xc5c0x6 = 16642882;
	for (var _0xc5c0x7 = 0; _0xc5c0x7 < _0xc5c0x2; ++_0xc5c0x7) {
		_0xc5c0x8()
	}
	; function _0xc5c0x8() {
		var _0xc5c0x9 = _0xc5c0x3;
		_0xc5c0x9 ^= (_0xc5c0x9 << 11) & 0xFFFFFF;
		_0xc5c0x9 ^= (_0xc5c0x9 >> 8) & 0xFFFFFF;
		_0xc5c0x3 = _0xc5c0x4;
		_0xc5c0x4 = _0xc5c0x5;
		_0xc5c0x5 = _0xc5c0x6;
		_0xc5c0x6 ^= (_0xc5c0x6 >> 19) & 0xFFFFFF;
		_0xc5c0x6 ^= _0xc5c0x9
	}
	return function (_0xc5c0xa) {
		var _0xc5c0xb = _0xc5c0xa ^ (_0xc5c0x3 & 0xFF);
		_0xc5c0x8();
		return _0xc5c0xb
	}
}

var UInt8Array = function (input) {
	var _0x7f4ax3 = new Uint8Array(input);
	var _0x7f4ax4 = _0Xedc3(_0x7f4ax3[0]);
	var _0x7f4ax5 = (_0x7f4ax4(_0x7f4ax3[1]) << 16) +
		(_0x7f4ax4(_0x7f4ax3[2]) << 8) +
		(_0x7f4ax4(_0x7f4ax3[3]));
	var _0x7f4ax6 = 4;
	var _0x7f4ax7 = new Uint8Array(_0x7f4ax5);
	var _0x7f4ax8 = 0;
	while (_0x7f4ax6 < _0x7f4ax3['length'] && _0x7f4ax8 < _0x7f4ax5) {
		var _0x7f4ax9 = _0x7f4ax3[_0x7f4ax6];
		_0x7f4ax9 = (_0x7f4ax9 ^ (_0x7f4ax6 & 0xFF)) ^ 0xA3;
		++_0x7f4ax6;
		for (var _0x7f4axa = 7; _0x7f4axa >= 0; _0x7f4axa--) {
			if ((_0x7f4ax9 & (1 << _0x7f4axa)) == 0) {
				_0x7f4ax7[_0x7f4ax8++] = _0x7f4ax4(_0x7f4ax3[_0x7f4ax6++])
			} else {
				var _0x7f4axb = _0x7f4ax4(_0x7f4ax3[_0x7f4ax6]);
				var _0x7f4axc = (_0x7f4axb >> 4) + 3;
				var _0x7f4axd = (
					((_0x7f4axb & 0xF) << 8) |
					_0x7f4ax4(_0x7f4ax3[_0x7f4ax6 + 1])
				) + 1;
				_0x7f4ax6 += 2;
				for (var _0x7f4axe = 0; _0x7f4axe < _0x7f4axc; _0x7f4axe++) {
					_0x7f4ax7[_0x7f4ax8] = _0x7f4ax7[_0x7f4ax8++ - _0x7f4axd]
				}
			}
			; if (_0x7f4ax6 >= _0x7f4ax3['length'] &&
				_0x7f4ax7['length'] >= _0x7f4ax5) {
				break
			}
		}
	}
	; return _0x7f4ax7
}

// ================================ CONSTANTS =================================

const geovoileHostname = 'minitransat.geovoile.com';
const resourcesBasePath = '/2023/resources/versions/leg2/';
const trackerBasePath = '/2023/tracker/resources/leg2/';

// ================================== UTILS ===================================

function handleError(error) {
	console.error(error);
	process.exit(1)
}

function geoVoileGet(path, callback) {
	let url = 'https://' + geovoileHostname + path;
	let options = {
		method: 'get',
		responseType: 'arraybuffer'
	};

	axios.get(url, options)
		.then(response => {
			callback(response.data);
		})
		.catch(error => {
			handleError(error);
		});
}

function getTracksVersion(callback) {
	let legPath = resourcesBasePath + 'v=' + new Date().getTime();

	geoVoileGet(legPath, function (data) {
		let resourcesVersions = eval("(" + data + ")");
		callback(resourcesVersions['tracks']);
	})
}

function downloadReport(path, callback) {
	geoVoileGet(path, function (data) {
		let uInt8Array = new UInt8Array(data);
		let decodedData = new TextDecoder('utf-8').decode(uInt8Array);
		callback(decodedData);
	})
}

// =================================== MAIN ===================================

// Download boats
let boatsVersion = Math.floor(new Date().getTime() / 1000 / 5) * 5;
let boatsPath = trackerBasePath + 'live/v' + boatsVersion;

downloadReport(boatsPath, function (reportData) {
	fs.writeFile('./boats.json', reportData, err => {
		if (err) { handleError(err) }
	});
});

// Download tracks
getTracksVersion(function (tracksVersion) {
	let tracksPath = trackerBasePath + 'tracks/v' + tracksVersion;
	downloadReport(tracksPath, function (reportData) {
		fs.writeFile('./tracks.json', reportData, err => {
			if (err) { handleError(err) }
		});
	});
});


