# Air Traffic Merge Card

Dashboard card for the **Air Traffic Merge** Home Assistant integration.

## Installation via HACS

1. Add this repository as a custom repository in HACS.
2. Type: **Dashboard**
3. Install **Air Traffic Merge Card**.
4. Refresh the browser.

## Manual installation

Copy:

- `dist/air-traffic-merge-card.js`

To:

- `/config/www/air-traffic-merge-card.js`

Add this resource:

```yaml
url: /local/air-traffic-merge-card.js
type: module
```

## Example

```yaml
type: custom:air-traffic-merge-card
entity: sensor.air_traffic_merge_flights
title: Flugzeuge
show_status: true
show_debug: false
```
