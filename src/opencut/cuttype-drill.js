/**
 * Generate the gcode for a drill cut. This type of cut will drill holes at the
 * prescribed points.
 */
window.opencut.registerCutType("drill", function generatePathCut(workspace, cut) {
  var warnings = [];
  var gcode = [];

  // Basic validations.
  if (cut.points === undefined || cut.points === null || cut.points.length === 0) {
    throw "drill cut does not have any 'points'";
  }
  if (cut.depth === undefined || typeof cut.depth != "number" || cut.depth >= 0) {
    throw "drill cut has an invalid 'depth'";
  }
  for (var j = 0; j < cut.points.length; j++) {
    if (cut.points[j].length != 2) {
      throw "drill cut expects [x,y] points: " + JSON.stringify(cut.points[j]);
    }
    if (typeof cut.points[j][0] != "number" ||
        typeof cut.points[j][1] != "number") {
      throw "drill cut expects numeric points: " + JSON.stringify(cut.points[j]);
    }
  }


  // up, over, down, repeat.
  gcode.push("G90");
  for (var i = 0; i < cut.points.length; i++) {
    gcode.push("G1 Z" + workspace.safety_height + " F" + workspace.z_rapid_rate);
    gcode.push("G4 P0");
    gcode.push("G0" +
        " X" + cut.points[i][0] +
        " Y" + cut.points[i][1] +
        " F" + workspace.feed_rate);

    // Perform peck drilling.
    var z = Math.max(0, cut.depth);
    var numZPasses = Math.ceil(-cut.depth / workspace.z_step_size);
    for (var k = 0; k < numZPasses; k++) {
      if (k > 0) {
        gcode.push("G1 Z" + z + " F" + workspace.z_rapid_rate);
      }
      if (z > 0) {
        z = Math.max(cut.depth, -workspace.z_step_size);
      } else {
        z = Math.max(cut.depth, z - workspace.z_step_size);
      }
      gcode.push("G1 Z" + z + " F" + workspace.plunge_rate);
      gcode.push("G1 Z0 F" + workspace.z_rapid_rate);
    }
  }

  // go back to the safety height at a rate consistent with out other holes.
  gcode.push("G1 Z" + workspace.safety_height + " F" + workspace.z_rapid_rate);
  gcode.push("G4 P0");

  return {
    "warnings": warnings,
    "gcode": gcode
  };
});
