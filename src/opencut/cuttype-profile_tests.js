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
      "G2 X1.375 Y1 I0 J-0.375 F10",
      "G2 X1 Y0.625 I-0.375 J0 F10",
      "G2 X0.625 Y1 I0 J0.375 F10",
      "G2 X1 Y1.375 I0.375 J0 F10",
      "G1 Z-0.125 F5",
      "G2 X1.375 Y1 I0 J-0.375 F10",
      "G2 X1 Y0.625 I-0.375 J0 F10",
      "G2 X0.625 Y1 I0 J0.375 F10",
      "G2 X1 Y1.375 I0.375 J0 F10",
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
      "G0 X-0.125 Y0 F10",
      "G1 Z-0.1 F5",
      "G1 X-0.125 Y1 F10",
      "G2 X0 Y1.125 I0.125 J0 F10",
      "G1 X1 Y1.125 F10",
      "G2 X1.125 Y1 I0 J-0.125 F10",
      "G1 X1.125 Y0 F10",
      "G2 X1 Y-0.125 I-0.125 J-0 F10",
      "G1 X0 Y-0.125 F10",
      "G2 X-0.125 Y0 I0 J0.125 F10",
      "G4 P0",
      "G1 Z-0.125 F5",
      "G1 X-0.125 Y1 F10",
      "G2 X0 Y1.125 I0.125 J0 F10",
      "G1 X1 Y1.125 F10",
      "G2 X1.125 Y1 I0 J-0.125 F10",
      "G1 X1.125 Y0 F10",
      "G2 X1 Y-0.125 I-0.125 J-0 F10",
      "G1 X0 Y-0.125 F10",
      "G2 X-0.125 Y0 I0 J0.125 F10",
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
      "G0 X-0.1118 Y0.0559 F10",
      "G1 Z-0.1 F5",
      "G1 X0.8882 Y2.0559 F10",
      "G2 X1.1118 Y2.0559 I0.1118 J-0.0559 F10",
      "G1 X2 Y0.27951 F10",
      "G1 X2.8882 Y2.0559 F10",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X-0.1118 Y0.0559 F10",
      "G1 Z-0.2 F5",
      "G1 X0.8882 Y2.0559 F10",
      "G2 X1.1118 Y2.0559 I0.1118 J-0.0559 F10",
      "G1 X2 Y0.27951 F10",
      "G1 X2.8882 Y2.0559 F10",
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
      "G1 X1 Y1.86025 F10",
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
      "G0 X11 Y10 F10",
      "G1 Z-0.1 F5",
      "G1 X11 Y6 F10",
      "G1 X19 Y6 F10",
      "G1 X19 Y10 F10",
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
