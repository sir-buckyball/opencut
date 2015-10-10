/**
 * Generate the gcode for a drill cut. This type of cut will drill holes at the
 * prescribed points.
 */
window.opencut.registerCutType("screwhole", function generatePathCut(workspace, cut) {
  var warnings = [];
  var errors = [];
  var gcode = [];

  // validations
  if (cut.points === undefined || cut.points === null || cut.points.length === 0) {
    throw "screwhole cut does not have any 'points'";
  }
  if (cut.depth === undefined || typeof cut.depth != "number" || cut.depth >= 0) {
    throw "screwhole cut has an invalid 'depth'";
  }
  if (cut.shaft_diameter === undefined || typeof cut.shaft_diameter != "number" || cut.shaft_diameter <= 0) {
    throw "screwhole 'shaft_diameter' must be a number greater than 0";
  }
  if (cut.cap_depth === undefined) {
    cut.cap_depth = 0;
  } else if (typeof cut.cap_depth != "number" || cut.cap_depth > 0) {
    throw "screwhole cut has an invalid 'cap_depth'";
  } else if (cut.cap_depth <= cut.depth) {
    throw "screwhole 'cap_depth' must be greater than 'depth'";
  }
  if (cut.cap_diameter !== undefined) {
    if (typeof cut.cap_diameter != "number" || cut.cap_diameter <= 0) {
      throw "screwhole 'cap_diameter' must be a number greater than 0";
    }
    if (cut.cap_diameter < cut.shaft_diameter) {
      throw "screwhole 'cap_diameter' must be a number greater than the 'shaft_diameter'";
    }
  }

  for (var j = 0; j < cut.points.length; j++) {
    if (cut.points[j].length != 2) {
      throw "screwhole cut expects [x,y] points: " + JSON.stringify(cut.points[j]);
    }
    if (typeof cut.points[j][0] != "number" ||
        typeof cut.points[j][1] != "number") {
      throw "screwhole cut expects numeric points: " + JSON.stringify(cut.points[j]);
    }
  }

  for (var i = 0; i < cut.points.length; i++) {
    if (cut.cap_diameter !== undefined) {
      var capCut = {
        "type": "profile",
        "side": "inside",
        "depth": cut.cap_depth,
        "shape": {
          "type": "circle",
          "center": cut.points[i],
          "radius": cut.cap_diameter / 2,
        },
      };
      var capCutGcode = workspace.gcodeForCut(workspace, capCut);
      warnings = warnings.concat(capCutGcode.warnings);
      errors = errors.concat(capCutGcode.errors);
      gcode = gcode.concat(capCutGcode.gcode);
    }

    var shaftCut = {
      "type": "profile",
      "side": "inside",
      "depth": cut.depth,
      "z_step_size": workspace.z_step_size,
      "z_top": cut.cap_depth,
      "shape": {
        "type": "circle",
        "center": cut.points[i],
        "radius": cut.shaft_diameter / 2,
      },
    };
    var shaftCutGcode = workspace.gcodeForCut(workspace, shaftCut);
    warnings = warnings.concat(shaftCutGcode.warnings);
    errors = errors.concat(shaftCutGcode.errors);
    gcode = gcode.concat(shaftCutGcode.gcode);
  }

  return {
    "warnings": warnings,
    "errors": errors,
    "gcode": gcode
  };
});
