$(document).ready(function() {
  // Helper function to show warnings to the user.
  var showWarning = function(msg) {
    var warningsElement = $("#user-warnings");
    var m = $("<div>");
    m.addClass("warning");
    m.text(msg);
    warningsElement.append(m);
    warningsElement.show();
  };

  // Helper function to clear warnings to the user.
  var clearWarnings = function() {
    var warningsElement = $("#user-warnings");
    warningsElement.text("");
    warningsElement.hide();
  };

  // Helper function to parse the YAML input.
  var parseYaml = function(editor) {
    var contentLines = [];
    var lines = editor.getValue().split("\n");
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].split("#", 2)[0].trim().length > 0) {
        contentLines.push(lines[i]);
      }
    }
    return window.YAML.parse(contentLines.join("\n"));
  };

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
  editor.commands.addCommand({
    name: "preview",
    bindKey: {win:"Ctrl-P", mac: "Command-P"},
    exec: function(editor) {
      $("#btn-preview").click()
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
    clearWarnings();

    // Use the name state in the file if it is available.
    var filename = "unnamed.yaml";
    try {
      var job = parseYaml(editor);
      if (job.name) {
        filename = job.name + ".yaml";
      }
    } catch (err) {
      console.warn("document not valid YAML", err);
      showWarning("document not valid YAML: " + err.message);
    }

    var blob = new Blob([editor.getValue()], {type:"text/x-yaml"});
    console.log("saving file: " + filename);
    window.saveAs(blob, filename);
  });

  // Configure the gcode button
  $("#btn-compile-gcode").click(function(e) {
    clearWarnings();

    // Parse the YAML input.
    // NOTE: The YAML parser doesn't like blank lines...
    try {
      window.job = parseYaml(editor);
    } catch (err) {
      console.warn("failed to parse YAML", err);
      showWarning("failed to parse YAML: " + err.message);
      return;
    }

    // Process the job description.
    var processedJob = window.opencut.toGCode(window.job);

    // Display any errors/warnings to the user.
    for (var err = 0; err < processedJob.errors.length; err++) {
      showWarning(processedJob.errors[err]);
    }
    for (var j = 0; j < processedJob.warnings.length; j++) {
      showWarning(processedJob.warnings[j]);
    }

    // Generate the output.
    if (processedJob.errors.length === 0) {
      window.output = [];
      for (var k = 0; k < processedJob.warnings.length; k++) {
        window.output.push("; WARNING: " + processedJob.warnings[k]);
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

  // To preview, open a new window and send along the current editor contents.
  var previewPopup = null;
  $("#btn-preview").click(function(e) {
    if (!previewPopup || !previewPopup.location) {
      console.log("opening preview window.");
      previewPopup = window.open("render.html");
      $(previewPopup).ready(function() {
        setTimeout(function() {
          previewPopup.postMessage(editor.getValue(), "*");
        }, 50);
      })
    } else {
      previewPopup.postMessage(editor.getValue(), "*");
      previewPopup.focus();
    }
    window.pp = previewPopup;
  });

  // Load up an example file.
  $.ajax({
    url : "examples/demo.yaml",
    dataType: "text",
    success : function (data) {
      editor.setValue(data);
      editor.moveCursorToPosition({row: 0, col: 0});
    }
  });
});
