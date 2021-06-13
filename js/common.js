// common.js

// CONSTANTS
const APIpath = 'https://server2.nikhilvj.co.in/airdata_api/API';
const STARTLOCATION = [18.502, 73.853]; //Pune
const STARTZOOM = 12;
const STARTLOCATIONjson = {lat: STARTLOCATION[0], lng: STARTLOCATION[1]};

// Colors to use in allMap.html page. from http://phrogz.net/css/distinct-colors.html
const phrogzColors = ["#ff0000", "#bfa98f", "#8fbf96", "#00294d", "#eabfff", "#e50000", "#736556", "#00f241", "#1d4b73", "#9d7ca6", "#a60000", "#b27700", "#004011", "#b6d6f2", "#d600e6", "#f23d3d", "#664400", "#3df285", "#738799", "#912699", "#bf6060", "#f2b63d", "#43594c", "#004cbf", "#de73e6", "#7f4040", "#ccaa66", "#16593a", "#668fcc", "#590053", "#e6acac", "#594a2d", "#0d3321", "#1d3473", "#664d64", "#997373", "#332f26", "#73e6b0", "#80a2ff", "#330029", "#8c3123", "#7f6600", "#bfffe1", "#b6c6f2", "#ff40d9", "#ff9180", "#403300", "#698c7c", "#4d5366", "#4d2645", "#402420", "#f2da79", "#008c5e", "#4059ff", "#e60099", "#594643", "#7f7340", "#60bfac", "#131b4d", "#a6297c", "#591800", "#bfb68f", "#00f2e2", "#1a1d33", "#d96cb5", "#401100", "#fff240", "#008c83", "#0000ff", "#7f0044", "#d96236", "#b2aa2d", "#10403d", "#0000cc", "#8c466c", "#d9896c", "#535900", "#336663", "#3030bf", "#f2b6d6", "#7f5140", "#eef2b6", "#8fbfbc", "#737399", "#4d3944", "#cca799", "#c2f200", "#00e2f2", "#110080", "#f23d85", "#ff6600", "#2b330d", "#00add9", "#aaa3d9", "#4c132a", "#a64200", "#cfe673", "#1d6273", "#110040", "#997382", "#ff8c40", "#6d7356", "#13414d", "#341d73", "#66001b", "#66381a", "#739926", "#79daf2", "#a280ff", "#400011", "#402310", "#74d900", "#566d73", "#3e394d", "#992645", "#e5a173", "#628040", "#00aaff", "#3e2d59", "#bf6079", "#ffd9bf", "#315916", "#002b40", "#7400d9", "#663341", "#995200", "#b2ff80", "#297ca6", "#660099", "#cc3347", "#ffa640", "#d0ffbf", "#262f33", "#75468c", "#ff8091", "#a67f53", "#29a63a", "#0058a6", "#2b1a33"];

const colorMix = ["#ff0000", "#f2000d", "#e6001a", "#d90026", "#cc0033", "#bf0040", "#b2004c", "#a60059", "#990066", "#8c0073", "#800080", "#73008c", "#660099", "#5900a6", "#4d00b2", "#4000bf", "#3300cc", "#2600d9", "#1900e6", "#0d00f2", "#0000ff"]
// from https://www.w3schools.com/colors/colors_mixer.asp

// map crosshair size etc:
const crosshairPath = 'lib/focus-black.svg';
const crosshairSize = 30;

// hiding and showing elements, including their screen real estate. from https://stackoverflow.com/a/51113691/4355695
function hide(el) {
    el.style.visibility = 'hidden';	
  return el;
}

function show(el) {
  el.style.visibility = 'visible';	
  return el;
}

function checklatlng(lat,lon) {
	if ( typeof lat == 'number' && 
		typeof lon == 'number' &&
		!isNaN(lat) &&
		!isNaN(lon) ) {
		//console.log(lat,lon,'is valid');
		return true;
	}
	else {
		//console.log(lat,lon,'is not valid');
		return false;
	}
}


function getTodayDate(offset = 0) {
	var d = new Date();
	d.setDate(d.getDate() + offset);
	let thisMonth = String(d.getMonth() + 1); // getMonth returns Jan=0, Feb=1 etc
	var date1 = `${d.getFullYear()}-${("0" + thisMonth).slice(-2)}-${("0" + d.getDate()).slice(-2)}`;
	return date1;
}

