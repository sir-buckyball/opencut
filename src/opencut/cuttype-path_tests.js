module("cuttype: path");
test("basic gcode test", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "path",
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
      "; begin cut: path",
      "G90",
      "G1 Z0.25 F20",
      "G0 X0 Y0",
      "G1 Z-0.1 F5",
      "G1 X2 Y3 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X0 Y0",
      "G1 Z-0.125 F5",
      "G1 X2 Y3 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: path"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("loop path", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "path",
      "points": [[0, 0], [0, 1], [1, 0], [0, 0]],
      "depth": -0.15
    }]
  };

  var expected = {
    "errors": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: path",
      "G90",
      "G1 Z0.25 F20",
      "G0 X0 Y0",
      "G1 Z-0.1 F5",
      "G1 X0 Y1 F10",
      "G1 X1 Y0 F10",
      "G1 X0 Y0 F10",
      "G4 P0",
      "G1 Z-0.15 F5",
      "G1 X0 Y1 F10",
      "G1 X1 Y0 F10",
      "G1 X0 Y0 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: path"
    ],
    "warnings": []
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("z-step override", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "path",
      "points": [[0, 0], [1, 1]],
      "depth": -0.2
    }, {
      "type": "path",
      "points": [[2, 2], [3, 3]],
      "depth": -0.2,
      "z_step_size": 0.15
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
    "G90",
      "G20",
      "",
      "; begin cut: path",
      "G90",
      "G1 Z0.25 F20",
      "G0 X0 Y0",
      "G1 Z-0.1 F5",
      "G1 X1 Y1 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X0 Y0",
      "G1 Z-0.2 F5",
      "G1 X1 Y1 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: path",
      "",
      "; begin cut: path",
      "G90",
      "G1 Z0.25 F20",
      "G0 X2 Y2",
      "G1 Z-0.15 F5",
      "G1 X3 Y3 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X2 Y2",
      "G1 Z-0.2 F5",
      "G1 X3 Y3 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: path"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("points z-top", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "path",
      "points": [[0, 0], [1, 1]],
      "depth": -0.4,
      "z_top": -0.2
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
    "G90",
      "G20",
      "",
      "; begin cut: path",
      "G90",
      "G1 Z0.25 F20",
      "G0 X0 Y0",
      "G1 Z-0.3 F5",
      "G1 X1 Y1 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X0 Y0",
      "G1 Z-0.4 F5",
      "G1 X1 Y1 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: path"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});