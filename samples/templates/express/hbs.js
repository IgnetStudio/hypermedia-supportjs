const express = require('express');
const hbs = require('hbs');
const thenify = require('thenify');
const routes = require("./routes.js");

const app = express();

thenify(hbs.registerPartials.bind(hbs))(__dirname + '/views/partials')
    .then(() => {
        console.log('partials registered');
        app.set('view engine', 'html');
        app.engine('html', hbs.__express);

        hbs.registerHelper("is_index", (info) => {
            return info.data.middleware === "index";
        });

        hbs.localsAsTemplateData(app);

        routes(app);

        app.use('/', (req, res) => {
            res.render("page", res.body);
        });
        app.listen(8080);
    });
