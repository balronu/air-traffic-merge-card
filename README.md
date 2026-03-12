# Air Traffic Merge Card

Lovelace Karte für die Integration **Air Traffic Merge**.

## Installation

### HACS
1. Repository als **Custom Repository** hinzufügen
2. Typ: **Dashboard**
3. Karte installieren
4. Dashboard-Ressourcen neu laden

## Beispiel

```yaml
type: custom:air-traffic-merge-card
entity: sensor.air_traffic_merge
title: Flugzeuge
show_status: true
show_debug: false
max_items: 25
```
