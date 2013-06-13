var numPaths=0;
var map;
// paths is an array of GMaps polyline objects
var paths=new Array();
var receivingMarkerImg;
var receivingMarkerVar;
var receivingLine;
var isCollapsed=0;

window.onload=initialize_replay_edit;

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

function initialize_replay_edit() {

  // set app widgets to proper values
  if (replayData.appName) {
    setFieldValue("appName",replayData.appName);
  }
  if (replayData.appDescription) {
    setFieldValue("appDescription",replayData.appDescription);
  }
  if (replayData.author) {
	  setFieldValue("author",replayData.author)
  }
  if (replayData.tags) {
	  setFieldValue("tags",replayData.tags)
  }
  if (replayData.sources) {
    setFieldValue("sources",replayData.sources);
  }
  if (replayData.defaultLabelStyle) {
    setFieldValue("defaultLabelStyle",replayData.defaultLabelStyle);
  }
  if (replayData.mapType) {
    setFieldValue("mapType",replayData.mapType);
  }
  if (replayData.mapStyle) {
    setFieldValue("mapStyle",replayData.mapStyle);
  }
  if (replayData.animLength) {
    setFieldValue("animLength",replayData.animLength);
  }
  if (replayData.status=="0" || replayData.status=="1") {
    setFieldValue("status",replayData.status);
  }
  
  $('.tagLabel').tooltip(); // set up tag tooltip
  
  var centerPoint;
  if (replayData.mapCenter) {
	centerPoint=new google.maps.LatLng(replayData.mapCenter.lat, replayData.mapCenter.lng);
  } else {
	centerPoint=new google.maps.LatLng(30.59, -98.35);
  }
  var zoom;
  if (replayData.mapZoom) {
	  zoom=replayData.mapZoom;
  } else {
	  zoom=1;
  }
  var mapOptions = {
    zoom: zoom,
    center: centerPoint,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    streetViewControl: false,
    mapTypeControl: false
  };

  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

  // loop through each path set up the line data structure
  numPaths=replayData.paths.length;
  for(var p=0; p<numPaths; p++) {
	  newPath=new google.maps.Polyline();
	  newPath.setMap(map);
	  newPath.setEditable(true);
      google.maps.event.addListener(newPath, 'click', lineClicked);
      google.maps.event.addListener(newPath, 'capturing_changed', lineBeingEdited);
	  newPath.set("id",p);
	  newPath.set("lineName",replayData.paths[p].pathName);
	  newPath.set("animSymbol",replayData.paths[p].animSymol);
	  newPath.set("lineWidth",replayData.paths[p].pathWidth);
	  newPath.set("defaultTextOffsetX",replayData.paths[p].defaultTextOffsetX);
	  newPath.set("defaultTextOffsetY",replayData.paths[p].defaultTextOffsetY);
	  newPath.set("lineDefaultMarker",replayData.paths[p].defaultMarkerImage);
	  var numPoints=replayData.paths[p].points.length;
	  var llArray=new Array();
	  for(var n=0; n<numPoints; n++) {
		  newPoint=new google.maps.LatLng(replayData.paths[p].points[n].lat, replayData.paths[p].points[n].lng);
		  llArray.push(newPoint);
		  newPath.set("point"+n+"Label",replayData.paths[p].points[n].text);
		  newPath.set("point"+n+"Time",replayData.paths[p].points[n].time);
		  if (replayData.paths[p].points[n].date) {
			  newPath.set("point"+n+"Time",replayData.paths[p].points[n].date);
		  }
		  newPath.set("point"+n+"OffsetX",replayData.paths[p].points[n].textOffsetX);
		  newPath.set("point"+n+"OffsetY",replayData.paths[p].points[n].textOffsetY);
		  newPath.set("point"+n+"Details",replayData.paths[p].points[n].details);
		  newPath.set("point"+n+"Marker",replayData.paths[p].points[n].markerImage);
	  }
	  newPath.setPath(llArray);
	  paths[p]=newPath;
  }
  
  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYLINE,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYLINE
      ]
    },
    polylineOptions: {
      strokeWeight: 5,
      strokeColor: '#000000',
      clickable: true,
      editable: true
    }
  });
  drawingManager.setMap(map);
  google.maps.event.addListener(drawingManager, 'polylinecomplete', lineComplete);
  
}


function lineComplete(line) {
   google.maps.event.addListener(line, 'click', lineClicked);
   google.maps.event.addListener(line, 'capturing_changed', lineBeingEdited);
   paths[numPaths]=line;
   line.set("id",numPaths);
   numPaths++;
   drawPathDiv(line);
}

function lineClicked() {
   var line=this;
   drawPathDiv(line);
}

function lineBeingEdited() {
   unselectLines();
   var pathDiv = document.getElementById("pathDiv");
   pathDiv.innerHTML='';
}

function unselectLines() {
	for(var n=0; n<numPaths; n++) {
		paths[n].setOptions({"strokeColor":"#000000"});
	}
}

// selected a line -- make it red and draw the right line frame
function drawPathDiv(line) {
	unselectLines();
    line.setOptions({"strokeColor":"#FF0000"}); // and this one red
	var lineId=line.get("id");
	var uiHtml='<form id="lineForm"><div class="row-fluid"><div class="span2"><div class="formlabel">Line&nbsp;Name</div></div>';
	uiHtml += '<div class="span4"><input type="text" id="lineName" class="input-block-level" onchange="setLineFieldValue('+lineId+',\x27lineName\x27)"></div>';
	uiHtml += '<div class="span2"><div class="formlabel">Anim Symbol</div></div>';
	uiHtml += '<div class="span4"><select id="animSymbol" class="input-block-level" onchange="setLineFieldValue('+lineId+',\x27animSymbol\x27)"><option value="arrow">arrow</option><option value="circle">circle</option><option value="diamond">diamond</option><option value="box">box</option><option value="wide-rect">wide rectangle</option><option value="long-rect">long rectangle</option></select></div>';
	uiHtml += '</div> <!-- end of first row -->';
	uiHtml += '<div class="row-fluid">';
	uiHtml += '<div class="span2"><div class="formlabel">Color</div></div>';
	uiHtml += '<div class="span4"><select id="lineColor" class="input-block-level" onchange="setLineFieldValue('+lineId+',\x27lineColor\x27)"><option value="#000000">Black</option><option value="#FFFF00" style="background: #FFFF00;">Yellow</option><option value="#99FF66" style="background: #99FF66;">Green</option><option value="#00FFFF" style="background: #00FFFF;">Blue</option><option value="#FF9933" style="background: #FF9933;">Orange</option><option value="#FF8181" style="background: #FF8181;">Red</option><option value="#E0E0EB" style="background: #E0E0EB;">Grey</option></select></div>';
	uiHtml += '<div class="span2"><div class="formlabel">Default Marker</div></div><div id="lineDefaultMarkerDiv" class="span4"></div>';
	uiHtml += '</div> <!-- end of second row -->';
	uiHtml += '<div class="row-fluid">';
	uiHtml += '<div class="span2"><div class="formlabel">Width</div></div>';
	uiHtml += '<div class="span4"><select id="lineWidth" class="input-block-level" onchange="setLineFieldValue('+lineId+',\x27lineWidth\x27)"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option></select></div>';
	uiHtml += '</div> <!-- end of third row -->';
	uiHtml += '<div class="row-fluid">';
	uiHtml += '<div class="span3"><div class="formlabel">Default Label Offset</div></div>';
	uiHtml += '<div class="span1" align="right"><div class="formlabel">X</div></div><div class="span2"><input type="text" id="defaultTextOffsetX" class="input-block-level" onchange="setLineFieldValue('+lineId+',\x27defaultTextOffsetX\x27)"></div><div class="span1" align="right"><div class="formlabel">Y</div></div><div class="span2"><input type="text" id="defaultTextOffsetY" class="input-block-level" onchange="setLineFieldValue('+lineId+',\x27defaultTextOffsetY\x27)"></div>';
	uiHtml += '</div> <!-- end of fourth row -->';
   var numPoints=line.getPath().getLength();
   for (var n=0; n<numPoints; n++) {
	   uiHtml += '<div class="row-fluid" style="background: #E0E0EB">';
	   uiHtml += '<div class="span12"><div class="formlabel">Point ' + n + ' Lat: ' + line.getPath().getAt(n).lat().toFixed(5) + ' Lng: ' + line.getPath().getAt(n).lng().toFixed(5) + '</div></div></div>';
	   uiHtml += '<div class="row-fluid">';
	   uiHtml += '<div class="span2"><div class="formlabel">Label</div></div>';
	   uiHtml += '<div class="span4"><input type="text" id="point'+n+'Label" class="input-block-level" onchange="setLineFieldValue('+lineId+',\x27point'+n+'Label\x27)"></div>';
	   uiHtml += '<div class="span2"><div class="formlabel"><a href="#" class="dateTime" data-original-title="Enter YYYY/MM/DD or a time code">Date or Time</a></div></div>';
	   uiHtml += '<div class="span4"><input type="text" id="point'+n+'Time" class="input-block-level" onchange="setLineFieldValue('+lineId+',\x27point'+n+'Time\x27)"></div>';
	   uiHtml += '</div> <!-- end of second point row -->';
	   uiHtml += '<div class="row-fluid">';
	   uiHtml += '<div class="span6" align="right"><div class="formlabel">Label Offset</div></div>';
	   uiHtml += '<div class="span1" align="right"><div class="formlabel">X</div></div><div class="span2"><input type="text" class="input-block-level" id="point'+n+'OffsetX" onchange="setLineFieldValue('+lineId+',\x27point'+n+'OffsetX\x27)"></div><div class="span1" align="right"><div class="formlabel">Y</div></div><div class="span2"><input type="text" class="input-block-level" id="point'+n+'OffsetY" onchange="setLineFieldValue('+lineId+',\x27point'+n+'OffsetY\x27)"></div>';
	   uiHtml += '</div> <!-- end of third point row -->';
	   uiHtml += '<div class="row-fluid">';
	   uiHtml += '<div class="span2"><div class="formlabel">Label Style</div></div>';
	   uiHtml += '<div class="span4"><select id="point'+n+'LabelStyle" class="input-block-level" onchange="setLineFieldValue('+lineId+',\x27point'+n+'LabelStyle\x27)"><option value="default">Default</option><option value="labelStyle1" style="background: #FFFF00;">Yellow</option><option value="labelStyle2" style="background: #99FF66;">Green</option><option value="labelStyle3" style="background: #00FFFF;">Blue</option><option value="labelStyle4" style="background: #FF9933;">Orange</option><option value="labelStyle5" style="background: #FF8181;">Red</option><option value="labelStyle6" style="background: #E0E0EB;">Grey</option></select></div>';
	   uiHtml += '<div class="span2"><div class="formlabel">Marker</div></div>';
	   uiHtml += '<div class="span4" id="point'+n+'MarkerDiv"></div>';
	   uiHtml += '</div> <!-- end of fourth point row -->';
	   uiHtml += '<div class="row-fluid">';
	   uiHtml += '<div class="span2"><div class="formlabel">Details</div></div>';
	   uiHtml += '<div class="span10"><textarea id="point'+n+'Details" rows="1" class="input-block-level" onchange="setLineFieldValue('+lineId+',\x27point'+n+'Details\x27)"></textarea></div>';
	   uiHtml += '</div> <!-- end of last point row -->';
   }
   uiHtml += '</table></form>';
   var pathDiv = document.getElementById("pathDiv");
   pathDiv.innerHTML=uiHtml;

   initializeWidget(line,"lineName","Line " + lineId);
   initializeWidget(line,"animSymbol","arrow");
   initializeWidget(line,"lineColor","#000000");
   initializeWidget(line,"lineWidth",2);
   initializeWidget(line,"defaultTextOffsetX",10);
   initializeWidget(line,"defaultTextOffsetY",-20);
   $('.dateTime').tooltip();
   var defLineMarker=line.get("lineDefaultMarker");
   var lineDivHtml;
   if (!defLineMarker) {
	   defLineMarker="markers/marker.png";
	   line.set("lineDefaultMarker",defLineMarker);
   }
   lineDivHtml='<img id="lineDefaultMarkerImg" src="'+defLineMarker+'" height="15">';
   var lineMarkerDiv=document.getElementById("lineDefaultMarkerDiv");
   lineMarkerDiv.innerHTML='<a onclick="showMarkerWindow('+lineId+');">'+lineDivHtml+'</a>';
   
   // points
   var divHtml;
   for (var n=0; n<numPoints; n++) {
	   initializeWidget(line,"point"+n+"Label","Point "+n);
	   initializeWidget(line,"point"+n+"Time","");
	   initializeWidget(line,"point"+n+"OffsetX","");
	   initializeWidget(line,"point"+n+"OffsetY","");
	   initializeWidget(line,"point"+n+"Details","");
	   var markerDiv=document.getElementById("point"+n+"MarkerDiv");
	   var pointMarker=line.get("point"+n+"Marker");
	   if (pointMarker) {
		   divHtml='<img id="point'+n+'MarkerImg" src="'+pointMarker+'" height="15">';
	   } else {
		   divHtml='<img id="point'+n+'MarkerImg" src="markers/default.png" height="15">';
	   }
	   markerDiv.innerHTML='<a onclick="showMarkerWindow('+lineId+','+n+');">'+divHtml+'</a>';
   }
}

function showMarkerWindow(lineId,pointId) {
     receivingLine=lineId;
     if (typeof pointId === 'undefined') {
	     receivingMarkerVar="lineDefaultMarker";
	     receivingMarkerImg="lineDefaultMarkerImg";
     } else {
	     receivingMarkerVar="point"+pointId+"Marker";
	     receivingMarkerImg="point"+pointId+"MarkerImg";
     }
     window.open("marker_window.html", "marker_window", "status=1,width=350,height=150");
}

function runReplay() {
     window.open("replay_preview.html", "replay_preview", "status=1,width=800,height=300");
}

function handleMarkerWindowResponse(markerFile) {
	paths[receivingLine].set(receivingMarkerVar,markerFile);
	var i=document.getElementById(receivingMarkerImg);
	i.src=markerFile;
}

// used to set up right nav
function initializeWidget(line,id,defval) {
   var wid=document.getElementById(id);
   var prevVal=line.get(id);
   if (prevVal) {
	   wid.value=prevVal;
   } else {
	   wid.value=defval;
	   line.set(id,wid.value);
   }
}

// line data is stored within the PolyLine object
function setLineFieldValue(lineId,field) {
	var widget=document.getElementById(field);
	line=paths[lineId];
	var command="line.set('"+field+"','"+widget.value+"');";
	eval(command);
}

function setZoom() {
   replayData.mapZoom=map.getZoom();
}

function setCenter() {
   var lat=map.getCenter().lat();
   var lng=map.getCenter().lng();
   replayData.mapCenter=new Object();
   replayData.mapCenter.lat=lat;
   replayData.mapCenter.lng=lng;
}

function toCenter() {
   map.setZoom(replayData.mapZoom);
   map.setCenter(new google.maps.LatLng(replayData.mapCenter.lat,replayData.mapCenter.lng));
}

function getAppObj() {
	var appPaths=new Array();
	for(var n=0; n<numPaths; n++) { // add path fields
		var line=paths[n];
		appPaths[n]=new Object();
		appPaths[n].pathName=line.get("lineName");
		appPaths[n].animSymbol=line.get("animSymbol");
		appPaths[n].pathColor=line.get("lineColor");
		appPaths[n].pathWidth=line.get("lineWidth");
		appPaths[n].defaultTextOffsetX=line.get("defaultTextOffsetX");
		appPaths[n].defaultTextOffsetY=line.get("defaultTextOffsetY");
		appPaths[n].defaultMarkerImage=line.get("lineDefaultMarker");
		appPaths[n].points=new Array;
		var numPoints=line.getPath().getLength();
		for (var p=0; p<numPoints; p++) {
			appPaths[n].points[p]=new Object;
			appPaths[n].points[p].lat=line.getPath().getAt(p).lat().toFixed(5);
			appPaths[n].points[p].lng=line.getPath().getAt(p).lng().toFixed(5);
			appPaths[n].points[p].text=line.get("point"+p+"Label");
			var v=line.get("point"+p+"Time");
			if (v) {
			   if (v.search(/\//) == -1) { // no slashes so treat as time code
			      appPaths[n].points[p].time=v;
			   } else { // date
			      appPaths[n].points[p].date=v;
			   }
			}
			v=line.get("point"+p+"Label");
			if (v) {
				appPaths[n].points[p].text=v;
			}
			v=line.get("point"+p+"OffsetX");
			if (v) {
				appPaths[n].points[p].textOffsetX=v;
			}
			v=line.get("point"+p+"OffsetY");
			if (v) {
				appPaths[n].points[p].textOffsetY=v;
			}
			v=line.get("point"+p+"Details");
			if (v) {
				appPaths[n].points[p].details=v;
			}
			v=line.get("point"+p+"LabelStyle");
			if (v && v!="default") {
				appPaths[n].points[p].labelStyle=v;
			}
			v=line.get("point"+p+"Marker");
			if (v && v!="markers/default.png") {
				appPaths[n].points[p].markerImage=v;
			}


		}
	}
	replayData.paths=appPaths;

	// styles are hardcoded for now
	var appLabelStyles=new Array();
	var appLabelColors=["#FFFF00","#99FF66","#00FFFF","#FF9933","#FF8181","#E0E0EB"]
	for (var n=0; n<6; n++) {
		appLabelStyles[n]=new Object();
		appLabelStyles[n].name="labelStyle"+(n+1);
		appLabelStyles[n].value="border: 1px solid black; margin-top: 2px; background: "+appLabelColors[n]+"; padding: 2px; font-size: 75%; font-weight:bold; white-space:nowrap;";
	}
	replayData.labelStyles=appLabelStyles;
	return replayData;
}

function saveReplay() {
	appObj=getAppObj();
	var str=JSON.stringify(appObj);
	console.log(str);

	if (appObj.id > 0) {  // this is an update to an existing object
	   $.ajax({
	     url: '/replays/'+appObj.id,
	     type: 'PUT',
	     data: str,
	     contentType: 'application/json; charset=utf-8',
	     dataType: 'json',
	     async: false,
	     success: function(res) {
		console.log(JSON.stringify(res));
		alert("edits saved");
	     },
	     error: function() {
		alert("error editing replay");
	    }
	   });
	} else { // this is a new object
	   $.ajax({
	     url: '/replays',
	     type: 'POST',
	     data: str,
	     contentType: 'application/json; charset=utf-8',
	     dataType: 'json',
	     async: false,
	     success: function(res) {
		console.log(JSON.stringify(res));
		// set the new ID on the data
		replayData.id=res.replayId;
		alert("replay created");
	     },
	     error: function() {
		console.log(JSON.stringify(res));
	     	alert('error submitting new replay');
	    }
	   });
	}
}

function setAppFieldValue(field) {
	var widget=document.getElementById(field);
	var command="replayData."+field+"=widget.value;";
	eval(command);
}

function setFieldValue(field,val) {
	var widget=document.getElementById(field);
	widget.value=val;
}

function setMapStyle() {
	var widget=document.getElementById('mapStyle');
	replayData.mapStyle=widget.value;
	if (widget.value == "min") {
		map.setOptions({styles: mapMinStyle});
	} else {
		map.setOptions({styles: ""});
	}
}

function setMapType() {
	var widget=document.getElementById('mapType');
	replayData.mapType=widget.value;
	if (replayData.mapType == "terrain") {
		map.setOptions({mapTypeId: google.maps.MapTypeId.TERRAIN});
  	} else if (replayData.mapType == "hybrid") {
		map.setOptions({mapTypeId: google.maps.MapTypeId.HYBRID});
  	} else if (replayData.mapType == "roadmap") {
		map.setOptions({mapTypeId: google.maps.MapTypeId.ROADMAP});
  	} else if (replayData.mapType == "satellite") {
		map.setOptions({mapTypeId: google.maps.MapTypeId.SATELLITE});
        }
}

function changeCollapseIcon() {
	var widget=document.getElementById('appDetails');
	var divHtml='<a data-toggle="collapse" data-target="#appDataDiv" onclick="changeCollapseIcon();"><i class="icon-chevron-';
	if (isCollapsed) {
		divHtml += "down";
		isCollapsed=0;
	} else {
		divHtml += "right";
		isCollapsed=1;
	}
	divHtml += '"></i><strong>Details</strong></a>';
	widget.innerHTML=divHtml;
}
