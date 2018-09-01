L.Control.StravaSegments = L.Control.extend({
    options: {
        stravaToken: null // strava API token, must be SET
    },

    onError: function (msg) {
        console.warn('Error getting Strava segments:', msg);
    },

    onAdd: function (map) {
        var self = this;

        this.runningButton = new L.easyButton({
                states: [
                    {
                        stateName: 'default',
                        icon: 'fa-trophy',
                        onClick: function () {
                            self.showSegments(map, this, 'running');
                        },
                        title: 'Show Strava running segments'
                    },
                    {
                        stateName: 'loading',
                        icon: 'fa-spinner fa-pulse',
                        title: 'Loading…'
                    }
                ]
            }
        );
        this.bikingButton = new L.easyButton({
                states: [
                    {
                        stateName: 'default',
                        icon: 'fa-bicycle',
                        onClick: function () {
                            self.showSegments(map, this, 'biking');
                        },
                        title: 'Show Strava biking segments'
                    },
                    {
                        stateName: 'loading',
                        icon: 'fa-spinner fa-pulse',
                        title: 'Loading…'
                    }
                ]
            }
        );

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

    showSegments: function (map, button, activityType) {
        var self = this;
        button.state('loading');
        var b = map.getBounds();
        var url = `https://www.strava.com/api/v3/segments/explore?bounds=${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}&activity_type=${activityType}`;

        this.get(url, L.bind(function (error, explorerResponse) {
            button.state('default');
            if (error) {
                self.onError(error);
                return;
            }
            for (var segment of JSON.parse(explorerResponse).segments) {
                var points = polyline.decode(segment.points);
                var segmentLine = new L.polyline(points, {
                    weight: 3,
                    color: activityType === 'running' ? 'red' : 'blue'
                });
                segmentLine.on('mouseover', function(e) {
                    e.target.setStyle({
                        weight: 5
                    });
                });
                segmentLine.on('mouseout', function(e) {
                    e.target.setStyle({
                        weight: 3
                    });
                });
                var tooltip = `<h4>${segment.name}</h4>`;
                tooltip += `Distance: ${segment.distance}m, hill`;
                if (segment.climb_category_desc != "NC") tooltip += ` (cat. ${segment.climb_category_desc})`;
                tooltip += `: ${segment.elev_difference}m (avg ${segment.avg_grade}%)`;
                segmentLine.addTo(map).bindTooltip(tooltip);
            }
        }));
    },

    get: function (url, cb) {
        var self = this;
        if (!this.options.stravaToken) {
            cb('Strava API token no set.');
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Authorization', `Bearer ${this.options.stravaToken}`);
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

    getError: function (xhr) {
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
}