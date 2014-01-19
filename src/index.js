window.lastLoadedFilename = "unnamed.yaml";

$(document).ready(function() {
  // Configure the editor.
  $("#yaml-editor").height($(window).height() - $("#yaml-editor").position().top);
  var editor = window.ace.edit("yaml-editor");
  editor.setTheme("ace/theme/textmate");
  editor.getSession().setMode("ace/mode/yaml");
  editor.commands.addCommand({
    name: "compile-gcode",
    bindKey: {win:"Ctrl-B", mac: "Command-B"},
    exec: function(editor) {
      $("#btn-compile-gcode").click();
    },
    readOnly: true
  });
  editor.commands.addCommand({
    name: "save",
    bindKey: {win:"Ctrl-S", mac: "Command-S"},
    exec: function(editor) {
      $("#btn-save-file").click();
    },
    readOnly: true
  });
  editor.commands.addCommand({
    name: "open",
    bindKey: {win:"Ctrl-O", mac: "Command-O"},
    exec: function(editor) {
      $("#btn-open-file").click();
    },
    readOnly: true
  });
  editor.focus();

  $(window).resize(function() {
    $("#yaml-editor").height($(window).height() - $("#yaml-editor").position().top);
    editor.resize();
  });

  // Configure the open button.
  var handleFileSelect = function(e) {
    e.stopPropagation();
    e.preventDefault();

    var files;
    if (e.target.files) {
      files = e.target.files; // FileList object
    } else if (e.dataTransfer) {
      files = e.dataTransfer.files; // FileList object.
    } else {
      console.log("unknown file input");
    }

    // only examine the first file.
    if (files.length > 0) {
      var f = files[0];
      console.log("opening file: " + f.name);
      window.lastLoadedFilename = f.name;
      var reader = new FileReader();
      reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) {
          editor.setValue(evt.target.result, 0);
          editor.moveCursorToPosition({row: 0, col: 0});
        }
      };
      reader.readAsText(f);
    } else {
      console.log("input file had no content.");
    }

    // Clear the input so we can detect a change in the future.
    $("#input-file-local").val("");
  };
  $("#btn-open-file").click(function(e) {
    $("#input-file-local").click();
  });
  $("#input-file-local").change(handleFileSelect);

  // Configure the save button
  $("#btn-save-file").click(function(e) {
    var filename = window.lastLoadedFilename || "unnamed.yaml";
    var blob = new Blob([editor.getValue()], {type:"text/x-yaml"});
    console.log("saving file: " + filename);
    window.saveAs(blob, filename);
  });

  // Configure the gcode button
  $("#btn-compile-gcode").click(function(e) {
    // Parse the YAML input.
    // NOTE: The YAML parser doesn't like blank lines...
    var contentLines = [];
    var lines = editor.getValue().split("\n");
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim().length > 0) {
        contentLines.push(lines[i]);
      }
    }
    window.job = window.YAML.parse(contentLines.join("\n"));

    // Process the job description.
    var processedJob = window.opencut.toGCode(window.job);

    // Display any warnings to the user.
    var warningsElement = $("#user-warnings");
    warningsElement.text("");
    if (processedJob.warnings.length > 0) {
      warningsElement.show();
    } else {
      warningsElement.hide();
    }
    for (var j = 0; j < processedJob.warnings.length; j++) {
      var d = $("<div>");
      d.addClass("warning");
      d.text(processedJob.warnings[j]);
      warningsElement.append(d);
    }

    // Generate the output.
    if (processedJob.warnings.length == 0) {
      window.output = [];
      for (var j = 0; j < processedJob.warnings.length; j++) {
        window.output.push("; WARNING: " + processedJob.warnings[j]);
      }
      window.output = window.output.concat(processedJob.gcode);
      window.output = window.output.join("\n");
      $("#output-gcode").text(window.output);

      // Update the download link.
      var filename = (window.job.name || "unnamed") + ".gcode";
      var blob = new Blob([window.output], {type:"text/plain"});
      console.log("saving file: " + filename);
      window.saveAs(blob, filename);
    }
  });
});
