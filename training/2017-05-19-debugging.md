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

Podział logów wg. źródeł umożliwia rozdzielenie logowania na poszczególne moduły, lub klasy.

### Abstrakcja

Debugowanie
-------------

### Via chrome-web-tools

### Wbudowany debugger

Profiling
----------

### console.time

### profiling v8
