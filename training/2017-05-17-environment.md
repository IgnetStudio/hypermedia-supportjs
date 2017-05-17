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
innych, niż konsola okolicznościach, np. jak w poniższym przypadku.

### Aplikacja wykonująca zadania cykliczne

Cel aplikacji wykonującej zadania cykliczne jest raczej oczywisty. Aplikacja taka działa przez długi okres czasu i
uruchamia zadanie lub kilka zadań w określonych sytuacjach.

W tym wypadku najłatwiej jest utrzymać działanie aplikacji poprzez uruchomienie kolejnych operacji setTimeout lub
jeszcze prościej setInterval. W obu wypadkach warto rozdzielić operację na dwa osobne elementy:

* Wykonanie operacji - można wyabstrahować do modułu zwracającego funkcję.
* Wyzwolenie operacji - może działać w osobnym pliku.

Dzięki takiemu podejściu możemy później dołożyć kolejne operacje.

Zasadniczo są dwa główne powody do wyzwolenia operacji:


#### Wyzwalanie czasowe

* Czasowe - operacje wykonywane są co określony czas.

#### Wyzwalanie zdarzeniowe

* Zdarzeniowe - operacje wykonywane są w wyniku zdarzenia, np. pojawienia się pliku.

#### "Kolega pracuje"

### Aplikacje serwerowe

Aplikacja serwerowa ma w założeniu serwować klientom swoje usługi. Jest to specyficzny przypadek sytuacji powyższej,
jednakże zasadniczą różnicą jest to, że większość serwerów jest zdolna obsługiwać kilku klientów naraz, czego zasadniczo
unika się w aplikacjach cyklicznych.

Wyabstrahowane wyżej funkcje nadal mogą być tutaj przydatne.

## Uruchomienie w pierwszym planie vs. w tle

### Pierwszy plan

Aplikacja konsolowa jest co do zasady uruchamiana w pierwszym planie. Oznacza to, że wchodzi ona w założeniu w jakąś
interakcję z użytkownikiem obcującym fizycznie lub zdalnie z danym serwerem (czyt. ma otwartą konsolę na tym serwerze).

Aplikacja działająca w pierwszym planie wymaga konsoli i w momencie rozłączenia się użytkownika, system nie pozwoli
aplikacji działać dalej.

### Uruchamianie w tle

Wszystkie poniżej opisane aplikacje zawsze zaczynają życie jako aplikacja konsolowa, jendak w przeciwieństwie do
powyższej mają na celu wykonywanie zadań przez bardzo długi czas (nawet latami). Dlatego aplikacja taka nie kończy się
wyjściem ze statusem, a zostaje zazwyczaj uruchomiona w tle.

## Środowisko
