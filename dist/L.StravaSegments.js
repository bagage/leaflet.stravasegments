'use strict';

L.Control.StravaSegments = L.Control.extend({
    options: {
        stravaToken: null // strava API token, must be SET
    },

    onError: function onError(msg) {
        console.warn('Error getting Strava segments:', msg);
    },

    onAdd: function onAdd(map) {
        var self = this;

        this.stravaLayer = new L.layerGroup([], { attribution: '<a href="https://strava.com">Strava</a>' });

        this.runningButton = new L.easyButton({
            states: [{
                stateName: 'default',
                icon: 'fa-trophy',
                onClick: function onClick() {
                    self.showSegments(map, this, 'running');
                },
                title: 'Show Strava running segments'
            }, {
                stateName: 'loading',
                icon: 'fa-spinner fa-pulse',
                title: 'Loading…'
            }]
        });
        this.bikingButton = new L.easyButton({
            states: [{
                stateName: 'default',
                icon: 'fa-bicycle',
                onClick: function onClick() {
                    self.showSegments(map, this, 'biking');
                },
                title: 'Show Strava biking segments'
            }, {
                stateName: 'loading',
                icon: 'fa-spinner fa-pulse',
                title: 'Loading…'
            }]
        });

        new L.easyBar([this.bikingButton, this.runningButton]).addTo(map);

        // do not allow button if map is too big
        map.on('zoom', function (e) {
            var tooBig = e.target.getZoom() < 13;
            if (tooBig) {
                self.bikingButton.disable();
                self.runningButton.disable();
            } else {
                self.bikingButton.enable();
                self.runningButton.enable();
            }
        });
        return new L.DomUtil.create('div');
    },

    computeAngle: function computeAngle(a, b) {
        return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    },

    showSegments: function showSegments(map, button, activityType) {
        var self = this;
        button.state('loading');
        var b = map.getBounds();
        var url = 'https://www.strava.com/api/v3/segments/explore?bounds=' + b.getSouth() + ',' + b.getWest() + ',' + b.getNorth() + ',' + b.getEast() + '&activity_type=' + activityType;

        this.stravaLayer.addTo(map);

        this.get(url, L.bind(function (error, explorerResponse) {
            button.state('default');
            if (error) {
                self.onError(error);
                return;
            }
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = JSON.parse(explorerResponse).segments[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var segment = _step.value;

                    if (self.stravaLayer.getLayers().map(function (it) {
                        return it.options.id;
                    }).indexOf(segment.id) !== -1) {
                        // this segment is already present, skipping
                        continue;
                    }
                    var points = polyline.decode(segment.points);
                    var color = activityType === 'running' ? 'red' : 'blue';

                    var start = new L.triangleMarker(points[0], { width: 12, height: 10, rotation: self.computeAngle(L.point(points[0]), L.point(points[1])), color: color });
                    var end = new L.circle(points[points.length - 1], { radius: 30, color: color });

                    var segmentLine = new L.polyline(points, {
                        id: segment.id,
                        weight: 3,
                        color: color
                    });
                    segmentLine.on('mouseover', function (e) {
                        e.target.setStyle({
                            weight: 5
                        });
                    });
                    segmentLine.on('mouseout', function (e) {
                        e.target.setStyle({
                            weight: 3
                        });
                    });
                    var tooltip = '<h4>' + segment.name + '</h4>';
                    tooltip += 'Distance: ' + segment.distance + 'm, hill';
                    if (segment.climb_category_desc != "NC") tooltip += ' (cat. ' + segment.climb_category_desc + ')';
                    tooltip += ': ' + segment.elev_difference + 'm (avg ' + segment.avg_grade + '%)';
                    self.stravaLayer.addLayer(start);
                    self.stravaLayer.addLayer(end);
                    self.stravaLayer.addLayer(segmentLine.bindTooltip(tooltip));
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }));
    },

    get: function get(url, cb) {
        var self = this;
        if (!this.options.stravaToken) {
            cb('Strava API token no set.');
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + this.options.stravaToken);
        xhr.onload = function () {
            if ((xhr.status === 200 || xhr.status === 0) && xhr.responseText) {
                cb(null, xhr.responseText);
            } else {
                cb(L.StravaSegments.getError(xhr));
            }
        };
        xhr.onerror = function () {
            cb(L.StravaSegments.getError(xhr));
        };
        try {
            xhr.send();
        } catch (e) {
            cb(e);
        }
    },

    getError: function getError(xhr) {
        var msg = 'no response from server';
        if (xhr.responseText) {
            msg = xhr.responseText;
        } else if (xhr.status || xhr.statusText) {
            msg = xhr.status + ': ' + xhr.statusText;
        }
        return msg;
    }
});

L.control.stravaSegments = function (options) {
    return new L.Control.StravaSegments(options);
};