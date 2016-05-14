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
      "G1 F10",
      "G1 X2 Y3",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X0 Y0",
      "G1 Z-0.125 F5",
      "G1 F10",
      "G1 X2 Y3",
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
      "G1 F10",
      "G1 X0 Y1",
      "G1 X1 Y0",
      "G1 X0 Y0",
      "G4 P0",
      "G1 Z-0.15 F5",
      "G1 F10",
      "G1 X0 Y1",
      "G1 X1 Y0",
      "G1 X0 Y0",
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
      "G1 F10",
      "G1 X1 Y1",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X0 Y0",
      "G1 Z-0.2 F5",
      "G1 F10",
      "G1 X1 Y1",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: path",
      "",
      "; begin cut: path",
      "G90",
      "G1 Z0.25 F20",
      "G0 X2 Y2",
      "G1 Z-0.15 F5",
      "G1 F10",
      "G1 X3 Y3",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X2 Y2",
      "G1 Z-0.2 F5",
      "G1 F10",
      "G1 X3 Y3",
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
      "G1 F10",
      "G1 X1 Y1",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X0 Y0",
      "G1 Z-0.4 F5",
      "G1 F10",
      "G1 X1 Y1",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: path"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("path width", function() {
  var job = {
    "name": "test_job",
    "units": "mm",
    "bit_diameter": 2,
    "feed_rate": 100,
    "plunge_rate": 25,
    "z_step_size": 1,
    "cuts": [{
      "type": "path",
      "depth": -1,
      "width": 5,
      "points": [[0, 0], [100, 0], [100, 100]],
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G21",
      "",
      "; begin cut: path",
      "G90",
      "G1 Z5 F100",
      "G0 X0 Y0",
      "G1 Z-1 F25",
      "G1 F100",
      "G1 X100 Y0",
      "G1 X100 Y100",
      "G1 X99 Y100",
      "G1 X99 Y0",
      "G1 X100 Y1",
      "G1 X0 Y1",
      "G3 X-1 Y0 I0 J-1",
      "G3 X0 Y-1 I1 J0",
      "G1 X100 Y-1",
      "G3 X101 Y0 I0 J1",
      "G1 X101 Y100",
      "G3 X100 Y101 I-1 J0",
      "G3 X99 Y100 I0 J-1",
      "G1 X98.5 Y100",
      "G1 X98.5 Y0",
      "G1 X100 Y1.5",
      "G1 X0 Y1.5",
      "G3 X-1.5 Y0 I0 J-1.5",
      "G3 X0 Y-1.5 I1.5 J0",
      "G1 X100 Y-1.5",
      "G3 X101.5 Y0 I0 J1.5",
      "G1 X101.5 Y100",
      "G3 X100 Y101.5 I-1.5 J0",
      "G3 X98.5 Y100 I0 J-1.5",
      "G1 Z5 F100",
      "G4 P0",
      "; end cut: path"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("path width deep loop", function() {
  var job = {
    "name": "test_job",
    "units": "mm",
    "bit_diameter": 2,
    "feed_rate": 100,
    "plunge_rate": 25,
    "z_step_size": 1,
    "cuts": [{
      "type": "path",
      "depth": -2,
      "width": 4,
      "points": [[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]],
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G21",
      "",
      "; begin cut: path",
      "G90",
      "G1 Z5 F100",
      "G0 X0 Y0",
      "G1 Z-1 F25",
      "G1 F100",
      "G1 X100 Y0",
      "G1 X100 Y100",
      "G1 X0 Y100",
      "G1 X0 Y0",
      "G1 X1 Y0",
      "G1 X1 Y100",
      "G1 X0 Y99",
      "G1 X100 Y99",
      "G1 X99 Y100",
      "G1 X99 Y0",
      "G1 X100 Y1",
      "G1 X0 Y1",
      "G3 X-1 Y0 I0 J-1",
      "G3 X0 Y-1 I1 J0",
      "G1 X100 Y-1",
      "G3 X101 Y0 I0 J1",
      "G1 X101 Y100",
      "G3 X100 Y101 I-1 J0",
      "G1 X0 Y101",
      "G3 X-1 Y100 I0 J-1",
      "G1 X-1 Y0",
      "G3 X0 Y-1 I1 J0",
      "G3 X1 Y0 I0 J1",
      "G1 Z5 F100",
      "G4 P0",
      "G0 X0 Y0",
      "G1 Z-2 F25",
      "G1 F100",
      "G1 X100 Y0",
      "G1 X100 Y100",
      "G1 X0 Y100",
      "G1 X0 Y0",
      "G1 X1 Y0",
      "G1 X1 Y100",
      "G1 X0 Y99",
      "G1 X100 Y99",
      "G1 X99 Y100",
      "G1 X99 Y0",
      "G1 X100 Y1",
      "G1 X0 Y1",
      "G3 X-1 Y0 I0 J-1",
      "G3 X0 Y-1 I1 J0",
      "G1 X100 Y-1",
      "G3 X101 Y0 I0 J1",
      "G1 X101 Y100",
      "G3 X100 Y101 I-1 J0",
      "G1 X0 Y101",
      "G3 X-1 Y100 I0 J-1",
      "G1 X-1 Y0",
      "G3 X0 Y-1 I1 J0",
      "G3 X1 Y0 I0 J1",
      "G1 Z5 F100",
      "G4 P0",
      "; end cut: path"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});


test("short vertical path", function() {
  var job = {
    "units": "inch",
    "bit_diameter": 0.125,
    "feed_rate": 100,
    "plunge_rate": 10,
    "z_step_size": 1,
    "cuts": [{
      "type": "path",
      "depth": -1,
      "width": 0.425,
      "points": [[0.25, 0.25], [0.25, 1.75]],
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
      "G1 Z0.25 F40",
      "G0 X0.25 Y0.25",
      "G1 Z-1 F10",
      "G1 F100",
      "G1 X0.25 Y1.75",
      "G1 X0.1875 Y1.75",
      "G1 X0.1875 Y0.25",
      "G3 X0.25 Y0.1875 I0.0625 J0",
      "G3 X0.3125 Y0.25 I0 J0.0625",
      "G1 X0.3125 Y1.75",
      "G3 X0.25 Y1.8125 I-0.0625 J0",
      "G3 X0.1875 Y1.75 I0 J-0.0625",
      "G1 X0.125 Y1.75",
      "G1 X0.125 Y0.25",
      "G3 X0.25 Y0.125 I0.125 J0",
      "G3 X0.375 Y0.25 I0 J0.125",
      "G1 X0.375 Y1.75",
      "G3 X0.25 Y1.875 I-0.125 J0",
      "G3 X0.125 Y1.75 I0 J-0.125",
      "G1 X0.1 Y1.75",
      "G1 X0.1 Y0.25",
      "G3 X0.25 Y0.1 I0.15 J0",
      "G3 X0.4 Y0.25 I0 J0.15",
      "G1 X0.4 Y1.75",
      "G3 X0.25 Y1.9 I-0.15 J0",
      "G3 X0.1 Y1.75 I0 J-0.15",
      "G1 Z0.25 F40",
      "G4 P0",
      "; end cut: path"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});
