/*global angular*/
/*global newGcodeRenderer */
/*global opencut */
/*global Blob */

var app = angular.module('app', ['ui.codemirror', 'cfp.hotkeys']);
app.controller('Ctrl', function ($rootScope, $scope, $window, $timeout, hotkeys) {
  var renderer = newGcodeRenderer(document.getElementById("preview"));

  $scope.jobYaml = "";
  $scope.yamlEditorOptions = {
      lineWrapping : true,
      lineNumbers: true,
      mode: 'yaml',
      viewportMargin: Infinity,
  };

  $scope.gcode = "";

  $scope.openFile = function() {
    $("#input-file-local").click();
  };

  // Angular doesn't deal with file input well.
  // https://github.com/angular/angular.js/issues/1375
  var handleFile = function(e) {
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
          $scope.$apply(function() {
            $scope.jobYaml = evt.target.result;
          });
        }
      };
      reader.readAsText(f);
    } else {
      console.log("input file had no content.");
    }

    // Clear the input so we can detect a change in the future.
    $("#input-file-local").val("");
  };
  $("#input-file-local").change(handleFile);
  
  
  $scope.$watch("jobYaml", function(newVal, oldVal) {
    renderer.resizeView();

    $scope.errors = [];
    $scope.warnings = [];

    // Parse the YAML.
    var contentLines = [];
    var lines = newVal.split("\n");
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].split("#", 2)[0].trim().length > 0) {
        contentLines.push(lines[i]);
      }
    }
    if (contentLines.length == 0) {
      return;
    }

    var job;
    try {
      job = window.YAML.parse(contentLines.join("\n"));
    } catch (e) {
      $scope.errors = ["line " + e.parsedLine + ": " + e.message];
      $scope.gcode = "";
      console.error(e);
      return;
    }
    $scope.job = job;

    var processedJob = opencut.toGCode(job || {});
    $scope.gcode = processedJob.gcode.join("\n");
    $scope.warnings = processedJob.warnings;
    $scope.errors = processedJob.errors;
    for (var i = 0; i < processedJob.errors.length; i++) {
      console.error(processedJob.errors[i]);
    }
    for (var i = 0; i < processedJob.warnings.length; i++) {
      console.warn(processedJob.warnings[i]);
    }
    var bitDiameter = undefined;
    if (job != null && job.bit_diameter > 0) {
      bitDiameter = job.bit_diameter * ((job.units == "inch") ? 25.4 : 1);
    }
    renderer.renderGcode($scope.gcode, {'bit_diameter': bitDiameter});
  });

  $(window).resize(function() {
    renderer.resizeView();
  });
  
  var _saveFile = function(e, payload, fileSuffix, mime) {
    if (e != undefined) {
      e.stopPropagation();
      e.preventDefault();
    }

    var filename = "unnamed." + fileSuffix;
    if ($scope.job.name) {
      filename = $scope.job.name + "." + fileSuffix;
    }

    var blob = new Blob([payload], {type: mime});
    console.log("saving file: " + filename);
    window.saveAs(blob, filename);
  };
  $scope.saveFile = function(e) {
    _saveFile(e, $scope.jobYaml, "yaml", "text/x-yaml");
  };
  $scope.exportGcode = function(e) {
    _saveFile(e, $scope.gcode, "gcode", "text/x-gcode");
  };
  
  hotkeys.add({
    combo: 'mod+o',
    description: 'open a file',
    callback: $scope.openFile,
    allowIn: ['INPUT', 'SELECT', 'TEXTAREA']
  });
  hotkeys.add({
    combo: 'mod+s',
    description: 'save file',
    callback: $scope.saveFile,
    allowIn: ['INPUT', 'SELECT', 'TEXTAREA']
  });
  hotkeys.add({
    combo: 'mod+e',
    description: 'export gcode',
    callback: $scope.exportGcode,
    allowIn: ['INPUT', 'SELECT', 'TEXTAREA']
  });
});


//   // Load up an example file.
//   $.ajax({
//     url : "examples/demo.yaml",
//     dataType: "text",
//     success : function (data) {
//       editor.setValue(data);
//     }
//   });
// });
