/*global deepEqual*/
module("cuttype: screwhole");

test("common screwpath", function() {
  var job = {
    "units": "mm",
    "bit_diameter": 3,
    "feed_rate": 10,
    "plunge_rate": 5,
    "z_step_size": 1,
    "cuts": [{
      "type": "screwpath",
      "points": [[10, 0], [0, 200]],
      "depth": -3,
      "shaft_diameter": 4,
      "cap_diameter": 6,
      "cap_depth": -1,
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G21",
      "",
     "; begin cut: screwpath",
      "",
      "; begin cut: path",
      "G90",
      "G1 Z5 F20",
      "G0 X10 Y0",
      "G1 Z-1 F5",
      "G1 F10",
      "G1 X0 Y200",
      "G1 X-1.49813 Y199.92509",
      "G1 X8.50187 Y-0.07491",
      "G3 X10.07491 Y-1.49813 I1.49813 J0.07491",
      "G3 X11.49813 Y0.07491 I-0.07491 J1.49813",
      "G1 X1.49813 Y200.07491",
      "G3 X-0.07491 Y201.49813 I-1.49813 J-0.07491",
      "G3 X-1.49813 Y199.92509 I0.07491 J-1.49813",
      "G1 Z5 F20",
      "G4 P0",
      "; end cut: path",
      "",
      "; begin cut: path",
      "G90",
      "G1 Z5 F20",
      "G0 X10 Y0",
      "G1 Z-2 F5",
      "G1 F10",
      "G1 X0 Y200",
      "G1 X-0.49938 Y199.97503",
      "G1 X9.50062 Y-0.02497",
      "G3 X10.02497 Y-0.49938 I0.49938 J0.02497",
      "G3 X10.49938 Y0.02497 I-0.02497 J0.49938",
      "G1 X0.49938 Y200.02497",
      "G3 X-0.02497 Y200.49938 I-0.49938 J-0.02497",
      "G3 X-0.49938 Y199.97503 I0.02497 J-0.49938",
      "G1 Z5 F20",
      "G4 P0",
      "G0 X10 Y0",
      "G1 Z-3 F5",
      "G1 F10",
      "G1 X0 Y200",
      "G1 X-0.49938 Y199.97503",
      "G1 X9.50062 Y-0.02497",
      "G3 X10.02497 Y-0.49938 I0.49938 J0.02497",
      "G3 X10.49938 Y0.02497 I-0.02497 J0.49938",
      "G1 X0.49938 Y200.02497",
      "G3 X-0.02497 Y200.49938 I-0.49938 J-0.02497",
      "G3 X-0.49938 Y199.97503 I0.02497 J-0.49938",
      "G1 Z5 F20",
      "G4 P0",
      "; end cut: path",
      "; end cut: screwpath"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("capless screwpath", function() {
  var job = {
    "units": "mm",
    "bit_diameter": 3,
    "feed_rate": 10,
    "plunge_rate": 5,
    "z_step_size": 1,
    "cuts": [{
      "type": "screwpath",
      "points": [[0, 0], [0, 10]],
      "depth": -3,
      "shaft_diameter": 4,
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G21",
      "",
      "; begin cut: screwpath",
      "",
      "; begin cut: path",
      "G90",
      "G1 Z5 F20",
      "G0 X0 Y0",
      "G1 Z-1 F5",
      "G1 F10",
      "G1 X0 Y10",
      "G1 X-0.5 Y10",
      "G1 X-0.5 Y0",
      "G3 X0 Y-0.5 I0.5 J0",
      "G3 X0.5 Y0 I0 J0.5",
      "G1 X0.5 Y10",
      "G3 X0 Y10.5 I-0.5 J0",
      "G3 X-0.5 Y10 I0 J-0.5",
      "G1 Z5 F20",
      "G4 P0",
      "G0 X0 Y0",
      "G1 Z-2 F5",
      "G1 F10",
      "G1 X0 Y10",
      "G1 X-0.5 Y10",
      "G1 X-0.5 Y0",
      "G3 X0 Y-0.5 I0.5 J0",
      "G3 X0.5 Y0 I0 J0.5",
      "G1 X0.5 Y10",
      "G3 X0 Y10.5 I-0.5 J0",
      "G3 X-0.5 Y10 I0 J-0.5",
      "G1 Z5 F20",
      "G4 P0",
      "G0 X0 Y0",
      "G1 Z-3 F5",
      "G1 F10",
      "G1 X0 Y10",
      "G1 X-0.5 Y10",
      "G1 X-0.5 Y0",
      "G3 X0 Y-0.5 I0.5 J0",
      "G3 X0.5 Y0 I0 J0.5",
      "G1 X0.5 Y10",
      "G3 X0 Y10.5 I-0.5 J0",
      "G3 X-0.5 Y10 I0 J-0.5",
      "G1 Z5 F20",
      "G4 P0",
      "; end cut: path",
      "; end cut: screwpath"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("cap_diameter too small", function() {
  var job = {
    "units": "mm",
    "bit_diameter": 3,
    "feed_rate": 10,
    "plunge_rate": 5,
    "z_step_size": 1,
    "cuts": [{
      "type": "screwpath",
      "points": [[0, 0], [10, 10]],
      "depth": -3,
      "shaft_diameter": 4,
      "cap_diameter": 2,
      "cap_depth": -1,
    }]
  };

  var expected = {
    "errors": [
      "screwpath 'cap_diameter' must be a number greater than the 'shaft_diameter'"
    ],
    "warnings": [],
    "gcode": [
      "G90",
      "G21",
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("not enough points", function() {
  var job = {
    "units": "mm",
    "bit_diameter": 3,
    "feed_rate": 10,
    "plunge_rate": 5,
    "z_step_size": 1,
    "cuts": [{
      "type": "screwpath",
      "points": [[0, 0]],
      "depth": -3,
      "shaft_diameter": 4,
      "cap_diameter": 2,
      "cap_depth": -1,
    }]
  };

  var expected = {
    "errors": [
      "screwpath cut must specify at least 2 'points'"
    ],
    "warnings": [],
    "gcode": [
      "G90",
      "G21",
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});
