# Air Traffic Merge Card

Lovelace / Dashboard Card für Home Assistant zur Darstellung der zusammengeführten
ADS-B- und Flightradar24-Daten aus der **Air Traffic Merge Integration**.

## Installation (HACS)

1. HACS → Dashboard
2. „Benutzerdefiniertes Repository“ hinzufügen
3. Repository-URL:
   https://github.com/balronu/air-traffic-merge-card
4. Typ: **Dashboard**
5. Card installieren

## Resource (falls nicht automatisch hinzugefügt)

```
/hacsfiles/air-traffic-merge-card/air-traffic-merge-card.js
```
Typ: **JavaScript-Modul**

## Verwendung

```yaml
type: custom:air-traffic-merge-card
```

## Abhängigkeit

Diese Card benötigt die **Air Traffic Merge Integration**:
https://github.com/balronu/air-traffic-merge
