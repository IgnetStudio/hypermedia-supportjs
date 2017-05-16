const fs = require('fs');

module.exports = (app) => {

    const cacheJson = (name) => {
        let prm = null;

        return () => {
            if (prm) {
                return prm;
            }

            return prm = new Promise((res) => {
                fs.readFile(__dirname + '/data/' + name + '.json', (err, data) => err ? res(err) : res(data));
            }).then(
                (data) => {
                    setTimeout(() => prm = null, 1000);
                    return JSON.parse(data);
                }
            );
        };
    };

    const getJsonMiddleware = (name) => {
        let whenData = cacheJson(name);
        return (req, res, next) => {
            whenData()
                .then(
                    (data) => {
                        res.locals.middleware = name;

                        return res.body = Object.assign({middlewareName: name}, res.body, data);
                    }
                )
                .then(
                    (data) => (console.log('xx', data), data)
                )
                .then(
                    () => next()
                )
                .catch(
                    (err) => console.log('err', next(err))
                );
        };
    };

    app.use("/", (req, res, next) => {
        console.log("abc");
        getJsonMiddleware("index")(req, res, next);
    });
    app.use("/sub.html", getJsonMiddleware("subpage"));

};
