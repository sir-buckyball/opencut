/*global deepEqual*/
/*global ok*/

module("opencut framework");

test("empty job validation", function() {
  var results = window.opencut.toGCode({});
  ok(results.errors.length != 0, "expected some errors");
});


test("precision dulling", function() {
	window.opencut.registerCutType("precisiontest",
	  function generatePathCut(workspace, cut) {
  	  return {
        "warnings": [],
        "gcode": ["G1 X9.000005e-9"]};
  	});

  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "z_step_size": 0.1,
    "cuts": [{"type": "precisiontest"}]
  };

  var expected = {
    "warnings": [],
    "errors": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: precisiontest",
      "G1 X0",
      "; end cut: precisiontest"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("the dreaded negative zero", function() {
  window.opencut.registerCutType("negzero",
    function generatePathCut(workspace, cut) {
      return {
        "warnings": [],
        "gcode": ["G1 X-0 Y-0"]};
    });

  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "z_step_size": 0.1,
    "cuts": [{"type": "negzero"}]
  };

  var expected = {
    "warnings": [],
    "errors": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: negzero",
      "G1 X0 Y0",
      "; end cut: negzero"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("critical errors", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "z_step_size": 0,
    "cuts": [{
      "type": "gcode",
      "gcode": ["M3", "M5"],
    }]
  };

  var expected = {
    "warnings": [],
    "errors": ["z_step_size must be greater than 0"],
    "gcode": []
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("default depth", function() {
  window.opencut.registerCutType("depthcheck",
    function generatePathCut(workspace, cut) {
      return {"warnings": [], "gcode": ["G1 Z" + cut.depth]};
    });

  var job = {
    "name": "test_job",
    "units": "mm",
    "bit_diameter": 3,
    "feed_rate": 10,
    "plunge_rate": 5,
    "z_step_size": 1,
    "default_depth": -5,
    "cuts": [{"type": "depthcheck"}]
  };

  var expected = {
    "warnings": [],
    "errors": [],
    "gcode": [
      "G90",
      "G21",
      "",
      "; begin cut: depthcheck",
      "G1 Z-5",
      "; end cut: depthcheck"
    ]
  };

  deepEqual(window.opencut.toGCode(job), expected);
});
