module("cuttype: drill");
test("basic gcode test", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "drill",
      "points": [[0, 0], [2, 3]],
      "depth": -0.125
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: drill",
      "G90",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X0 Y0 F10",
      "G1 Z-0.1 F5",
      "G1 Z0 F20",
      "G1 Z-0.1 F20",
      "G1 Z-0.125 F5",
      "G1 Z0 F20",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X2 Y3 F10",
      "G1 Z-0.1 F5",
      "G1 Z0 F20",
      "G1 Z-0.1 F20",
      "G1 Z-0.125 F5",
      "G1 Z0 F20",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: drill"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});
