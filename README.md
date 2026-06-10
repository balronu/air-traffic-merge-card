# Air Traffic Merge Card

Lovelace card for the Air Traffic Merge Home Assistant integration.

The card displays aircraft from `sensor.air_traffic_merged` and supports both the current local ADS-B attribute format and the newer categorized merge format.

## Features

- Flight rows with callsign, registration, source, distance, altitude, speed, and heading
- Optional status block
- Optional category chips when the integration provides category counts
- Tracked-aircraft badge support
- Works with ADS-B-only, FR24-only, and FR24 + ADS-B setups

## Install with HACS

1. Open HACS.
2. Add this repository as a custom dashboard repository:

   ```text
   https://github.com/balronu/air-traffic-merge-card
   ```

3. Install `Air Traffic Merge Card`.
4. Add the dashboard resource if HACS does not add it automatically:

   ```yaml
   url: /hacsfiles/air-traffic-merge-card/dist/air-traffic-merge-card.js
   type: module
   ```

## Manual Install

Copy this file:

```text
dist/air-traffic-merge-card.js
```

to:

```text
/config/www/air-traffic-merge-card.js
```

Then add this Lovelace resource:

```yaml
url: /local/air-traffic-merge-card.js
type: module
```

## Example Card

```yaml
type: custom:air-traffic-merge-card
entity: sensor.air_traffic_merged
title: Flugzeuge
show_status: true
show_counts: true
show_debug: false
max_items: 25
```

## Pairing

Use this together with:

```text
https://github.com/balronu/air-traffic-merge
```
