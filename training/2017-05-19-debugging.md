Logowanie i debugowanie
=========================

Ten dokument opisuje sposoby logowania pracy aplikacji oraz sposoby jej debugowania i profilowania.

Logowanie
-----------

Logowanie ma na celu umożliwienie analizy pracy aplikacji w czasie rzeczywistym, jak również analizy jej wcześniejszej
pracy w przypadku wystąpienia problemów.

Logowanie powinniśmy podzielić na:

* Typy
* Poziomy
* Źródła

### Typy logów

Typ logu związany jest z rodzajem zawartej w nim informacji. Dla typowej aplikacji serwera www warto rozdzielić logi na
następujące typy:

* Access log - raportuje dane o odebranych requestach
* Auth log - raportuje dane o autoryzacjach użytkowników
* Error/Application log - raportuje dane o wykonaniu aplikacji
* stdout log - zawiera wszystko co zostanie wyświetlone poprzez console.log lub wysłane process.stdout
* strerr log - j.w. tylko dla console.error and process.stderr

### Poziomy logów

Poziomy dają możliwość określenia poziomu szczegółowości określonego logu, a z drugiej strony określenie poziomów logu,
które mają trafiać do pliku, podczas gdy inne mają być ignorowane. Ponieważ zapis logów w mocno obciążonym serwerze http
może zajmować sporo mocy obliczeniowej powyższa możliwość jest wielce istotna.

Przykładem modułu umożliwiającego stosowanie poziomów logowania jest [tracer](https://www.npmjs.com/package/tracer). W
tym module poziomy logowania to:

* log = 0
* trace = 1
* debug = 2
* info = 3
* warn = 4
* error = 5

### Źródła

Podział logów wg. źródeł umożliwia rozdzielenie logowania na poszczególne moduły, lub klasy. Na przykład:

Nasza aplikacja składa się z kilku modułów:
* modułu dostępu do bazy danych (myapp-db)
* modułu serwera http (myapp-http)
* modułu sesji użytkowników (myapp-session)

Możemy chcieć logować i czytać z logów osobno, do tego możemy skorzystać z modułu
[debug](https://www.npmjs.com/package/debug), wtedy w naszych plikach importujemy moduł w następujący sposób,
przykładowo dla modułu http:

    const debug = require("debug")("myapp_http");

    // ... gdzieś w kodzie
    debug("client connected %s", req.remoteAddress);

Jeśli chcemy zobaczyć logi z tego konkretnego modułu, wówczas uruchamiamy aplikację w następujący sposób:

    DEBUG="myapp_http" node myapp

Możemy korzystać z wielu równoległych modułów.

### Abstrakcja

Zazwyczaj nie ma idealnego loggera do naszych potrzeb, a nawet jeśli istnieje, nie mamy wpływu na jego działanie w
przyszłości. Byłoby dość nieprzyjemne, gdybyśmy nie mogli przejść na nowszą, szybszą wersję node.js, tylko dlatego, że
nie działa w niej nasz logger, a jego zmiana zajmie zbyt dużo pracy.

Dlatego warto przygotować sobie klasę abstrakcji do loggera, która ułatwi nam prace później i obejmie wszystkie
potrzebne nam funkcje.

Debugowanie
-------------

W Node, podobnie jak w innych środowiskach można uruchamiać debugger, co jest opisane w [dokumentacji node.js odnośnie debuggowania](https://nodejs.org/api/debugger.html).

W node i ogólnie w javascript dopuszczalne jest polecenie debugger, które powoduje zatrzymanie wykonywania w określonym
miejscu w kodzie. System zatrzyma się na tym poleceniu i pozwoli nam wejść w dowolną interakcję z kodem i stanem
wykonywania w linii w której się znajduje.

### Via chrome-web-tools

Programy node.js można debugować w dokładnie ten sam sposób jak stronę www w chrome. Aby to zrobić należy nasz program
uruchomić z flagą --inspect.

    $ node --inspect samples/file-upload/server.js
    Debugger listening on port 9229.
    Warning: This is an experimental feature and could change at any time.
    To start debugging, open the following URL in Chrome:
        chrome-devtools://devtools/remote/serve_file/...

Jest to jeszcze nieco niestabilne i nie wszystkie mechanizmy działają poprawnie.

### Wbudowany debugger

Możemy też uruchamiać programy z wbudowanym debuggerem:

    $ node debug samples/file-upload/server.js
    < Debugger listening on [::]:5858
    connecting to 127.0.0.1:5858 ... ok
    break in samples/file-upload/server.js:7
    5
    6 // importujemy wymagane przez program moduły
    > 7 const path = require('path');           // moduł do operacji na ścieżkach
    8 const fs = require('fs');               // moduł do obsługi systemu plików
    9 // w tym te instalowane z NPM

Powoduje to uruchomienie interfejsu obsługiwanego z linii poleceń w którym możemy wykonać następujące polecenia
(wpisując polecenie + enter):

* `run` (r) - uruchamia proces (np. po zatrzymaniu)
* `cont` (c) - kontynuuje do następnego breakpointu.
* `next` (n) - przechodzi do następnej linii
* `step` (s) - wchodzi do następnego polecenia (jeśli to funkcja, wchodzi do środka)
* `out` (o) - wychodzi z obecnej funkcji do funkcji, która ją wywołała
* `backtrace` (bt) - wyświetla stack wywołania
* `setBreakpoint` (sb) - ustawia punkt wstrzymania w pliku i linii (np. `sb("server.js", 40)`)
* `clearBreakpoint` (cb) - czyści breakpoint
* `watch` - sprawdza kod w każdym zatrzymaniu i wyświetla na ekranie (np. żeby zobaczyć wartość zmiennej)
* `unwatch` - wyłącza powyższe
* `watchers` - listuje powyższe
* `repl` - wchodzi w tryb read-eval-print loop, czyli interaktywnego pisania w node.
* `exec` - uruchamia przekazny kod
* `restart` - restartuje aplikacje (ponownie wczytując wszystkie pliki)
* `kill` - zabija aplikację
* `list` - wyświetla aktualne miejsce w kodzie
* `scripts` - wyświetla listę plików
* `breakOnException` - włącza zatrzymanie w przypadku błędów
* `breakpoints` - listuje wszystkie breakpointy
* `help` - wyświetla powyższą instrukcję

Profiling
----------

Profiling ma na celu określić które części kodu są najbardziej obciążające dla serwera. Jeśli nasza aplikacja używa zbyt
dużo mocy procesora warto się tymi możliwościami zaintertesować.

### profiling przez web tools

Łącząc się jak opisałem wcześniej z web-inspectorem możemy uruchomić profiler w zakładce **profiling**.

### profiling v8

Możemy też uruchomić wbudowany profiler, który wygeneruje nam plik każdego kroku w kodzie. Aby to zrobić należy
uruchomić naszą aplikację z parametrem `--prof`, np.:

    $ node --prof samples/es6/generators.js

Nasz program wykona się tak samo jak poprzednio, ale tym razem dostaniemy dodatkowy plik zawierający każdy krok
wykonywania naszego kodu i zajmowany przez niego czas:

    $ ls -la
    -rwxrwxrwx 1 root root 126309 maj 21 23:23 isolate-0x2d4e650-v8.log

Node umożliwia przwtworzenie tego kodu na czytelny plik tesktowy:

    node --prof-process isolate-0x2d4e650-v8.log > processed.txt

A nasz plik zawiera informacje o najdłużej wykonywanych operacjach.

[Przykład pliku debuggera v8 jest tutaj](../samples/debug)

### console.time

Ostatnim sposobem profilowania jest liczenie czasu "na piechotę". Możemy to wykonać za pomocą:

* `console.time(label)` - na początku
* `console.timeEnd(label)` - na końcu

Przy drugim wywołaniu na konsoli wyświetli się czas między pierwszym, a drugim wywołaniem. W przeciwieństwie do
poprzednich sytuacji, tutaj możemy sprawdzić, jak długo wykonuje się operacja asynchroniczna oraz ile czasu mija
pomiędzy różnymi metodami.

Mierzymy tu zatem faktyczny czas pomiędzy dwoma punktami w kodzie, a nie "wysiłek" jak w poprzednich przypadkach.
