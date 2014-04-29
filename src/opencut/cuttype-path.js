/**
 * Generate the gcode for a path cut. This is a path which follows the specified
 * path with the center of the cutting bit.
 *
 * TODO: shapes
 */
window.opencut.registerCutType("path", function generatePathCut(workspace, cut) {
  var warnings = [];
  var gcode = [];

  // Validate the requested cut.
  if (cut.points === undefined || cut.points === null || cut.points.length === 0) {
    throw "path cut does not have any 'points'";
  }
  if (cut.depth === undefined || typeof cut.depth != "number" || cut.depth >= 0) {
    throw "path cut has an invalid 'depth'";
  }
  for (var i = 0; i < cut.points.length; i++) {
    if (cut.points[i].length != 2) {
      throw "path cut expects [x,y] coordinate points: " + JSON.stringify(cut.points[i]);
    }
    if (typeof cut.points[i][0] != "number" ||
        typeof cut.points[i][1] != "number") {
      throw "path cut points must be numbers: "  + JSON.stringify(cut.points[i]);
    }
  }

  // We should join the ends if the first and last points are the same.
  var joinEnds = (cut.points.length > 2 &&
      cut.points[0][0] == cut.points[cut.points.length - 1][0] &&
      cut.points[0][1] == cut.points[cut.points.length - 1][1]);

  gcode.push("G90");

  // Stay safe.
  var z = workspace.safety_height;
  gcode.push("G1 Z" + z + " F" + workspace.z_rapid_rate);

  // Cut the paths.
  var numZPasses = Math.ceil(-cut.depth / workspace.z_step_size);
  for (var k = 0; k < numZPasses; k++) {
    // Rapid move over to the starting point.
    if (k == 0 || !joinEnds) {
      gcode.push("G0 X" + cut.points[0][0] + " Y" + cut.points[0][1]);
    }

    // Decide how far down to drop and plunge.
    if (z > 0) {
      z = Math.max(cut.depth, -workspace.z_step_size);
    } else {
      z = Math.max(cut.depth, z - workspace.z_step_size);
    }
    gcode.push("G1 Z" + z + " F" + workspace.plunge_rate);

    // Cut the path. We are alreay at the starting point.
    for (var j = 1; j < cut.points.length; j++) {
      gcode.push("G1" +
          " X" + cut.points[j][0] +
          " Y" + cut.points[j][1] +
          " F" + workspace.feed_rate);
    }

    // Bring the cutter up to a safe movement area.
    if (!joinEnds || k == numZPasses - 1) {
      gcode.push("G1 Z" + workspace.safety_height + " F" + workspace.z_rapid_rate);
    }
    gcode.push("G4 P0");
  }

  return {
    "warnings": warnings,
    "gcode": gcode
  };
});
