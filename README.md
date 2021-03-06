# Leafet.StravaSegments

Display Strava segments on a map!

[Here is a demo](https://bagage.gitlab.io/leaflet.stravasegments). And the [associated source code](https://gitlab.com/bagage/leaflet.stravasegments/blob/master/public/index.html).

![demo image](https://gitlab.com/bagage/leaflet.stravasegments/raw/master/.example.png)

## Dependencies

Requires `Leaflet 1.+`, `FontAwesome 4.+`, `@mapbox/polyline` and `Leaflet.EasyButtons`. 

See [package.json](https://gitlab.com/bagage/leaflet.stravasegments/blob/master/package.json) for details.

## Use it

Install it:

```sh
yarn add leaflet.stravasegments
# or 
npm install --save leaflet.stravasegments
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