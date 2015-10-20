/*global deepEqual*/

module("cuttype: profile");

test("rectangle inside", function() {
  var job = {
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
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X1.125 Y1.125 F10",
      "G1 Z-0.1 F5",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.125 Y1.125 F10",
      "G4 P0",
      "G1 Z-0.125 F5",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
  ]};

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("rectangle inside corner compensation", function() {
  var job = {
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
      "corner_compensation": true,
      "shape": {
        "type": "rectangle",
        "origin": [1, 1],
        "size": [0.5, 0.75]
      }
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X1.125 Y1.125 F10",
      "G1 Z-0.1 F5",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.08839 Y1.66161 F10",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.41161 Y1.66161 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.41161 Y1.08839 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 X1.08839 Y1.08839 F10",
      "G1 X1.125 Y1.125 F10",
      "G4 P0",
      "G1 Z-0.125 F5",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.08839 Y1.66161 F10",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.41161 Y1.66161 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.41161 Y1.08839 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 X1.08839 Y1.08839 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("rectangle outside", function() {
  var job = {
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
      "side": "outside",
      "shape": {
        "type": "rectangle",
        "origin": [1, 1],
        "size": [0.5, 0.75]
      }
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X1 Y0.875 F10",
      "G1 Z-0.1 F5",
      "G1 X1.5 Y0.875 F10",
      "G3 X1.625 Y1 I0 J0.125 F10",
      "G1 X1.625 Y1.75 F10",
      "G3 X1.5 Y1.875 I-0.125 J0 F10",
      "G1 X1 Y1.875 F10",
      "G3 X0.875 Y1.75 I0 J-0.125 F10",
      "G1 X0.875 Y1 F10",
      "G3 X1 Y0.875 I0.125 J0 F10",
      "G4 P0",
      "G1 Z-0.125 F5",
      "G1 X1.5 Y0.875 F10",
      "G3 X1.625 Y1 I0 J0.125 F10",
      "G1 X1.625 Y1.75 F10",
      "G3 X1.5 Y1.875 I-0.125 J0 F10",
      "G1 X1 Y1.875 F10",
      "G3 X0.875 Y1.75 I0 J-0.125 F10",
      "G1 X0.875 Y1 F10",
      "G3 X1 Y0.875 I0.125 J0 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("circle inside", function() {
  var job = {
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
        "type": "circle",
        "center": [1, 1],
        "radius": 0.25
      }
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X1 Y1.125 F10",
      "G1 Z-0.1 F5",
      "G2 X1.125 Y1 I0 J-0.125 F10",
      "G2 X1 Y0.875 I-0.125 J0 F10",
      "G2 X0.875 Y1 I0 J0.125 F10",
      "G2 X1 Y1.125 I0.125 J0 F10",
      "G1 Z-0.125 F5",
      "G2 X1.125 Y1 I0 J-0.125 F10",
      "G2 X1 Y0.875 I-0.125 J0 F10",
      "G2 X0.875 Y1 I0 J0.125 F10",
      "G2 X1 Y1.125 I0.125 J0 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("tiny circle inside", function() {
  var job = {
    "name": "test_job",
    "units": "mm",
    "bit_diameter": 3,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 2,
    "z_step_size": 1,
    "cuts": [{
    "type": "profile",
      "depth": -2,
      "side": "inside",
      "shape": {
        "type": "circle",
        "center": [0, 0],
        "radius": 1.5
      }
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G21",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z2 F20",
      "G0 X0 Y0 F10",
      "G1 Z-1 F5",
      "G1 Z0 F20",
      "G1 Z-2 F5",
      "G1 Z0 F20",
      "G1 Z2 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("circle outside", function() {
  var job = {
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
      "side": "outside",
      "shape": {
        "type": "circle",
        "center": [1, 1],
        "radius": 0.25
      }
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X1 Y1.375 F10",
      "G1 Z-0.1 F5",
      "G3 X0.625 Y1 I0 J-0.375 F10",
      "G3 X1 Y0.625 I0.375 J0 F10",
      "G3 X1.375 Y1 I0 J0.375 F10",
      "G3 X1 Y1.375 I-0.375 J0 F10",
      "G1 Z-0.125 F5",
      "G3 X0.625 Y1 I0 J-0.375 F10",
      "G3 X1 Y0.625 I0.375 J0 F10",
      "G3 X1.375 Y1 I0 J0.375 F10",
      "G3 X1 Y1.375 I-0.375 J0 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("points loop outside", function() {
  var job = {
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
      "side": "outside",
      "points": [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X0 Y-0.125 F10",
      "G1 Z-0.1 F5",
      "G1 X1 Y-0.125 F10",
      "G3 X1.125 Y0 I0 J0.125 F10",
      "G1 X1.125 Y1 F10",
      "G3 X1 Y1.125 I-0.125 J0 F10",
      "G1 X0 Y1.125 F10",
      "G3 X-0.125 Y1 I0 J-0.125 F10",
      "G1 X-0.125 Y0 F10",
      "G3 X0 Y-0.125 I0.125 J0 F10",
      "G4 P0",
      "G1 Z-0.125 F5",
      "G1 X1 Y-0.125 F10",
      "G3 X1.125 Y0 I0 J0.125 F10",
      "G1 X1.125 Y1 F10",
      "G3 X1 Y1.125 I-0.125 J0 F10",
      "G1 X0 Y1.125 F10",
      "G3 X-0.125 Y1 I0 J-0.125 F10",
      "G1 X-0.125 Y0 F10",
      "G3 X0 Y-0.125 I0.125 J0 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("points loop inside", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "profile",
      "depth": -0.15,
      "side": "inside",
      "points": [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X0.125 Y0.125 F10",
      "G1 Z-0.1 F5",
      "G1 X0.125 Y0.875 F10",
      "G1 X0.875 Y0.875 F10",
      "G1 X0.875 Y0.125 F10",
      "G1 X0.125 Y0.125 F10",
      "G4 P0",
      "G1 Z-0.15 F5",
      "G1 X0.125 Y0.875 F10",
      "G1 X0.875 Y0.875 F10",
      "G1 X0.875 Y0.125 F10",
      "G1 X0.125 Y0.125 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("points S outside", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "profile",
      "depth": -0.2,
      "side": "outside",
      "points": [[0, 0], [1, 2], [2, 0], [3, 2]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X2.8882 Y2.0559 F10",
      "G1 Z-0.1 F5",
      // verified by hand as Y0.279508497187
      "G1 X2 Y0.27951 F10",
      "G1 X1.1118 Y2.0559 F10",
      "G3 X0.8882 Y2.0559 I-0.1118 J-0.0559 F10",
      "G1 X-0.1118 Y0.0559 F10",
      "G1 Z0.25 F20",


      "G4 P0",
      "G0 X2.8882 Y2.0559 F10",
      "G1 Z-0.2 F5",
      "G1 X2 Y0.27951 F10",
      "G1 X1.1118 Y2.0559 F10",
      "G3 X0.8882 Y2.0559 I-0.1118 J-0.0559 F10",
      "G1 X-0.1118 Y0.0559 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("points S inside", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "profile",
      "depth": -0.1,
      "side": "inside",
      "points": [[0, 0], [1, 2], [2, 0], [3, 2]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X0.1118 Y-0.0559 F10",
      "G1 Z-0.1 F5",
      "G1 X1 Y1.72049 F10",
      "G1 X1.8882 Y-0.0559 F10",
      "G3 X2.1118 Y-0.0559 I0.1118 J0.0559 F10",
      "G1 X3.1118 Y1.9441 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("points U outside cuts inside", function() {
  var job = {
    "name": "test_job",
    "units": "mm",
    "bit_diameter": 2,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "profile",
      "depth": -0.1,
      "side": "outside",
      "points": [[10, 10], [10, 5], [20, 5], [20, 10]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G21",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z5 F20",
      "G0 X19 Y10 F10",
      "G1 Z-0.1 F5",
      "G1 X19 Y6 F10",
      "G1 X11 Y6 F10",
      "G1 X11 Y10 F10",
      "G1 Z5 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("points inside corner compensation", function() {
  var job = {
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
      "corner_compensation": true,
      "points": [[1, 1], [1, 1.75], [1.5, 1.75], [1.5, 1], [1, 1]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X1.125 Y1.125 F10",
      "G1 Z-0.1 F5",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.08839 Y1.66161 F10",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.41161 Y1.66161 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.41161 Y1.08839 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 X1.08839 Y1.08839 F10",
      "G1 X1.125 Y1.125 F10",
      "G4 P0",
      "G1 Z-0.125 F5",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.08839 Y1.66161 F10",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.41161 Y1.66161 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.41161 Y1.08839 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 X1.08839 Y1.08839 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("points triangle outside", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "profile",
      "depth": -0.1,
      "side": "outside",
      "points": [[0, 0], [2, 1], [4, 0]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X4.0559 Y0.1118 F10",
      "G1 Z-0.1 F5",
      "G1 X2.0559 Y1.1118 F10",
      "G3 X1.9441 Y1.1118 I-0.0559 J-0.1118 F10",
      "G1 X-0.0559 Y0.1118 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("points triangle inside", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "profile",
      "depth": -0.1,
      "side": "inside",
      "points": [[0, 0], [2, 1], [4, 0], [0, 0]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X0.52951 Y0.125 F10",
      "G1 Z-0.1 F5",
      "G1 X2 Y0.86025 F10",
      "G1 X3.47049 Y0.125 F10",
      "G1 X0.52951 Y0.125 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("points 3 point line outside", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "profile",
      "depth": -0.1,
      "side": "outside",
      "points": [[0, 0], [2, 0], [4, 0]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X4 Y0.125 F10",
      "G1 Z-0.1 F5",
      "G1 X2 Y0.125 F10",
      "G1 X0 Y0.125 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("points 3 point line inside", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "profile",
      "depth": -0.1,
      "side": "inside",
      "points": [[4, 0], [2, 0], [0, 0]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X4 Y0.125 F10",
      "G1 Z-0.1 F5",
      "G1 X2 Y0.125 F10",
      "G1 X0 Y0.125 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("points z-step override", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "profile",
      "depth": -0.2,
      "side": "inside",
      "points": [[0, 0], [1, 1]]
    }, {
      "type": "profile",
      "depth": -0.2,
      "side": "inside",
      "points": [[2, 2], [3, 3]],
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
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X0.08839 Y-0.08839 F10",
      "G1 Z-0.1 F5",
      "G1 X1.08839 Y0.91161 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X0.08839 Y-0.08839 F10",
      "G1 Z-0.2 F5",
      "G1 X1.08839 Y0.91161 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X2.08839 Y1.91161 F10",
      "G1 Z-0.15 F5",
      "G1 X3.08839 Y2.91161 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X2.08839 Y1.91161 F10",
      "G1 Z-0.2 F5",
      "G1 X3.08839 Y2.91161 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("circle z-step override", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
    "type": "profile",
      "depth": -0.2,
      "side": "outside",
      "shape": {
        "type": "circle",
        "center": [0, 0],
        "radius": 0.25
      }
    }, {
    "type": "profile",
      "depth": -0.2,
      "side": "outside",
      "shape": {
        "type": "circle",
        "center": [1, 1],
        "radius": 0.25
      },
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
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X0 Y0.375 F10",
      "G1 Z-0.1 F5",
      "G3 X-0.375 Y0 I0 J-0.375 F10",
      "G3 X0 Y-0.375 I0.375 J0 F10",
      "G3 X0.375 Y0 I0 J0.375 F10",
      "G3 X0 Y0.375 I-0.375 J0 F10",
      "G1 Z-0.2 F5",
      "G3 X-0.375 Y0 I0 J-0.375 F10",
      "G3 X0 Y-0.375 I0.375 J0 F10",
      "G3 X0.375 Y0 I0 J0.375 F10",
      "G3 X0 Y0.375 I-0.375 J0 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X1 Y1.375 F10",
      "G1 Z-0.15 F5",
      "G3 X0.625 Y1 I0 J-0.375 F10",
      "G3 X1 Y0.625 I0.375 J0 F10",
      "G3 X1.375 Y1 I0 J0.375 F10",
      "G3 X1 Y1.375 I-0.375 J0 F10",
      "G1 Z-0.2 F5",
      "G3 X0.625 Y1 I0 J-0.375 F10",
      "G3 X1 Y0.625 I0.375 J0 F10",
      "G3 X1.375 Y1 I0 J0.375 F10",
      "G3 X1 Y1.375 I-0.375 J0 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("rectangle z-top", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "profile",
      "depth": -0.4,
      "side": "inside",
      "shape": {
        "type": "rectangle",
        "origin": [1, 1],
        "size": [0.5, 0.75]
      },
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
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X1.125 Y1.125 F10",
      "G1 Z-0.3 F5",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.125 Y1.125 F10",
      "G4 P0",
      "G1 Z-0.4 F5",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
  ]};

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("circle inside", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
    "type": "profile",
      "depth": -0.4,
      "side": "inside",
      "shape": {
        "type": "circle",
        "center": [1, 1],
        "radius": 0.25
      },
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
      "; begin cut: profile",
      "G90",
      "G1 Z0.25 F20",
      "G0 X1 Y1.125 F10",
      "G1 Z-0.3 F5",
      "G2 X1.125 Y1 I0 J-0.125 F10",
      "G2 X1 Y0.875 I-0.125 J0 F10",
      "G2 X0.875 Y1 I0 J0.125 F10",
      "G2 X1 Y1.125 I0.125 J0 F10",
      "G1 Z-0.4 F5",
      "G2 X1.125 Y1 I0 J-0.125 F10",
      "G2 X1 Y0.875 I-0.125 J0 F10",
      "G2 X0.875 Y1 I0 J0.125 F10",
      "G2 X1 Y1.125 I0.125 J0 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("outside corner radius", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 2,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 1,
    "z_step_size": 1,
    "cuts": [{
      "type": "profile",
      "depth": -1,
      "side": "outside",
      "corner_radius": 2,
      "points": [[0, 0], [0, 10], [10, 10], [20, 0], [10, 0]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z1 F20",
      "G0 X10 Y-1 F10",
      "G1 Z-1 F5",
      "G1 X15.17157 Y-1 F10",
      "G3 X17.29289 Y4.12132 I0 J3 F10",
      "G1 X11.29289 Y10.12132 F10",
      "G3 X9.17157 Y11 I-2.12132 J-2.12132 F10",
      "G1 X2 Y11 F10",
      "G3 X-1 Y8 I0 J-3 F10",
      "G1 X-1 Y0 F10",
      "G1 Z1 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("inside corner radius", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 2,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 1,
    "z_step_size": 1,
    "cuts": [{
      "type": "profile",
      "depth": -1,
      "side": "inside",
      "corner_radius": 2,
      "points": [[0, 0], [0, 10], [10, 10], [20, 0], [10, 0], [0, 0]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z1 F20",
      "G0 X1 Y2 F10",
      "G1 Z-1 F5",
      "G1 X1 Y8 F10",
      "G2 X2 Y9 I1 J0 F10",
      "G1 X9.17157 Y9 F10",
      "G2 X9.87868 Y8.70711 I0 J-1 F10",
      "G1 X15.87868 Y2.70711 F10",
      "G2 X15.17157 Y1 I-0.70711 J-0.70711 F10",
      "G1 X10 Y1 F10",
      "G1 X2 Y1 F10",
      "G2 X1 Y2 I0 J1 F10",
      "G1 Z1 F20",
      "G4 P0",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("inside corner radius too small", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 2,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 1,
    "z_step_size": 1,
    "cuts": [{
      "type": "profile",
      "depth": -1,
      "side": "outside",
      "corner_radius": 20,
      "points": [[0, 0], [0, 10], [10, 10]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": ["corner_radius too big for point segment"],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "; end cut: profile"
    ]};

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("corner_radius with corner_compensation", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 2,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 1,
    "z_step_size": 1,
    "cuts": [{
      "type": "profile",
      "depth": -1,
      "side": "inside",
      "corner_compensation": true,
      "corner_radius": 2,
      "points": [[0, 0], [0, 10], [10, 10], [20, 10]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "; end cut: profile"
    ]};

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("non-axial corner_radius", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 2,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 1,
    "z_step_size": 1,
    "cuts": [{
      "type": "profile",
      "depth": -1,
      "side": "inside",
      "corner_radius": 2,
      "points": [[0, 10], [10, 20], [20, 0], [0, 10]]
    }, {
      "type": "profile",
      "depth": -1,
      "side": "outside",
      "corner_radius": 2,
      "points": [[0, 10], [10, 20], [20, 0], [0, 10]]
    }]
  };

  var expected = {
    "errors": [],
    "warnings": [],
    "gcode": [
      "G90",
      "G20",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z1 F20",
      "G0 X2.66922 Y11.25501 F10",
      "G1 Z-1 F5",
      "G1 X8.74499 Y17.33078 F10",
      "G2 X10.34652 Y17.07088 I0.70711 J-0.70711 F10",
      "G1 X16.42229 Y4.91935 F10",
      "G2 X15.08065 Y3.57771 I-0.89443 J-0.44721 F10",
      "G1 X2.92912 Y9.65348 F10",
      "G2 X2.66922 Y11.25501 I0.44721 J0.89443 F10",
      "G1 Z1 F20",
      "G4 P0",
      "; end cut: profile",
      "",
      "; begin cut: profile",
      "G90",
      "G1 Z1 F20",
      "G0 X2.03469 Y7.86462 F10",
      "G1 Z-1 F5",
      "G1 X14.18622 Y1.78885 F10",
      "G3 X18.21115 Y5.81378 I1.34164 J2.68328 F10",
      "G1 X12.13538 Y17.96531 F10",
      "G3 X7.33078 Y18.74499 I-2.68328 J-1.34164 F10",
      "G1 X1.25501 Y12.66922 F10",
      "G3 X2.03469 Y7.86462 I2.12132 J-2.12132 F10",
      "G1 Z1 F20",
      "G4 P0",
      "; end cut: profile",
    ]};

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});
