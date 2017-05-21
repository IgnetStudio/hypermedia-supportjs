const app = require("express")();
const {PassThrough} = require('stream');
const fs = require('fs');

// tworzymy strumień do przekierowania do pliku
const streamOfLogs = new PassThrough();

// używamy sytrumienia do logów w morgan
app.use(require("morgan")("combined", {stream: streamOfLogs}));

// dodajemy domyślną aplikację (zwraca zawsze 204 No Content)
app.use((req, res) => {
    res.sendStatus(204);
});

// tworzymy funkcję otwierającą logi
let writeLog = null;
const reopenLog = () => {
    if (writeLog) {
        streamOfLogs.unpipe(writeLog);
        writeLog.end();
    }
    streamOfLogs.pipe(
        writeLog = fs.createWriteStream("./sigusr1.log", {flags: "a"})
    );
    console.error("writing to logfile");
};

// a przy okazji uruchamiamy pierwszy raz
reopenLog();

// obsługujemy żądanie logrotate
process.on('SIGUSR1', reopenLog);
app.listen(8080);

console.error("Running with pid=" + process.pid);
