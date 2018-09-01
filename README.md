# Leafet.StravaSegments

Display Strava segments on a map!

[Here is a demo](https://demo).

![demo image](https://gitlab.com/bagage/Leaflet.StravaSegments/raw/master/.example.png)

## Dependencies

Requires Leaflet 1.+, FontAwesome 4.+, @mapbox/polyline and Leaflet.EasyButtons. See package.json for details.

## Use it

Install it:

```sh
yarn add Leaflet.StravaSegments
# or 
npm install --save Leaflet.StravaSegments
```

Then add it to the map:

```js
L.control.stravaSegments({
    stravaToken: '<strava API token>'
}).addTo(map);
```

`<strava API token>` must be retrieved from [Strava website](https://www.strava.com/settings/api). Default public token is limited to 600 reqs/15min and 30k reqs/day.

## License

MIT