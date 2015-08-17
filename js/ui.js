midi = new Midi();
sysex = new SysexHandler(midi);

function showError(message) {
	console.log("ERROR: " + message);
	alert(message);
}


// Initialization

function initializeApp() {
	midi.initialize(onMidiAvailable, onNoMidi);
}

function onMidiAvailable(){
	initializeUI();
	readPrefs();
}

function onNoMidi() {
	showError("WebMIDI not supported.");
}


function initializeUI() {

	// MIDI port selectors

	//$('#midiIn').selectmenu();
	addOption('#midiIn', midi.NoMidiPortValue);
	midi.getInNames().forEach(name => addOption('#midiIn', name));
	$('#midiIn').change(onMidiInChange);

	//$('#midiOut').selectmenu();
	addOption('#midiOut', midi.NoMidiPortValue);
	midi.getOutNames().forEach(name => addOption('#midiOut', name));
	$('#midiOut').change(onMidiOutChange);

	// Patch list
	$('#patchList').accordion({
      heightStyle: "fill"
    });
    initializePatchList($('#patchListUser'), "User");
    initializePatchList($('#patchListA'), "Preset A");
    initializePatchList($('#patchListB'), "Preset B");
    initializePatchList($('#patchListC'), "Preset C");
    initializePatchList($('#patchListD'), "Preset D (GM)");
    initializePatchList($('#patchListE'), "Preset E");
    initializePatchList($('#patchListSession'), "Session");
}

function readPrefs() {
	var midiInVal = getPrefs('midiIn');
	if (midiInVal) {
		$('#midiIn').val(midiInVal);
		midi.useMidiIn(midiInVal);
	}

	var midiOutVal = getPrefs('midiOut');
	if (midiOutVal) {
		$('#midiOut').val(midiOutVal);
		midi.useMidiOut(midiOutVal);	
	}

	var midiEchoVal = getPrefs('midiEcho');
	if (midiEchoVal != null) {
		$('#midiEcho').prop('checked', midiEchoVal);
		midi.setMidiEcho(midiEchoVal);	
	}
}


function initializePatchList(element, bankName) {
	var bank = Banks[bankName];
	var patchList = bank.patches;

	bankMsb = bank.msb;
	bankLsb = bank.lsb;

	//element.attr('size', patchList.length);
	var items = '';
	for (var i = 0; i < patchList.length; i++) {
		var patch = patchList[i];
		//element.append($('<option>', {value: i, text: patch.number + ' ' + patch.name}));

		action = 'midi.sendProgramBankChange(' + i + ',' + bankMsb + ',' + bankLsb + ')';
		items += '<li><span class="number">' + patch.number +
			'</span> <a class="name" href="#"" onclick="' + action + '"">' + patch.name +
			'</a><span class="infobox">' + patch.voices +
			(patch.poly == false ? '<span class="mode">s</span>' : '') +
			'</span></li>';
	};
	element.append(items);
	element.change(function(){
		program = element.val();
		bankMsb = bank.msb;
		bankLsb = bank.lsb;
		console.log("Bank " + bankMsb + " " + bankLsb + ", Program " + program);
		midi.sendProgramBankChange(program, bankMsb, bankLsb);
	});
}


// UI utils

function addOption(selector, val, txt) {
	$(selector).append($('<option>', {value: val, text: txt || val}));
}


// Event handlers

function onMidiInChange() {
	var portName = $("#midiIn").val();
	midi.useMidiIn(portName);
	setPrefs('midiIn', portName);
}

function onMidiOutChange() {
	var portName = $("#midiOut").val();
	midi.useMidiOut(portName);
	setPrefs('midiOut', portName)
}

function onToggleMidiEcho() {
	var enable = $("#midiEcho").prop('checked');
	midi.setMidiEcho(enable);
	setPrefs('midiEcho', enable);
}

function onSendIdentityRequest() {
	sysex.identityRequest(
		(eventName, data) => alert("Sysex success: " + eventName),
		(eventName) => alert("Sysex fail: " + eventName));
}

function onSendUserPatchRequest() {
	var patchNumber = 10;
	sysex.onSendUserPatchRequest(
		(eventName, patch) => alert("Sysex success: PatchName = " + patch.common.PatchName),
		(eventName) => alert("Sysex fail: " + eventName),
		patchNumber);
}