module("cuttype: gcode");
test("gcode injection test", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "gcode",
      "gcode": ["M3", "M5"],
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: gcode",
      "M3",
      "M5",
      "; end cut: gcode"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});
