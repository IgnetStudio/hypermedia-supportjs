const request = require('request-promise-native');

module.exports = {
    checkExistence({url, method = "GET"}) {
        return request({
            method,
            url
        }).then(
            () => {}
        );
    }
};
