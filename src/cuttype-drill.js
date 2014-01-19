/**
 * Generate the gcode for a drill cut. This type of cut will drill holes at the
 * prescribed points.
 *
 * TODO: implement pecking
 */
window.opencut.registerCutType("drill", function generatePathCut(workspace, cut) {
  var warnings = [];
  var gcode = [];

  if (cut.points === undefined || cut.points === null || cut.points.length === 0) {
    throw "path cut does not have any 'points'";
  }

  if (cut.depth === undefined || typeof cut.depth != "number" || cut.depth >= 0) {
    throw "path cut has an invalid 'depth'";
  }

  gcode.push("G90");
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

    // up, over, down, repeat.
    gcode.push("G1 Z" + workspace.safety_height + " F" + workspace.plunge_rate);
    gcode.push("G0 X" + x + " Y" + y + " F" + workspace.feed_rate);
    gcode.push("G1 Z" + cut.depth + " F" + workspace.plunge_rate);
  }

  // go back to the safety height at a rate consistent with out other holes.
  gcode.push("G0 Z" + workspace.safety_height + " F" + workspace.plunge_rate);

  return {
    "warnings": warnings,
    "gcode": gcode
  };
});
