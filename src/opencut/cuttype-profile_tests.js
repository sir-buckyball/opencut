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
      "G1 X1.125 Y1.125 F10",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 Z-0.125 F5",
      "G1 X1.125 Y1.125 F10",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 Z0 F5",
      "G1 Z0.25 F20",
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
      "G1 X1.125 Y1.125 F10",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.07322 Y1.67678 F10",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.42678 Y1.67678 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.42678 Y1.07322 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 X1.07322 Y1.07322 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 Z-0.125 F5",
      "G1 X1.125 Y1.125 F10",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.07322 Y1.67678 F10",
      "G1 X1.125 Y1.625 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.42678 Y1.67678 F10",
      "G1 X1.375 Y1.625 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.42678 Y1.07322 F10",
      "G1 X1.375 Y1.125 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 X1.07322 Y1.07322 F10",
      "G1 X1.125 Y1.125 F10",
      "G1 Z0 F5",
      "G1 Z0.25 F20",
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
      "G0 X0.875 Y0.875 F10",
      "G1 Z-0.1 F5",
      "G1 X0.875 Y0.875 F10",
      "G1 X0.875 Y1.875 F10",
      "G1 X1.625 Y1.875 F10",
      "G1 X1.625 Y0.875 F10",
      "G1 X0.875 Y0.875 F10",
      "G1 Z-0.125 F5",
      "G1 X0.875 Y0.875 F10",
      "G1 X0.875 Y1.875 F10",
      "G1 X1.625 Y1.875 F10",
      "G1 X1.625 Y0.875 F10",
      "G1 X0.875 Y0.875 F10",
      "G1 Z0 F5",
      "G1 Z0.25 F20",
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
      "G1 Z0 F5",
      "G1 Z0.25 F20",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("circle inside corner compensation", function() {
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
      "G1 Z0 F5",
      "G1 Z0.25 F20",
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
      "G1 Z0 F5",
      "G1 Z0.25 F20",
      "; end cut: profile"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});
