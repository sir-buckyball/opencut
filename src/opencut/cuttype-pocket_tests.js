module("cuttype: pocket");

test("rectangle", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "pocket",
      "depth": -0.125,
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
      "; begin cut: pocket",
      "G90",
      "G1 Z0.25 F20",
      "G0 X1.125 Y1.125 F10",
      "G90",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X1.25 Y1.25 F10",
      "G1 Z0.1 F20",
      "G1 Z-0.1 F5",
      "G1 X1.25 Y1.5 F10",
      "G91",
      "G1 X0.125",
      "G1 Y-0.375",
      "G1 X-0.25",
      "G1 Y0.5",
      "G1 X0.25",
      "G90",
      "G1 X1.375 Y1.625",
      "G1 X1.375 Y1.125",
      "G1 X1.125 Y1.125",
      "G1 X1.125 Y1.625",
      "G1 X1.375 Y1.625",
      "G90",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X1.25 Y1.25 F10",
      "G1 Z0.075 F20",
      "G1 Z-0.125 F5",
      "G1 X1.25 Y1.5 F10",
      "G91",
      "G1 X0.125",
      "G1 Y-0.375",
      "G1 X-0.25",
      "G1 Y0.5",
      "G1 X0.25",
      "G90",
      "G1 X1.375 Y1.625",
      "G1 X1.375 Y1.125",
      "G1 X1.125 Y1.125",
      "G1 X1.125 Y1.625",
      "G1 X1.375 Y1.625",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: pocket"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("rectangle corner compensation", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "pocket",
      "depth": -0.125,
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
      "; begin cut: pocket",
      "G90",
      "G1 Z0.25 F20",
      "G0 X1.125 Y1.125 F10",
      "G90",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X1.25 Y1.25 F10",
      "G1 Z0.1 F20",
      "G1 Z-0.1 F5",
      "G1 X1.25 Y1.5 F10",
      "G91",
      "G1 X0.125",
      "G1 Y-0.375",
      "G1 X-0.25",
      "G1 Y0.5",
      "G1 X0.25",
      "G90",
      "G1 X1.375 Y1.625",
      "G1 X1.375 Y1.125",
      "G1 X1.41161 Y1.08839",
      "G1 X1.375 Y1.125",
      "G1 X1.125 Y1.125",
      "G1 X1.08839 Y1.08839",
      "G1 X1.125 Y1.125",
      "G1 X1.125 Y1.625",
      "G1 X1.08839 Y1.66161",
      "G1 X1.125 Y1.625",
      "G1 X1.375 Y1.625",
      "G1 X1.41161 Y1.66161",
      "G1 X1.375 Y1.625",
      "G90",
      "G1 Z0.25 F20",
      "G4 P0",
      "G0 X1.25 Y1.25 F10",
      "G1 Z0.075 F20",
      "G1 Z-0.125 F5",
      "G1 X1.25 Y1.5 F10",
      "G91",
      "G1 X0.125",
      "G1 Y-0.375",
      "G1 X-0.25",
      "G1 Y0.5",
      "G1 X0.25",
      "G90",
      "G1 X1.375 Y1.625",
      "G1 X1.375 Y1.125",
      "G1 X1.41161 Y1.08839",
      "G1 X1.375 Y1.125",
      "G1 X1.125 Y1.125",
      "G1 X1.08839 Y1.08839",
      "G1 X1.125 Y1.125",
      "G1 X1.125 Y1.625",
      "G1 X1.08839 Y1.66161",
      "G1 X1.125 Y1.625",
      "G1 X1.375 Y1.625",
      "G1 X1.41161 Y1.66161",
      "G1 X1.375 Y1.625",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: pocket"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});

test("circle", function() {
  var job = {
    "name": "test_job",
    "units": "inch",
    "bit_diameter": 0.25,
    "feed_rate": 10,
    "plunge_rate": 5,
    "safety_height": 0,
    "z_step_size": 0.1,
    "cuts": [{
      "type": "pocket",
      "depth": -0.125,
      "shape": {
        "type": "circle",
        "center": [1, 1],
        "radius": 0.5
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
      "; begin cut: pocket",
      "G90",
      "G1 Z0.25 F20",
      "G0 X1 Y1 F10",
      "G1 X1 Y1 Z0.1 F10",
      "G4 P0",
      "G1 Z-0.1 F5",
      "G1 X1 Y1.125 F10",
      "G2 X1.125 Y1 I0 J-0.125",
      "G2 X1 Y0.875 I-0.125 J0",
      "G2 X0.875 Y1 I0 J0.125",
      "G2 X1 Y1.125 I0.125 J0",
      "G1 X1 Y1.25 F10",
      "G2 X1.25 Y1 I0 J-0.25",
      "G2 X1 Y0.75 I-0.25 J0",
      "G2 X0.75 Y1 I0 J0.25",
      "G2 X1 Y1.25 I0.25 J0",
      "G1 X1 Y1.375 F10",
      "G2 X1.375 Y1 I0 J-0.375",
      "G2 X1 Y0.625 I-0.375 J0",
      "G2 X0.625 Y1 I0 J0.375",
      "G2 X1 Y1.375 I0.375 J0",
      "G1 X1 Y1 Z0.075 F10",
      "G4 P0",
      "G1 Z-0.125 F5",
      "G1 X1 Y1.125 F10",
      "G2 X1.125 Y1 I0 J-0.125",
      "G2 X1 Y0.875 I-0.125 J0",
      "G2 X0.875 Y1 I0 J0.125",
      "G2 X1 Y1.125 I0.125 J0",
      "G1 X1 Y1.25 F10",
      "G2 X1.25 Y1 I0 J-0.25",
      "G2 X1 Y0.75 I-0.25 J0",
      "G2 X0.75 Y1 I0 J0.25",
      "G2 X1 Y1.25 I0.25 J0",
      "G1 X1 Y1.375 F10",
      "G2 X1.375 Y1 I0 J-0.375",
      "G2 X1 Y0.625 I-0.375 J0",
      "G2 X0.625 Y1 I0 J0.375",
      "G2 X1 Y1.375 I0.375 J0",
      "G1 Z0.25 F20",
      "G4 P0",
      "; end cut: pocket"
    ]
  };

  var results = window.opencut.toGCode(job);
  deepEqual(results, expected);
});
