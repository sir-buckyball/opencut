/* global opencut:false */
/* global newGcodeRenderer:false */

function renderYaml(txt) {
  console.time("render YAML");

  // parse the YAML.
  var job = function(t) {
    // Sadly, the YAML parser doesn't deal with comments nicely.
    var contentLines = [];
    var lines = txt.split("\n");
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].split("#", 2)[0].trim().length > 0) {
        contentLines.push(lines[i]);
      }
    }
    return window.YAML.parse(contentLines.join("\n"));
  }(txt);

  // TODO: display errors.
  var processedJob = opencut.toGCode(job);
  for (var i = 0; i < processedJob.errors.length; i++) {
    console.error(processedJob.errors[i]);
  }
  for (var i = 0; i < processedJob.warnings.length; i++) {
    console.warn(processedJob.warnings[i]);
  }
  var bitDiameter = job.bit_diameter * ((job.units == "inch") ? 25.4 : 1);
  newGcodeRenderer(document.getElementById('myCanvas'))
      .renderGcode(processedJob.gcode.join("\n"), {
        'bit_diameter': bitDiameter,
      });
  console.timeEnd("render YAML");
}

function handleFile(file) {
  console.log("processing file: " + file.name);
  console.time("read file");
  var reader = new FileReader();
  reader.onloadend = function(evt) {
    if (evt.target.readyState == FileReader.DONE) {
      console.timeEnd("read file");

      // TODO: this should be endsWith, but that is not yet supported...
      if (file.name.indexOf(".yaml") != -1) {
        renderYaml(evt.target.result);
      } else if (file.name.indexOf(".gcode") != -1 || file.name.indexOf(".nc") != -1) {
        window.gcodeRenderer.renderGcode(evt.target.result);
      } else {
        console.log("unknown file type");
      }
    }
  };
  reader.readAsText(file);
}

function setupDragDrop() {
  var dropZone = $("body")[0];
  dropZone.addEventListener('dragover', function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }, false);
  dropZone.addEventListener('drop', function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    console.log("file drop detected.");

    var files = [];
    if (evt.target.files) {
      files = evt.target.files; // FileList object
    } else if (evt.dataTransfer) {
      files = evt.dataTransfer.files; // FileList object.
    } else {
      console.log("unknown file input");
    }
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, false);
}

$(document).ready(function() {
  setupDragDrop();

  // Listen for updates from our main page.
  window.addEventListener("message", function(event) {
    console.log("got a message from the heavens:\n" + event.data);
    renderYaml(event.data);
  }, false);

  // Create a renderer.
  window.gcodeRenderer = newGcodeRenderer(document.getElementById('myCanvas'));
  $(window).resize(function() {
    window.gcodeRenderer.resizeView();
  });
});
