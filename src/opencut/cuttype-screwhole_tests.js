module("cuttype: screwhole");
test("common screwhole", function() {
  var job = {
    "units": "mm",
    "bit_diameter": 3,
    "feed_rate": 10,
    "plunge_rate": 5,
    "z_step_size": 1,
    "cuts": [{
      "type": "screwhole",
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
      "; begin cut: screwhole",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z5 F20",
      "G0 X10 Y1.5 F10",
      "G1 Z-1 F5",
      "G2 X11.5 Y0 I0 J-1.5 F10",
      "G2 X10 Y-1.5 I-1.5 J0 F10",
      "G2 X8.5 Y0 I0 J1.5 F10",
      "G2 X10 Y1.5 I1.5 J0 F10",
      "G1 Z5 F20",
      "G4 P0",
      "; end cut: profile",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z5 F20",
      "G0 X10 Y0.5 F10",
      "G1 Z-2 F5",
      "G2 X10.5 Y0 I0 J-0.5 F10",
      "G2 X10 Y-0.5 I-0.5 J0 F10",
      "G2 X9.5 Y0 I0 J0.5 F10",
      "G2 X10 Y0.5 I0.5 J0 F10",
      "G1 Z-3 F5",
      "G2 X10.5 Y0 I0 J-0.5 F10",
      "G2 X10 Y-0.5 I-0.5 J0 F10",
      "G2 X9.5 Y0 I0 J0.5 F10",
      "G2 X10 Y0.5 I0.5 J0 F10",
      "G1 Z5 F20",
      "G4 P0",
      "; end cut: profile",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z5 F20",
      "G0 X0 Y201.5 F10",
      "G1 Z-1 F5",
      "G2 X1.5 Y200 I0 J-1.5 F10",
      "G2 X0 Y198.5 I-1.5 J0 F10",
      "G2 X-1.5 Y200 I0 J1.5 F10",
      "G2 X0 Y201.5 I1.5 J0 F10",
      "G1 Z5 F20",
      "G4 P0",
      "; end cut: profile",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z5 F20",
      "G0 X0 Y200.5 F10",
      "G1 Z-2 F5",
      "G2 X0.5 Y200 I0 J-0.5 F10",
      "G2 X0 Y199.5 I-0.5 J0 F10",
      "G2 X-0.5 Y200 I0 J0.5 F10",
      "G2 X0 Y200.5 I0.5 J0 F10",
      "G1 Z-3 F5",
      "G2 X0.5 Y200 I0 J-0.5 F10",
      "G2 X0 Y199.5 I-0.5 J0 F10",
      "G2 X-0.5 Y200 I0 J0.5 F10",
      "G2 X0 Y200.5 I0.5 J0 F10",
      "G1 Z5 F20",
      "G4 P0",
      "; end cut: profile",
      "; end cut: screwhole"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("capless screwhole", function() {
  var job = {
    "units": "mm",
    "bit_diameter": 3,
    "feed_rate": 10,
    "plunge_rate": 5,
    "z_step_size": 1,
    "cuts": [{
      "type": "screwhole",
      "points": [[0, 0]],
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
      "; begin cut: screwhole",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z5 F20",
      "G0 X0 Y0.5 F10",
      "G1 Z-1 F5",
      "G2 X0.5 Y0 I0 J-0.5 F10",
      "G2 X0 Y-0.5 I-0.5 J0 F10",
      "G2 X-0.5 Y0 I0 J0.5 F10",
      "G2 X0 Y0.5 I0.5 J0 F10",
      "G1 Z-2 F5",
      "G2 X0.5 Y0 I0 J-0.5 F10",
      "G2 X0 Y-0.5 I-0.5 J0 F10",
      "G2 X-0.5 Y0 I0 J0.5 F10",
      "G2 X0 Y0.5 I0.5 J0 F10",
      "G1 Z-3 F5",
      "G2 X0.5 Y0 I0 J-0.5 F10",
      "G2 X0 Y-0.5 I-0.5 J0 F10",
      "G2 X-0.5 Y0 I0 J0.5 F10",
      "G2 X0 Y0.5 I0.5 J0 F10",
      "G1 Z5 F20",
      "G4 P0",
      "; end cut: profile",
      "; end cut: screwhole"
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
      "type": "screwhole",
      "points": [[0, 0]],
      "depth": -3,
      "shaft_diameter": 4,
      "cap_diameter": 2,
      "cap_depth": -1,
    }]
  };

  var expected = {
    "errors": [
      "screwhole 'cap_diameter' must be a number greater than the 'shaft_diameter'"
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
