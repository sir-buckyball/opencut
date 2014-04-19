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
