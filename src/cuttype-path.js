/**
 * Generate the gcode for a path cut. This is a path which follows the specified
 * path with the center of the cutting bit.
 *
 * TODO: shapes
 */
window.opencut.registerCutType("path", function generatePathCut(workspace, cut) {
  var warnings = [];
  var gcode = [];

  if (cut.points === undefined || cut.points === null || cut.points.length === 0) {
    throw "path cut does not have any 'points'";
  }

  if (cut.depth === undefined || typeof cut.depth != "number" || cut.depth >= 0) {
    throw "path cut has an invalid 'depth'";
  }

  // Move up a bit to a safe height for rapid movement.
  gcode.push("G90");

  var z = workspace.safety_height;
  gcode.push("G0 Z" + z + " F" + workspace.plunge_rate);

  var numZPasses = Math.ceil(-cut.depth / workspace.z_step_size);
  for (var k = 0; k < numZPasses; k++) {
    for (var i = 0; i < cut.points.length; i++) {
      if (cut.points[i].length != 2) {
        warnings.push("invalid 2D point: " + JSON.stringify(cut.points[i]));
        gcode = [];
        break;
      }

      var x = cut.points[i][0];
      var y = cut.points[i][1];
      if (typeof x != "number" || typeof y != "number") {
        warnings.push("invalid numeric values: " + JSON.stringify(cut.points[i]));
        gcode = [];
        break;
      }

      // move to our destination (rapidly for initial positioning), then plunge.
      var cmd = (i === 0 && k === 0) ? "G0" : "G1"
      gcode.push(cmd + " X" + x + " Y" + y + " F" + workspace.feed_rate);
      if (i === 0) {
        gcode.push("G1 Z" + z + " F" + workspace.plunge_rate);
      }
    }

    // Bring the cutter up to a safe movement area.
    gcode.push("G0 Z" + workspace.safety_height + " F" + workspace.plunge_rate);

    // To speed things up, process the list in reverse for the next pass.
    cut.points = cut.points.reverse();

    // In the first pass, we just need to go to our starting point
    if (z <= cut.depth) {
      break;
    } else {
      z = Math.max(cut.depth, z - workspace.z_step_size);
    }
  }

  return {
    "warnings": warnings,
    "gcode": gcode
  };
});
