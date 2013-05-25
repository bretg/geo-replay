var marker;
var map;
var numPaths;
var numPoints=new Array();
var pathSymbol=new Array();
var pathSeg=new Array();
var pathSegTime=new Array();
var pathSegStartTime=new Array();
var pathSegIncr=new Array();
var pathSegProgress=new Array();
var pathSegLabel=new Array();
var pause=-1;
var maxTime=0;
var minTime=0;
var curTime=0;
var curTimeIncr;
var totalFrames;
var realTimeIncr;
var appData;

  var mapMinStyle= [
  {
    featureType: "all",
    stylers: [
      { visibility: "off" }
    ]
  },{
    featureType: "landscape.natural",
    stylers: [
      { visibility: "on" }
    ]
  },{
    featureType: "water",
    stylers: [
      { visibility: "on" }
    ]
  },{
    featureType: "administrative.country",
    stylers: [
      { visibility: "on" }
    ]
  },{
    featureType: "administrative.locality",
    stylers: [
      { visibility: "on" }
    ]
  },{
    featureType: "administrative.province",
    stylers: [
      { visibility: "on" }
    ]
  }
];

var playControlDiv = document.createElement('div');
// Set CSS styles for the DIV containing the control
playControlDiv.style.padding = '5px';
// Set CSS for the control border.
var controlUI = document.createElement('div');
controlUI.style.backgroundColor = 'white';
controlUI.style.borderStyle = 'solid';
controlUI.style.borderWidth = '1px';
controlUI.innerHTML="<img src='icons/play.png' />";
playControlDiv.appendChild(controlUI);
var speedUpUI = document.createElement('div');
speedUpUI.style.backgroundColor = 'white';
speedUpUI.align='center';
speedUpUI.style.paddingLeft = '2px';
speedUpUI.style.paddingRight = '2px';
speedUpUI.innerHTML="<img src='icons/up_tri.png' />";
playControlDiv.appendChild(speedUpUI);
var speedTextUI = document.createElement('div');
speedTextUI.style.backgroundColor = 'white';
speedTextUI.style.fontSize = '10px';
speedTextUI.align='center';
speedTextUI.style.paddingLeft = '2px';
speedTextUI.style.paddingRight = '2px';
speedTextUI.innerHTML=appData.animLength;
playControlDiv.appendChild(speedTextUI);
var speedDownUI = document.createElement('div');
speedDownUI.style.backgroundColor = 'white';
speedDownUI.align='center';
speedDownUI.style.paddingLeft = '2px';
speedDownUI.style.paddingRight = '2px';
speedDownUI.innerHTML="<img src='icons/down_tri.png' />";
playControlDiv.appendChild(speedDownUI);

// debug element
var debugDiv=document.createElement('div');
var debugTextUI = document.createElement('div');
debugTextUI.style.backgroundColor = 'white';
debugTextUI.style.fontSize = '10px';
debugTextUI.align='center';
debugTextUI.style.paddingLeft = '2px';
debugTextUI.style.paddingRight = '2px';
debugTextUI.innerHTML='0';
debugDiv.appendChild(debugTextUI);

window.onload = replay_initialize;

function addInfoWindow(marker, message) {
            var info = message;
            var infoWindow = new google.maps.InfoWindow({content: message});
            google.maps.event.addListener(marker, 'click', function () {
                infoWindow.open(map, marker);
            });
}

function huntPath(firstChoice, secondChoice, thirdChoice) {
   if (firstChoice) { return firstChoice; }
   if (secondChoice) { return secondChoice; }
   if (thirdChoice) { return thirdChoice; }
   return "";
}


  
function replay_initialize() {

  centerPoint=new google.maps.LatLng(appData.mapCenter.lat, appData.mapCenter.lng);

  var mapType=google.maps.MapTypeId.TERRAIN;
  if (appData.mapType == "hybrid") {
     mapType=google.maps.MapTypeId.HYBRID;
  } else if (appData.mapType == "roadmap") {
     mapType=google.maps.MapTypeId.ROADMAP;
  } else if (appData.mapType == "satellite") {
     mapType=google.maps.MapTypeId.SATELLITE;
  }

  var mapOptions = {
    zoom: appData.mapZoom,
    center: centerPoint,
    mapTypeId: mapType,
    streetViewControl: false
  };

  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(playControlDiv);
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(debugDiv);

  if (appData.mapStyle == "min") {
	  map.setOptions({styles: mapMinStyle});
  }

  // set up dynamic styles
  var numStyles=appData.labelStyles.length;
  for (var n=0; n<numStyles; n++) {
     var sheet = document.createElement('style');
     sheet.innerHTML = "." + appData.labelStyles[n].name + " {" + appData.labelStyles[n].value + "}";
     document.body.appendChild(sheet);
  }

  var numPaths=appData.paths.length;
  for(var p=0; p<numPaths; p++) {
    pathSeg[p]=new Array();
    pathSegTime[p]=new Array();
    pathSegStartTime[p]=new Array();
    pathSegIncr[p]=new Array(); // this wont get set until later, but establish the arrays now
    pathSegProgress[p]=new Array(); // this wont get set until later, but establish the arrays now
    pathSegLabel[p]=new Array(); // this wont get set until later, but establish the arrays now
    var symbol=huntPath(appData.paths[p].animSymbol,"arrow");
    var color=huntPath(appData.paths[p].pathColor, "#000000");
    var width=huntPath(appData.paths[p].pathWidth, 1);
    if (symbol == "arrow") {
	    pathSymbol[p]={path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW};
    } else if (symbol == "circle") {
	    pathSymbol[p]={path: google.maps.SymbolPath.CIRCLE};
    } else if (symbol == "box") {
       pathSymbol[p]={
         path: 'M -2,-2 -2,2 2,2 2,-2 z',
         fillOpacity: 1,
         strokeColor: color,
         fillColor: color
         };
    } else if (symbol == "diamond") {
       pathSymbol[p]={
         path: 'M -2,0 0,-2 2,0 0,2 z',
         fillOpacity: 1,
         strokeColor: color,
         fillColor: color
         };
    } else if (symbol == "wide-rect") {
       pathSymbol[p]={
         path: 'M -3,-1 -3,1 3,1 3,-1 z',
         fillOpacity: 1,
         strokeColor: color,
         fillColor: color
         };
    } else if (symbol == "long-rect") {
       pathSymbol[p]={
         path: 'M -1,-3 -1,3 1,3 1,-3 z',
         fillOpacity: 1,
         strokeColor: color,
         fillColor: color
         };
    } else {
       pathSymbol[p]=google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
    }
    numPoints[p]=appData.paths[p].points.length-1;
    for(var n=0; n<=numPoints[p]; n++) {

      var p1=new google.maps.LatLng(appData.paths[p].points[n].lat, appData.paths[p].points[n].lng);
      var d1=huntPath(date2time(appData.paths[p].points[n].date),appData.paths[p].points[n].time,(n+1)*2); // date1
      setMaxMinTime(d1);

      var i; // store marker icon
      // set up markers and info window clicks
      i=huntPath(appData.paths[p].points[n].markerImage, appData.paths[p].defaultMarkerImage, "star-3.png");
      if (i != "none") {
        marker = new google.maps.Marker({position: p1, map: map, icon: i});
        addInfoWindow(marker, appData.paths[p].points[n].details);
      }

      // write text label on first point
      if (n==0 && appData.paths[p].points[n].text) {
        var x=huntPath(appData.paths[p].points[n].textOffsetX, appData.paths[p].defaultTextOffsetX, 10);
        var y=huntPath(appData.paths[p].points[n].textOffsetY, appData.paths[p].points[n].textOffsetY, -20);
	var style=huntPath(appData.paths[p].points[n].labelStyle,appData.defaultLabelStyle,"");
        label = new ELabel(map, p1, appData.paths[p].points[n].text, style, new google.maps.Size(x,y), 75);
        label.setMap(map);
      }

      // dont add the last point as a new pathSeg
      if (n<numPoints[p]) {
        var p2=new google.maps.LatLng(appData.paths[p].points[n+1].lat, appData.paths[p].points[n+1].lng);
        var d2=huntPath(date2time(appData.paths[p].points[n+1].date),appData.paths[p].points[n+1].time,(n+2)*2); // date2
	setMaxMinTime(d2);
        pathSeg[p][n] = new google.maps.Polyline({ path: [p1, p2], strokeColor: color, strokeWeight: width });
        pathSeg[p][n].setMap(map);
	pathSegTime[p][n]=d2-d1;  // diff in time units
	pathSegStartTime[p][n]=d1;  // start time for seg
	pathSegProgress[p][n]=0;  // 0-100%
	pathSegLabel[p][n]="";  // empty
      }
      console.log("line"+p+", point"+n+", mintime="+minTime+", maxTime="+maxTime)
    }
  }

  // set current clock
  curTime=minTime;
  calcAnimParams();

  google.maps.event.addDomListener(controlUI, 'click', animControl);
  google.maps.event.addDomListener(speedDownUI, 'click', speedDownButton);
  google.maps.event.addDomListener(speedUpUI, 'click', speedUpButton);

}

// main animation function
function runFrame () {

   if (pause==1) {
	return;
   }

   // loop through paths and determine which segments should be incremented
   var numPaths=appData.paths.length;
   for(var p=0; p<numPaths; p++) { // path loop
      for(var n=0; n<numPoints[p]; n++) { // point loop (skip last point as it's not a seg)
	 // find paths in progress and move their icons
	 // find paths that should be started and add their icon
	 if ((pathSegProgress[p][n] > 0 && pathSegProgress[p][n] < 100) ||
	     (pathSegProgress[p][n]==0 && curTime >= pathSegStartTime[p][n])) {
	    var icons;
	    if (pathSegProgress[p][n]==0) {
	       icons=[{ icon: pathSymbol[p], offset: '0%' }];
	    } else {
	       icons=pathSeg[p][n].get('icons');
	    }
	    pathSegProgress[p][n] += pathSegIncr[p][n];
	    if (pathSegProgress[p][n] > 100) { pathSegProgress[p][n]=100; }
            icons[0].offset = pathSegProgress[p][n].toFixed(2) + '%';
            pathSeg[p][n].set('icons', icons);

	 // find paths that are ended, remove their icon, turn on next label
	 }
	 if (pathSegProgress[p][n]==100) {
            pathSeg[p][n].set('icons', '');
            pathSegProgress[p][n]=101; // set to done
            if (appData.paths[p].points[n+1].text) { // turn on next point label
                  var x=huntPath(appData.paths[p].points[n+1].textOffsetX, appData.paths[p].defaultTextOffsetX, 10);
                  var y=huntPath(appData.paths[p].points[n+1].textOffsetY, appData.paths[p].defaultTextOffsetY, 10);
                  var style=huntPath(appData.paths[p].points[n+1].labelStyle,appData.defaultLabelStyle,"");
		  var lablatlng=pathSeg[p][n].getPath().getAt(1);
		  var labText=appData.paths[p].points[n+1].text;
                  pathSegLabel[p][n] = new ELabel(map, lablatlng, labText, style, new google.maps.Size(x,y), 75);
	          pathSegLabel[p][n].setMap(map);
            }
	 }
      }
   }
   if (curTime > maxTime) { // if we're done, reset and stop the loop
      pause=-1;
      curTime=minTime;
      controlUI.innerHTML="<img src='icons/play.png' />";
      var numPaths=appData.paths.length;
      for(var p=0; p<numPaths; p++) { // path loop
         for(var n=0; n<numPoints[p]; n++) { // point loop
		 pathSegProgress[p][n]=0;
	 }
      }
   } else { // increment clock and set next interation
      curTime+=curTimeIncr;
      debugTextUI.innerHTML=curTime;
      window.setTimeout(runFrame, realTimeIncr);
   }
}

// calculate (or re-calculate) the animation parameters, both overall and seg-specific
function calcAnimParams() {
   totalFrames=appData.animLength * appData.animSmoothness;
   realTimeIncr=appData.animLength/totalFrames*1000; // time in ms for each interval
   curTimeIncr=(maxTime-minTime)/totalFrames; // simulation time incr

   var numPaths=appData.paths.length;
   for(var p=0; p<numPaths; p++) { // path loop
      for(var n=0; n<numPoints[p]; n++) { // point loop
	      // % of total time for this segment * totalFrames
	      var framesInSeg=(pathSegTime[p][n]/(maxTime-minTime)) * totalFrames;
	      pathSegIncr[p][n]=100/framesInSeg;
      }
   }
}


// handle play button
//
// reads the pause flag
// if -1, first run
// if 0, set to 1. next run of anim function will pause functions
// if 1, set to 0 and set up anim sequence
function animControl() {
   if (pause==0) {
	pause=1;
	controlUI.innerHTML="<img src='icons/play.png' />";
   } else {
	pause=0;
	controlUI.innerHTML="<img src='icons/pause.png' />";
	// clear labels that might be on for a replay
	// [couldn't get show/hide working]
        var numPaths=appData.paths.length;
        for(var n=0; p<numPaths; p++) { // path loop
           for(var p=0; p<numPoints[n]; p++) { // point loop
		   if (pathSegLabel[n][p]) {
			   pathSegLabel[n][p].setMap(null);
		   }
           }
       }
       window.setTimeout(runFrame, realTimeIncr);
   }
}

// handle speed up button
function speedUpButton() {
   if (appData.animLength < 300) {
	appData.animLength+=5;
	speedTextUI.innerHTML=appData.animLength;
	calcAnimParams();
   }
}
// handle speed down button
function speedDownButton() {
   if (appData.animLength > 9) {
	appData.animLength-=5;
	speedTextUI.innerHTML=appData.animLength;
	calcAnimParams();
   }
}

// use an approximation for # of days since the year 0 as a time code
// negative years should work as well
function date2time(indate) {
   if (typeof indate === "undefined") {
	   return "";
   }
   var datePieces=indate.split("/");
   return((datePieces[0]*366)+(datePieces[1]*31)+(datePieces[2]*1));
}

function setMaxMinTime(intime) {
   intime=parseInt(intime);
   if (maxTime==0 && minTime==0) {
	   maxTime=intime;
	   minTime=intime;
   } else if (maxTime < intime) {
	   maxTime=intime;
   } else if (minTime > intime) {
	   minTime=intime;
   }
}
