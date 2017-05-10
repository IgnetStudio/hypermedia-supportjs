const {DataStream} = require("scramjet")
const http = require("http");
const request = require("request-promise");

new Promise((res) => {
    const srv = http.createServer((req, res) => {
        console.log("connect", req.url);
        const resNum = +req.url.substr(1) + 10;

        res.writeHead(200, {"content-type": "text/plain"});
        res.end(resNum.toString());

    }).listen(1410, () => res(srv));
}).then(
    (srv) => DataStream.fromArray([1,2,3,4,5])
        .map((n) => ({"a":n}))
        .map(
            (chunk) => request.get("http://localhost:1410/" + chunk.a)
        )
        .reduce((acc, item) => acc += +item, 0)
        .then((res) => console.log(res))
);
