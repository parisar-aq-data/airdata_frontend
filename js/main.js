// ######################################
/* GLOBAL VARIABLES */
var wardsLayer = new L.geoJson(null);
var centresLayer = new L.geoJson(null);
var iudxLayer = new L.geoJson(null);
var safarLayer = new L.geoJson(null);

// #################################
/* MAP */

var cartoPositron = L.tileLayer.provider('CartoDB.Positron');
var OSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
var gStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});
var gHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});
var esriWorld = L.tileLayer.provider('Esri.WorldImagery');

var baseLayers = { "OpenStreetMap.org" : OSM, "Carto Positron": cartoPositron, "ESRI Satellite": esriWorld, 
    "Streets": gStreets, "Hybrid": gHybrid };

var map = new L.Map('map', {
    center: STARTLOCATION,
    zoom: STARTZOOM,
    layers: [gStreets],
    scrollWheelZoom: true,
    maxZoom: 20,
});
$('.leaflet-container').css('cursor','crosshair'); // from https://stackoverflow.com/a/28724847/4355695 Changing mouse cursor to crosshairs
L.control.scale({metric:true, imperial:false}).addTo(map);

// SVG renderer
var myRenderer = L.canvas({ padding: 0.5 });

var overlays = {
    "wards": wardsLayer,
    "Ward centre points": centresLayer,
    "IUDX AQM": iudxLayer,
    "Safar": safarLayer
};
var layerControl = L.control.layers(baseLayers, overlays, {collapsed: true, autoZIndex:false, position:'topright'}).addTo(map); 

// https://github.com/Leaflet/Leaflet.fullscreen
map.addControl(new L.Control.Fullscreen({position:'topright'}));

L.control.custom({
    position: 'bottomright',
    content: `<div class="legend" id="legendContent"></div>`,
    classes: 'divOnMap_right'
}).addTo(map);

L.control.custom({
    position: 'bottomleft',
    content: `<div id="leftInfo"></div>`,
    classes: 'divOnMap_left'
}).addTo(map);

wardsLayer.addTo(map);
centresLayer.addTo(map);
iudxLayer.addTo(map);
safarLayer.addTo(map);


// ############################################
// RUN ON PAGE LOAD
$(document).ready(function () {
    populateLegend();
    populateInfo();
    flatpickr("#date1", { 
        defaultDate:getTodayDate(-1), 
        maxDate:'today',
        minDate: '2021-04-23',
        onChange: function(selectedDates, dateStr, instance) {
            loadMap(dateStr);
        }
    }); // minDate: d, maxDate: EP_DATE

    var date1 = getTodayDate(-1);
    loadMap(date1);

    // loadIUDX();
    // loadSafar();
});

// ############################################
// FUNCTIONS

// get color depending on population density value
function getColor(d) {
    if(! d) return '#9c9c9c';
    return d > 250  ? '#810100' :
        d > 120  ? '#c41206' :
        d > 90  ? '#f58f09' :
        d > 60  ? '#f4f805' :
        d > 30  ? '#9acd32' :
        '#377a07';
}

function populateLegend() {
    var legendContent = '';
    var grades = ['NA', 0, 30, 60, 90, 120, 250],
        gradeNames = ['Not Available', 'Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'],
        labels = [],
        from, to;
    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];
        if(grades[i] == 'NA') {
            labels.push('<i style="background:' + getColor(null) + '"></i> ' +
                from + " : &nbsp;&nbsp;" + gradeNames[i]);
        }
        else {
            labels.push('<i style="background:' + getColor(from + 1) + '"></i> ' +
                from + (to ? '&ndash;' + to : '+') + "&nbsp;&nbsp;" + gradeNames[i]);
        }
    }
    labels.push(`Brackets from <a href="http://safar.tropmet.res.in/AQI-47-12-Details" target="_blank">SAFAR-India</a>`)
    $('#legendContent').html(labels.join('<br>'));
}

function populateInfo(props) {
    var content = '';
    if(props) {
        if (props.type == 'ward') {
            content = `<h4>PM 2.5 Air Quality Levels</h4>
            <p>Ward ${props.prabhag}: ${props.name}<br>
            pm2.5: <big><b>${props.pm25 || 'Not Available'}</b></big><br>
            time: ${props.time1 || 'Not Available'}</p>`;
        }
        else if (props.type == 'iudx') {
            content = `<h4>PM 2.5 Air Quality Levels</h4>
            <p> ${props.location_id} : ${props.name} (IUDX)</br>
            pm2.5: <big><b>${props.pm25 || 'Not Available'}</b></big><br>
            time: ${props.time1 || 'Not Available'}</p>`;
        }
        else if (props.type == 'safar') {
            content = `<h4>PM 2.5 Air Quality Levels</h4>
            <p> ${props.location_id} : ${props.name} (Safar)</br>
            pm2.5: <big><b>${props.pm25 || 'Not Available'}</b></big><br>
            time: ${props.time1 || 'Not Available'}</p>`;
        }
    } 
    
    else {
        content = `<h4>PM 2.5 Air Quality Levels</h4>
        <p><span id="loader">Hover over a ward or point</span></p>`;
    }
    $('#leftInfo').html(content);
}


function loadMap(date1) {
    $('#loader').html(`Loading map uptill ${date1}`);
    var payload = {
        "date1": date1,
        "categories": ["iudx","safar","ward"]
    }

    $.ajax({
        url : `${APIpath}/getLatestData`,
        type : 'POST',
        data : JSON.stringify(payload),
        cache: false,
        // contentType: false,  // tell jQuery not to set contentType
        dataType : 'html',
        success : function(returndata) {
            var returnJ = JSON.parse(returndata);
            processData(returnJ);
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            alert(jqXHR.responseText);
            // var data = JSON.parse(jqXHR.responseText);
            // $('#createUserStatus').html(data['message']);
        }
    });

}

function processData(returnJ) {
    console.log(returnJ);
    wardsLayer.clearLayers();
    centresLayer.clearLayers();
    iudxLayer.clearLayers();
    safarLayer.clearLayers();

    mapPolygons(returnJ['shapes']);

    // render points
    returnJ['data'].forEach(r => {
        if(r.type=='ward') {
            var marker = L.marker([ parseFloat(r.lat),parseFloat(r.lon) ], { 
                icon: L.divIcon({
                    className: r.pm25?`ward_divicon`:`na_divicon`,
                    iconSize: [17, 17],
                    html: r.pm25? parseFloat(r.pm25).toFixed(0) : 'NA'
                }),
                interactive: false
            });
            marker.addTo(centresLayer);
        }
        else if(r.type=='iudx') {
            var marker = L.marker([ parseFloat(r.lat),parseFloat(r.lon) ], { 
                icon: L.divIcon({
                    className: r.pm25 ? `iudx_divicon` : `na_divicon`,
                    iconSize: [20, 20],
                    html: r.pm25? parseFloat(r.pm25).toFixed(0) : 'NA'
                }) 
            });
            marker.addTo(iudxLayer);
            marker.on('mouseover', function(a) {
                populateInfo(r);
            });
            marker.on('mouseout', function(a) {
                populateInfo();
            });
        }
        else if(r.type=='safar') {
            var marker = L.marker([ parseFloat(r.lat),parseFloat(r.lon) ], { 
                icon: L.divIcon({
                    className: r.pm25 ? `safar_divicon` : `na_divicon`,
                    iconSize: [20, 20],
                    html: r.pm25? parseFloat(r.pm25).toFixed(0) : 'NA'
                }) 
            });
            marker.addTo(safarLayer);
            marker.on('mouseover', function(a) {
                populateInfo(r);
            });
            marker.on('mouseout', function(a) {
                populateInfo();
            });
        }
    });

}

function mapPolygons(wardsData) {
    // moved info part to global leaflet section
    
    function ward_style(feature) {
        let color = getColor(feature.properties.pm25);
        return {
            weight: 2,
            opacity: 1,
            color: 'black',
            // dashArray: '3',
            fillOpacity: 0.6,
            fillColor: color
        };
    }

    function ward_onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    function highlightFeature(e) {
        var layer = e.target;
        layer.setStyle({
            weight: 3,
            color: '#666',
            // dashArray: '',
            fillOpacity: 0.2
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        populateInfo(layer.feature.properties);
    }

    function resetHighlight(e) {
        // wardsLayer.resetStyle(e.target);
        // e.resetStyle();
        var layer = e.target;
        layer.setStyle({
            weight: 2,
            color: 'black',
            // dashArray: '',
            fillOpacity: 0.6
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        populateInfo();
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    var shapes = new L.geoJson(wardsData, {
        style: ward_style,
        onEachFeature: ward_onEachFeature
    }).addTo(wardsLayer);

    $('#loader').html(`Hover over a ward or point`);
}





