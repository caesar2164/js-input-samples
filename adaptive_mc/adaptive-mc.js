// A global array named "objects" is defined in a separate file, adaptive-example.js, which is called by the HTML file.


//tracker variable changes to the destination object number as the user moves throughout the problem set (initially set to 0, the first object)
var tracker = {
	'value': '0',
	'history': []
};

var loadTime;
var stateReady = 0;

$(document).ready(function(){

	console.log('document ready');

	//calls makeItem function (below); compiles data from the objects array, depending on object type
	var testLength = objects.length;
    for(i = 0; i < testLength; i++){
        makeItem(objects, i);
    }

	// Calls loadProgress function (below); shows only the user's current object, depending on where they left off
	// "Loading" screen covers the fact that we're waiting to see if setState fires.
	$("#probcontainer").append("<div id = 'loading'>Loading...</div>");
	loadTime = setTimeout(function(){ loadProgress(0); }, 2000);

	//listens for user to click on a MC choice
	$("input").click(function(){ 
		console.log('clicked on multiple choice');

		//sets variable key to the value of the selected choice
		var key = $(this).attr('value');

		//determines the problem number (i.e., if selected choice's input's name is "problem1", probNumber is 1--these start at 0 by default)
		var probNumber = $(this).attr('name').replace('problem','');
		// Add this to our user history for logging purposes.
		tracker.history.push(parseInt(probNumber));


		//finds the key's logic in probNumber's object, which is the destination
		var destination = objects[probNumber].logic[key];

		//keeps the user at the same object, if the destination object and current object are the same
		if(destination != probNumber && destination >= 0){
			//current object slides offscreen, form is reset
			$("#div" + probNumber).hide("slide",1000);
			$(this).removeAttr("checked");

			//destination object slides onscreen
			$("#div" + destination).delay(1000).show("slide",{direction:"right"},1000);

			//tracker variable is updated to show progress through problem set
			tracker.value = destination;

			//shows "Continue" button for object types without input (all but MC questions)
			if(objects[destination].type == "video" || objects[destination].type == "image" || objects[destination].type == "text" && objects[destination].logic != 'end'){
				$("#button"+destination).delay(1500).show("highlight", 100);
			};
		};
	});
	

	//This is the function that takes data from objects array and formats it
    function makeItem(item, x){
	//formats multiple choice object type
		if(item[x].type == "MC") {
			console.log('making MC');
			//appends a form with radio buttons to the probcontainer div
			$("#probcontainer").append("<form id='" + x + "'>");
			for(j = 0; j < item[x].html.choices.length; j++){
			    $("#" + x).append("<input name = 'problem" + x 
			    	+ "' value = '" + item[x].html.choices[j] 
			    	+ "' id = 'input" + x + "-" + j
			    	+ "' type = 'radio'>" 
			    	+ "<label for='input" + x + "-" + j
			    	+ "'>" + item[x].html.choices[j] + "</label>"
			    	+ "</br>");
			};
			$("#probcontainer").append("</form>");
			$("#" + x).wrap("<div class='sneaky' id='div" + x + "'></div>");
			$("#" + x).before("<p>" + item[x].html.stem + "</p>");
		};

		// NOTE: for non-MC object types, logic (e.g., what happens when "Continue" is pressed) 
		// is compiled in this function

		// formats image object type
		if(item[x].type == "image"){
			console.log('making image');
			$("#probcontainer").append("<img src = '" + item[x].html.src 
				+ "' height = '" + item[x].html.height 
				+ "' width = '" + item[x].html.width 
				+ "' alt='"+ item[x].html.alt 
				+ "' id = '" + x + "'>");
			$("#" + x).wrap("<div class='sneaky' id='div" + x + "'></div>");
			$("#" + x).after("<br/>");
			if(item[x].logic != 'end'){
				$("#div" + x).append("<button type='button' id='button"+x+"'>Continue</button>");
				$("#button"+x).css("position", "absolute");
				$("#button"+x).css("top", item[x].html.height + 10);
				$("#button"+x).click(function(){ buttonClick(item, x, 'image') });
			}
		};
		
		//formats video object type
		if(item[x].type == "video"){
			console.log('making video');

			$("#probcontainer").append("<iframe id='" + x 
				+ "' width='" + item[x].html.width 
				+ "' height='" + item[x].html.height 
				+ "' src='" + item[x].html.src 
				+ "' frameborder='0' allowfullscreen>");
			$("#" + x).wrap("<div class='sneaky' id='div" + x + "'></div>");
			$("#" + x).after("<br/>");
			if(item[x].logic != 'end'){
				$("#div" + x).append("<button type='button' id='button"+x+"'>Continue</button>");
				$("#button"+x).css("position", "absolute");
				$("#button"+x).css("top", item[x].html.height + 10);
				$("#button"+x).click(function(){ buttonClick(item, x, 'video') });
			}
		};
		
		//formats text object type
		if(item[x].type == "text"){
			console.log('making text');
			$("#probcontainer").append("<p id='" + x + "'>" + item[x].html.text + "</p>");
			$("#" + x).wrap("<div class='sneaky' id='div" + x + "'></div>");
			$("#" + x).after("<br/>");
			if(item[x].logic != 'end'){
				$("#div" + x).append("<button type='button' id='button"+x+"'>Continue</button>");
				$("#button"+x).click(function(){ buttonClick(item, x, 'text') });
			}
		}
	};
	

});

// This function handles button clicks on text, image, and video elements.
function buttonClick(item, x, type){

	// Slide off the existing one, slide on the new one, and update the tracker and history.
	if(item[x].logic >=0){

		$("#div"+x).hide("slide",1000);
		$("#div"+item[x].logic).delay(1000).show("slide",{direction:"right"},1000);

		tracker.history.push(x);
		tracker.value = item[x].logic;

		console.log('from ' + type + ' to item ' + item[x].logic);
	}
}

// This function loads the object to which var tracker was last assigned
function loadProgress(x){
	console.log('loading progress');
	
	// Hide the existing one, show the new one.
	var vis = $('#probcontainer div:visible');
	vis.hide();

	var newone = $("#div"+x);
	console.log( newone );
	newone.show();

};

// This wrapper function is necessary.
var AdaptiveMC = (function() {

	// REQUIRED --- DO NOT REMOVE/CHANGE!!
	var channel;

	// REQUIRED --- DO NOT REMOVE/CHANGE!!
	if (window.parent !== window) {
		channel = Channel.build({
			window: window.parent,
			origin: "*",
			scope: "JSInput"
		});
		channel.bind("getGrade", getGrade);
		channel.bind("getState", getState);
		channel.bind("setState", setState);

	}

	// getState() and setState() are required by the problem type.
	function getState(){
		console.log('getting state');
		return JSON.stringify(tracker);
	}

	// TODO: This needs a major update. Be sure to put all the cards in their correct places.
	function setState() {
		console.log('setting state');
		stateStr = arguments.length === 1 ? arguments[0] : arguments[1];
		tracker = JSON.parse(stateStr);
		
		// Intentionally clearing the history - we've already logged the last one.
		tracker.history = [];
		
		console.log(tracker);

		clearTimeout(loadTime);
		
		// Call up object
		if (tracker.value >= 0){
			loadProgress(tracker.value);
		}
	}

	// To keep students from seeing the solution that way, just pass the problem state back
	// and use python in the problem XML to analyze it.

	function getGrade() {
		console.log('getting grade');

		// Log the problem state.
		// This is called from the parent window's Javascript so that we can write to the official edX logs.
		 parent.logThatThing(tracker);

		// Return the whole problem state.
		return JSON.stringify(tracker);
	}

	// REQUIRED --- DO NOT REMOVE/CHANGE!!
	return {
		getState: getState,
		setState: setState,
		getGrade: getGrade
	};

}());