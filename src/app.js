var app = angular.module('opencutApp', ['ui.codemirror', 'cfp.hotkeys']);
app.controller('Ctrl', function ($scope, $window, hotkeys) {
  var renderer = new opencutPaper('preview-area');

  $scope.showEditor = true;
  $scope.showGcode = false;
  $scope.showPreview = true;

  $scope.yamlEditorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: 'yaml',
    };
  $scope.gcodeEditorOptions = {mode: 'text', readonly: 'nocursor'};

  $scope.yamlErrors = [];
  $scope.gcode = [];

  $scope.$watch('jobYaml', function(newValue, oldValue) {
    if (!$scope.job || !angular.equals(newValue, oldValue)) {
      $scope.yamlErrors = [];
      try {
        $scope.job = YAML.parse(newValue);
      } catch (err) {
        $scope.yamlErrors = [err.message];
      }
    }
  });

  $scope.$watch('job', function(newValue, oldValue) {
    if (!$scope.compiledJob || !angular.equals(newValue, oldValue)) {
      renderer.renderJob(newValue);
      if (newValue) {
        $scope.compiledJob = $window.opencut.toGCode(newValue);
        $scope.gcode = $scope.compiledJob.gcode;
      } else {
        $scope.compiledJob = {};
        $scope.gcode = [];
      }
    }
  });


  $scope.jobYaml = YAML.stringify({
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "profile",
      "depth": -0.125,
      "side": "inside",
      "shape": {
        "type": "rectangle",
        "origin": [1, 1],
        "size": [0.5, 0.75]
      }
    }]
  }, 4, 2);

  $scope.toPrettyJson = function(obj) {
    return JSON.stringify(obj, null, '  ');
  };

  $scope.toYaml = function(obj) {
    return YAML.stringify(obj, 3, 2);
  };


  $scope.yamlFile = null;

  $scope.openFile = function() {
    chrome.fileSystem.chooseEntry({
      'type': 'openFile',
      'accepts': [{
        'description': 'YAML files',
        'extensions': ['yml', 'yaml', '.txt']
      }]
    }, function(entry) {
      $scope.$apply(function() {
        $scope.yamlFile = entry;
        $scope.job = null
      });
      entry.file(function(file) {
        var reader = new FileReader();
        reader.onerror = console.error;
        reader.onabort = console.error;
        reader.onloadend = function(e) {
          console.log("I did done load");
          $scope.$apply(function() {
            $scope.jobYaml = e.target.result;
          });
        };
        reader.readAsText(file);
      });
    });
  };

  var writeToFileFn = function(fileContents, cleanupFn) {
    return function(entry) {
      entry.createWriter(function(writer) {
        writer.onerror = console.error;
        writer.onwriteend = function() {
          console.log("done saving file: " + entry.fullPath);
          if (cleanupFn) {
            cleanupFn(entry);
          }
        };
        writer.write(new Blob([fileContents], {'type': 'text/x-yaml'}));
      }, console.error);
    }
  };

  $scope.saveNewFile = function() {
    var suggestedName = "untitled.yaml";
    chrome.fileSystem.chooseEntry({
      'type': 'saveFile',
      'suggestedName': suggestedName
    }, writeToFileFn($scope.jobYaml, function(entry) {
      $scope.$apply(function() {
        $scope.yamlFile = entry;
      });
    }));
  };

  $scope.saveFile = function() {
    if (!$scope.yamlFile) {
      $scope.saveNewFile();
      return;
    } else {
      chrome.fileSystem.getWritableEntry($scope.yamlFile,
          writeToFileFn($scope.jobYaml));
    }
  };

  $scope.gcodeFile = null;
  $scope.exportGcode = function() {
    var suggestedName = "untitled.gcode";
    if ($scope.gcodeFile && $scope.gcodeFile.name) {
      suggestedName = $scope.gcodeFile.name;
    }
    // TODO: suggest a name based off the yaml file.
    chrome.fileSystem.chooseEntry({
      'type': 'saveFile',
      'suggestedName': suggestedName
    }, writeToFileFn($scope.gcode.join('\n'), function(entry) {
      $scope.$apply(function() {
        $scope.gcodeFile = entry;
      });
    }));
  };

  // Helper function for resizing elements.
  var stretchToAchor = function(elem, anchor) {
    if (elem && anchor) {
      elem.style.setProperty("height", (anchor.getBoundingClientRect().top -
          elem.getBoundingClientRect().top) + "px");
    }
  }

  // Update the size of various elements to fill the screen.
  var resize = function() {
    var anchor = document.getElementById("bottom-tracker");
    var previewContainer = document.getElementById("preview-container");
    stretchToAchor(document.getElementById("gcode"), anchor);
    stretchToAchor(previewContainer, anchor);

    renderer.setSize(previewContainer.getBoundingClientRect());

    $scope.$broadcast('CodeMirror', function(cm) {
      var e = document.getElementById("yaml-editor");
      cm.setSize("auto", (anchor.getBoundingClientRect().top -
          e.getBoundingClientRect().top) + "px");
    });
  };
  $window.addEventListener('resize', resize);
  $window.addEventListener('load', resize);


  // Setup hotkeys.
  hotkeys.add({
    combo: 'mod+o',
    description: 'open a file',
    callback: $scope.openFile
  });
  hotkeys.add({
    combo: 'mod+s',
    description: 'save a file',
    callback: $scope.saveFile
  });
  hotkeys.add({
    combo: 'mod+shift+s',
    description: 'save as a new file',
    callback: $scope.saveNewFile
  });
  hotkeys.add({
    combo: 'mod+e',
    description: 'export gcode',
    callback: $scope.exportGcode
  });
});
