/**
 * Created by yong.liu on 2015/5/7.
 */

/**
 * bleach client
 */

var zlib = require('zlib');
var request = require('request');
var querystring = require('querystring');

var Nba = function () {
    this.fn = null;
    this.actions = [];
    this.customValue = {};
    this.options = {}
};

module.exports = Nba;

Nba.prototype.run = function () {
    var self = this;

    var timer = setInterval(breath, self.breathIntervalTime);

    function breath() {
        if (self.fn === null) {
            self.fn = self.actions.shift();
            return
        }

        if (self.fn() === undefined) {
            if (self.actions.length) {
                self.fn = self.actions.shift();
            } else {
                console.log('clear timer')
                clearInterval(timer);
            }
        }
    }
};

Nba.prototype.getThinkTime = function () {
    return Math.ceil(Math.random() * this.thinkTimeMax / 1000);
}

Nba.prototype.init = function (params, cb) {
    this.port = params.port;
    this.host = params.host;

    this.options = {
        headers: {
            'Accept-Encoding': 'gzip'
        }
    };

    setImmediate(cb);
}

Nba.prototype.request = function (path, param, callback) {
    this.options.url = 'http://' + this.host + ':' + this.port + path;
    this.options.body = querystring.stringify(param);

    var req = request.post(this.options);

    req.on('response', function (res) {
        var chunks = [];

        res.on('data', function (chunk) {
            chunks.push(chunk);
        });

        res.on('end', function () {
            var buffer = Buffer.concat(chunks);
            console.log(res.headers)
            var encoding = res.headers['content-encoding'];
            if (encoding == 'gzip') {
                zlib.gunzip(buffer, function (err, decoded) {
                    callback(decoded && decoded.toString());
                });
            } else if (encoding == 'deflate') {
                zlib.inflate(buffer, function (err, decoded) {
                    callback(decoded && decoded.toString());
                })
            } else {
                callback(buffer.toString());
            }
        });
    });

    req.on('error', function (err) {
        callback(err);
    });
};