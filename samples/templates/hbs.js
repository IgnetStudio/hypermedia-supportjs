const hbs = require('handlebars');
const fs = require('fs');

const tpl = fs.readFileSync('./handlebars.hbs').toString('utf8');

["head", "tail"].forEach((name) => {
    hbs.registerPartial(name, fs.readFileSync('./'+name+'.hbs').toString('utf8'));
});
const template = hbs.compile(tpl);

const data = {
    title: 'abc',
    siteName: 'my Site',
    doc: [
        {name: 'Ford'},
        {name: 'Fiat'},
        {name: 'Porsche'},
        {name: 'Opel'}
    ],
    copy: {
        company: "Hypermedia",
        year: 2017
    }
};

console.log(template(data));
