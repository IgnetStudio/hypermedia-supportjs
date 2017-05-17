Uruchamianie i środowisko
===========================

Ten dokument opisuje jak uruchomić proces node.js i jak podtrzymać jego działanie, jak również pokazuje jak radzić sobie
z otoczeniem naszej aplikacji (środowisko systemu operacyjnego, sieci itp.)

## Uruchomienie

Rozważymy trzy możliwe scenariusze uruchomienia aplikacji w node.js:

* Aplikacji konsolowej - aplikacji, która wykonuje zadanie i kończy działanie zwracając status do konsoli.
* Aplikacji wykonującej cykliczne zadania według określonego harmonogramu, bądź zaistniałych zdarzeń.
* Serwera - aplikacji oczekującej na wywołanie przez Klienta lub Klientów.

Rozważymy też dwa sposoby uruchomienia aplikacji, czyli:

* Uruchomienie w pierwszym planie (aplikacja przypięta do konsoli)
* Uruchomienia w tle (jako daemon)

Na koniec wyjaśnimy jak zapewnić automatyczne uruchomienie aplikacji oraz zapewnienie podtrzymania jej uruchomienia.

Aplikacja w node.js zakończy swoje działanie, kiedy w pętli zdarzeń nie pojawią się oczekiwania na kolejne. Takie
oczekiwania mogą być wywołanie przez np.:

* Otwarcie portu lub UNIX-socketu
* Uruchomienie operacji asynchronicznej
* Uruchomienie czujki (np. oczekiwania na pojawienie się nowych plików)
* Ustawienie timera przez metody `setTimeout` lub `setInterval`

W zależności od poniższych przypadków, możemy chcieć przedłużać działanie programu powyższymi działaniami.

### Aplikacja konsolowa

Celem aplikacji konsolowej jest wykonanie określonej i co do zasady skończonej operacji, a następnie "oddanie" jej
wyniku do konsoli. Każda kończąca się aplikacja wywołana z konsoli zwraca kod statusu (ew. error level):

* **0** - jeśli operacja zakończyła się sukcesem
* **1-255** - jeśli wystąpił błąd

W przypadku, kiedy nasza aplikacja wywoła błąd i zostanie ona zakończona, node automatycznie ustawi kod statusu na
większy od zera. Analogicznie jeśli naciśniemy CTRL+C lub zabijemy aplikację poprzez polecenie `kill` (lub `taskkill`
pod Windows).

Aplikacja może też korzystać ze strumieni we/wy, dostarczonych przez system operacyjny, te strumienie to:

* stdin - standardowe wejście do aplikacji, będące albo tym co wyślemy do naszej konsoli (zwykle klawiaturą), lub, jeśli
  wykorzystany był pipe (`|`), będzie to standardowe wyjście poprzedniego procesu.
* stdout - standardowe wyjście z aplikacji, czyli w założeniu wynik jej działania.
* stderr - standardowy strumień błędu - zazwyczaj wyświetlający dane w konsoli, co umożliwia logowanie błędów, ale
  również informacji o pracy aplikacji (czyli logów).

Aplikacja konsolowa może np.: połączyć się z serwerem i pobrać z niego dane, tak jak w
[przykładzie aplikacji konsolowej node.js](../samples/env/script.js).

Wykonanie zadania warto wyabstrahować od samej obsługi konsoli, dzięki czemu będziemy mogli korzystać z operacji w
innych, niż typowo skryptowe, okolicznościach, np. jak w niżej opisanych przypadkach. W szczególności warto przekazać do
naszej operacji takie metody jak logowanie i raportowanie błędów. Operacja powinna też zwracać dane w uniwersalny
sposób, np. poprzez Promise - nie powinna sama logować swoich danych do konsoli.

Prosta aplikacja konsolowa może wyglądać tak:

```javascript
const operation = require("./lib/operation");
const args = process.argv.slice(2);

operation(...args, {
    log: console.log,
    error: console.error,
}).then(
    () => console.error("Operacja wykonana pomyślnie")
).catch(
    (e) => {
        console.error("Wystąpił błąd");
        process.exit(1);
    }
);
```

### Aplikacja wykonująca zadania cykliczne

Cel aplikacji wykonującej zadania cykliczne jest raczej oczywisty. Aplikacja taka działa przez długi okres czasu i
uruchamia zadanie lub kilka zadań w określonych sytuacjach.

W tym wypadku najłatwiej jest utrzymać działanie aplikacji poprzez uruchomienie kolejnych operacji setTimeout lub
jeszcze prościej setInterval. W obu wypadkach warto rozdzielić operację na dwa osobne elementy:

* Wykonanie operacji - można wyabstrahować do modułu zwracającego funkcję.
* Wyzwolenie operacji - może działać w osobnym pliku.

Dzięki takiemu podejściu możemy później dołożyć kolejne operacje.

Zasadniczo są dwa główne zasady wyzwalania operacji:

#### Wyzwalanie czasowe

W tej sytuacji operacje wykonywane są w określonych interwałach czasowych. W określonych wcale nie oznacza w stałych,
więc powinniśmy poświęcić sporo uwagi stworzeniu dobrego mechanizmu wyzwalania, lub użyć jednego z gotowych mechanizmów
typu modułu [cron](https://www.npmjs.com/package/cron).

W najprostszym ujęciu nasze operacje mogą być wyzwalane timerem ustawionym przez `setInterval`, prosta aplikacja mogłaby
wyglądać tak:

```javascript
const operation = require("./lib/operation");
const interval = process.argv[2];

let running = null;
setInterval(() => {
    if (running)
        return;

    running = operation({
        log: console.log,
        error: console.error,
    }).then(
        () => running = null
    ).catch(
        (e) => running = null
    );
}, +interval)
```

Tego typu aplikacje są dość często stosowane do sprawdzania stanu systemu, wykonywania operacju czyszczenia lub
tworzenia backupów, a także wykonywania zadań synchronizacji danych pomiędzy zdalnymi systemami.

Jeśli nasze aplikacje uruchamiają się bardzo rzadko, warto rozważyć po prostu uruchamianie ich z systemowego `cron`'a.

#### Wyzwalanie zdarzeniowe

W tej sytuacji operacje wykonywane są w wyniku zdarzenia, np. pojawienia się pliku. Zdarzenie może być zidentyfikowane
na wiele sposobów - np. poprzez oczekiwanie na zdarzenie z modułu [watch](https://www.npmjs.com/package/watch) lub w
wyniku działania operacji cyklicznej (np. cyklicznie sprawdzamy, czy obciążenie serwera nie przekracza 10, a jeśli
przekracza, próbujemy automatycznie ubijać procesy użytkowników).

Najprostsza taka aplikacja mogłaby wyglądać tak:

```javascript
const watch = require("watch");
const operation = require("./lib/operation");
const path = process.argv[2];

let running = null;
watch.watchTree("path", (file, curr, prev) => prev || running || running = operation(file, {
    log: console.log,
    error: console.error,
}).then(
    () => running = null
).catch(
    (e) => running = null
));
```

Aplikacje tego typu są wykorzystywane głównie do obsługi plików - w szczególności enkodowania wideo w watch folderów,
automatycznej obsługi obrazków, importu danych z ftp itp. Czasami podobne aplikacje mogą być uruchamiane w efekcie
podłączenia urządzeń, czy zdarzeń sieciowych (np. aplikacja na routerze wywołująca zdarzenie w momencie podłączenia
nowego urządzenia po WiFi).

#### "Kolega pracuje"

Pisząc powyższe aplikacje należy pamiętać o tym, że nasze operacje mogą trwać i może dojść do sytuacji w której w czasie
jej wykonywania zachodzą okoliczności powodujące ponowne wyzwolenie. W efekcie możemy równocześnie rozpocząć prace nad
tym samym plikiem, czego moglibyśmy chcieć uniknąć.

Warto więc brać pod uwagę, ile równoległych działań dopuszczamy i odpowiednio obsłużyć zachowanie takiego limitu. W
przypadku, kiedy chcemy działać tylko z jedną równoczesną operacją możemy zastosować prostą flagę:

```javascript
let running = null;
something.on("run", () => running || running = operation().then(
    () => running = null
).catch(
    (e) => running = null
));
```

Jeśli chcemy uruchamiać określoną ilość równoległych operacji, dla ułatwienia warto skorzystać z modułu obsługującego
pulę, np. [generic-pool](https://www.npmjs.com/package/generic-pool).

### Aplikacje serwerowe

Aplikacja serwerowa ma w założeniu serwować klientom swoje usługi. Jest to specyficzny przypadek sytuacji powyższej,
jednakże zasadniczą różnicą jest to, że większość serwerów jest zdolna obsługiwać kilku klientów naraz, czego zasadniczo
unika się w aplikacjach cyklicznych.

Uruchomienie naszego serwera automatycznie zapewni podtrzymanie działania aplikacji.

Wyabstrahowane wyżej funkcje nadal mogą być tutaj przydatne, jak w poniższym przypadku:

```javascript
net.createServer((connection) => {
    whenRead(connection, 10)
        .then((data) => operation(data, {
            log: console.log,
            error: console.error,
        }))
        .then(
            (outcome) => connection.end(JSON.stringify(outcome))
        )
        .catch(
            () => connection.destroy();
        )
}).listen(3030);
```

## Uruchomienie w pierwszym planie vs. w tle

### Pierwszy plan

Aplikacja konsolowa jest co do zasady uruchamiana w pierwszym planie. Oznacza to, że wchodzi ona w założeniu w jakąś
interakcję z użytkownikiem obcującym fizycznie lub zdalnie z danym serwerem (czyt. ma otwartą konsolę na tym serwerze).

Aplikacja działająca w pierwszym planie wymaga konsoli i w momencie rozłączenia się użytkownika, system nie pozwoli
aplikacji działać dalej.

Aplikacje działające w pierwszym planie możemy uruchomić na kilka sposobów:

**Uruchomienie z node.js:**

    $ node aplikacja.js param1 param2

**Uruchomienie za pomocą shebang (tylko w *sh)**:

W pliku uruchamialnym w pierwszej linii dodajemy komentarz z określający początek linii koniecznej do uruchomienia
pliku, np.:

    #!/usr/bin/env node

Następnie po prostu uruchamiamy program (zakładając, że posiada uprawnienie `x`):

    $ ./aplikacja.js param1 param2

### Uruchamianie w tle

Wszystkie poniżej opisane aplikacje zawsze zaczynają życie jako aplikacja konsolowa, jendak w przeciwieństwie do
powyższej mają na celu wykonywanie zadań przez bardzo długi czas (nawet latami). Dlatego aplikacja taka nie kończy się
wyjściem ze statusem, a zostaje zazwyczaj uruchomiona w tle.

Aby aplikacja prawidłowo działała w tle, musi być:

* odpięta od nadrzędnego procesu - pod Unix oznacza to, że jest liderem sesji, pod Windows, że jest "detached".
* odpięta od uruchamiającej konsoli - po zamknięciu konsoli próba wyświetlenia console.log spowoduje błąd

Można to osiągnąc "na piechotę", jednak nasza konsolowa aplikacja może być uruchomiona w specjalnym wrapperze, którzy
zapewni jej działanie w sposób taki, jak działałaby w konsoli bez konieczności wbudowywania obsługi daemona w systemie.

Możemy sami stworzyć daemona w naszej aplikacji np. za pomocą modułu [daemonize2](https://www.npmjs.com/package/daemonize2).

Najpopularniejszym modułem jest [PM2](https://www.npmjs.com/package/pm2).
