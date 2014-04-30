/**
 * Generate the gcode for a profile cut. This is a path which follows the
 * specified path taking the bit size into account. A profile cut specifies
 * which side of the path it should be on.
 *
 * IMPORTANT: paths for profiles are assumed to be closed (eg, the first and
 * last point will be connected). Additionally paths are assumed to be defined
 * in a clockwise order for the purposes of inside/outside-ness.
 *
 * Since bits are round, a perfect inside square cut is not possible. The
 * options are to have a rounded corner excluding the specified corner, or to
 * cut into the edge a bit more so the corner of the path is included.
 *
 * TODO: more shapes (rounded rectangles, polygons)
 * TODO: arbitrary paths
 */
(function() {
  /**
   * Cutting function for rectangular shapes.
   */
  var doRectangleCut = function(workspace, cut) {
    // Check required parameters.
    if (cut.shape.origin === undefined || cut.shape.origin === null) {
      throw "profile rectangle 'origin' not defined";
    } else if (cut.shape.origin.length != 2) {
      throw "profile rectangle 'origin' expected to be 2 coordinates";
    }

    if (cut.shape.size === undefined || cut.shape.size === null) {
      throw "profile square 'size' not defined";
    } else if (cut.shape.size.length != 2) {
      throw "profile square 'size' expected to be 2 numbers";
    }

    var x = cut.shape.origin[0];
    var y = cut.shape.origin[1];
    var width = cut.shape.size[0];
    var height = cut.shape.size[1];

    // Validate required parameters.
    if (typeof x != "number" || typeof y != "number") {
      throw "profile rectangle origin not a numbers";
    } else if (typeof width != "number" || typeof height != "number") {
      throw "profile rectangle size not a numbers";
    } else if (width <= 0) {
      throw "profile rectangle width must be a positive number";
    } else if (height <= 0) {
      throw "profile rectangle height must be a positive number";
    }

    // Delegate to the points cut.
    delete cut.shape;
    cut.points = [
      [x, y],
      [x, y + height],
      [x + width, y + height],
      [x + width, y],
      [x, y]];

    // Outside profile cuts are best done counter-clockwise.
    if (cut.side == "outside") {
      cut.points.reverse();
      cut.side = "inside";
    }

    return doPointsCut(workspace, cut);
  };

  /**
   * Perform a profile cut for a circular shapes.
   */
  var doCircleCut = function(workspace, cut) {
    var warnings = [];
    var gcode = [];

    // Check required parameters.
    if (cut.shape.center === undefined || cut.shape.center === null) {
      throw "circle profile cuts must define a center";
    } else if (cut.shape.center.length != 2) {
      throw "circle center expected to be 2 numbers";
    } else if (cut.shape.radius === undefined || cut.shape.radius === null) {
      throw "circle radius not defined";
    } else if (typeof cut.shape.radius != "number") {
      throw "circle radius not a number";
    } else if (cut.shape.radius <= 0) {
      throw "circle radius must be greater that 0";
    }

    var x = cut.shape.center[0];
    var y = cut.shape.center[1];
    if (typeof x != "number" || typeof y != "number") {
      throw "circle center must be 2 numbers";
    }

    // Adjust the radius by the bit diameter according to the side of the cut.
    var r = cut.shape.radius;
    if (cut.side == "inside") {
      r -= workspace.bit_diameter / 2;
      if (r < 0) {
        r = 0;
        warnings.push("bit too large to cut a circle of radius [" + cut.shape.radius + "]");
      }
    } else {
      r += workspace.bit_diameter / 2;
    }

    // Move to a safe height, then to our starting point.
    var z = workspace.safety_height;
    gcode.push("G90");
    gcode.push("G1 Z" + z + " F" + workspace.z_rapid_rate);
    gcode.push("G0 X" + x + " Y" + (y + r) + " F" + workspace.feed_rate);

    var numZPasses = Math.ceil(-cut.depth / workspace.z_step_size);
    for (var k = 0; k < numZPasses; k++) {
      // Decide how far down to drop.
      if (z <= cut.depth) {
        break;
      } else if (z > 0) {
        z = Math.max(cut.depth, -workspace.z_step_size);
      } else {
        z = Math.max(cut.depth, z - workspace.z_step_size);
      }

      // Drop down, go around.
      gcode.push("G1 Z" + z + " F" + workspace.plunge_rate);
      gcode.push("G2 X" + (x + r) + " Y" + y + " I" + 0 + " J" + (-r) + " F" + workspace.feed_rate);
      gcode.push("G2 X" + x + " Y" + (y - r) + " I" + (-r) + " J" + 0 + " F" + workspace.feed_rate);
      gcode.push("G2 X" + (x - r) + " Y" + y + " I" + 0 + " J" + r + " F" + workspace.feed_rate);
      gcode.push("G2 X" + x + " Y" + (y + r) + " I" + r + " J" + 0 + " F" + workspace.feed_rate);
    }

    // Bring the cutter up to a safe movement area.
    gcode.push("G1 Z" + workspace.safety_height + " F" + workspace.z_rapid_rate);
    gcode.push("G4 P0");

    return {
      "warnings": warnings,
      "gcode": gcode
    };
  };


  /**
   * Perform a profile cut following a given path. At the corners, the path
   * will be extended or reduced to accomodate the bit diameter.
   */
  var doPointsCut = function(workspace, cut) {
    var warnings = [];
    var gcode = [];

    // Check required parameters.
    if (cut.points.length < 2) {
      throw "a path must have at least 2 points";
    }

    // Remove all repeated points (0 length segments)
    var prev = cut.points[0];
    var trimmedPoints = [prev];
    for (var i = 1; i < cut.points.length; i++) {
      var p = cut.points[i];
      if (!(prev[0] == p[0] && prev[1] == p[1])) {
        prev = p;
        trimmedPoints.push(p);
      }
    }
    cut.points = trimmedPoints;
    if (cut.points.length < 2) {
      throw "a path must have at least 2 distinct points";
    }

    // We should join the ends if the first and last points are the same.
    var joinEnds = (cut.points.length > 2 &&
        cut.points[0][0] == cut.points[cut.points.length - 1][0] &&
        cut.points[0][1] == cut.points[cut.points.length - 1][1]);

    // Move to roughly where need to be.
    var z = workspace.safety_height;
    gcode.push("G90");
    gcode.push("G1 Z" + workspace.safety_height + " F" + workspace.z_rapid_rate);

    var numZPasses = Math.ceil(-cut.depth / workspace.z_step_size);
    for (var k = 0; k < numZPasses; k++) {
      // Decide how far down to drop.
      if (z <= cut.depth) {
        break;
      } else if (z > 0) {
        z = Math.max(cut.depth, -workspace.z_step_size);
      } else {
        z = Math.max(cut.depth, z - workspace.z_step_size);
      }
      var didDropDown = false;

      // Start running around the points.
      var pt = cut.points[0];
      for (var j = 0; j < cut.points.length; j++) {
        prev = pt;
        pt = cut.points[j];
        var next = cut.points[Math.min(j + 1, cut.points.length - 1)];
        if (joinEnds) {
          if (j === 0) {
            prev = cut.points[cut.points.length - 2];
          } else if (j + 1 == cut.points.length) {
            next = cut.points[1];
          }
        }

        // Math.atan2 gives the angle of a point from (-PI, PI]
        var a1 = Math.atan2(pt[0] - prev[0], pt[1] - prev[1]);
        var a2 = Math.atan2(next[0] - pt[0], next[1] - pt[1]);

        // Determine the angle of the corner, null if there is no corner.
        var cornerAngle = 0;
        if (!(prev[0] == pt[0] && prev[1] == pt[1]) &&
            !(pt[0] == next[0] && pt[1] == next[1])) {
          cornerAngle = a2 - a1;
        }
        if (cornerAngle < -Math.PI) {
          cornerAngle += 2 * Math.PI;
        } else if (cornerAngle > Math.PI) {
          cornerAngle -= 2 * Math.PI;
        }

        // Convenience variable for the bit radius. We negate it for inside cuts.
        var r = workspace.bit_diameter / 2;
        if (cut.side == "inside") {
          r *= -1;
        }

        if (!didDropDown) {
          didDropDown = true;
          // For end-joined cuts, we are already in position.
          if (!joinEnds || k == 0) {
            if ((cut.side == "outside" && cornerAngle < 0) ||
                (cut.side == "inside" && cornerAngle > 0)) {
              r = r / Math.sin(cornerAngle / 2);
              gcode.push("G0" +
                " X" + (pt[0] - r * Math.cos(a1 + cornerAngle / 2)) +
                " Y" + (pt[1] + r * Math.sin(a1 + cornerAngle / 2)) +
                " F" + workspace.feed_rate);
            } else {
              gcode.push("G0" +
                  " X" + (pt[0] - r * Math.cos(a2)) +
                  " Y" + (pt[1] + r * Math.sin(a2)) +
                  " F" + workspace.feed_rate);
            }
          }
          gcode.push("G1 Z" + z + " F" + workspace.plunge_rate);
          continue;
        }

        var toX = pt[0] - r * Math.cos(a1);
        var toY = pt[1] + r * Math.sin(a1);
        if ((cut.side == "outside" && cornerAngle < 0) ||
            (cut.side == "inside" && cornerAngle > 0)) {
          var c = (cut.side == "outside") ? Math.PI + cornerAngle : cornerAngle; 
          var dist = r / Math.sin(c / 2);
          toX = pt[0] - dist * Math.cos(a1 + cornerAngle / 2);
          toY = pt[1] + dist * Math.sin(a1 + cornerAngle / 2);
        }
        gcode.push("G1 X" + toX + " Y" + toY + " F" + workspace.feed_rate);

        // When we are on the outside of a curve, we need to arc around the corner to keep it sharp.
        if (!(pt[0] == next[0] && pt[1] == next[1])) {
          if (cut.side == "outside" && cornerAngle > 0) {
            // TODO: arc interpolations over 120˚ are not recommended. split this arc.
            gcode.push("G2" +
                " X" + (pt[0] - r * Math.cos(a2)) +
                " Y" + (pt[1] + r * Math.sin(a2)) +
                " I" + (r * Math.cos(a1)) +
                " J" + (-r * Math.sin(a1)) +
                " F" + workspace.feed_rate);
          } else if (cut.side == "inside" && cornerAngle < 0) {
            // TODO: arc interpolations over 120˚ are not recommended. split this arc.
            gcode.push("G3" +
                " X" + (pt[0] - r * Math.cos(a2)) +
                " Y" + (pt[1] + r * Math.sin(a2)) +
                " I" + (r * Math.cos(a1)) +
                " J" + (-r * Math.sin(a1)) +
                " F" + workspace.feed_rate);
          } else {
            // Cut to the corner if compensation is enabled.
            if (cut.corner_compensation === true) {
              var dx = pt[0] - toX;
              var dy = pt[1] - toY;
              var mag = (workspace.bit_diameter / 2) / Math.sqrt(dx * dx + dy * dy);
              gcode.push("G1 X" + (pt[0] - (dx * mag)) + " Y" + (pt[1] - (dy * mag)) +
                  " F" + workspace.feed_rate);
              gcode.push("G1 X" + toX + " Y" + toY + " F" + workspace.feed_rate);
            }
          }
        }
      }

      // Lift the cutter to a safe height before the next round.
      if (!joinEnds || k == numZPasses - 1) {
        gcode.push("G1 Z" + workspace.safety_height + " F" + workspace.z_rapid_rate);
      }
      gcode.push("G4 P0");
    }

    return {
      "warnings": warnings,
      "gcode": gcode
    };
  };


  window.opencut.registerCutType("profile", function generatePathCut(workspace, cut) {
    if (cut.points !== undefined && cut.shape !== undefined && cut.shape.type !== undefined) {
      throw "cut points and shape are mutually exclusive.";
    }

    if (cut.depth === undefined || typeof cut.depth != "number" || cut.depth >= 0) {
      throw "path cut has an invalid 'depth'";
    }

    if (cut.side === undefined || cut.side === null) {
      throw "profile cut side [inside/outside] not specified";
    } else if (cut.side != "inside" && cut.side != "outside") {
      throw "unknown profile cut side [" + cut.side + "], expected 'inside' or 'outside'";
    }

    if (cut.points !== undefined) {
      return doPointsCut(workspace, cut);
    }

    if (cut.shape === undefined || cut.shape === null) {
      throw "profile cut shape not defined";
    } else if (cut.shape.type === undefined || cut.shape.type === null) {
      throw "profile cut shape type not defined";
    } else if (cut.shape.type == "rectangle") {
      return doRectangleCut(workspace, cut);
    } else if (cut.shape.type == "circle") {
      return doCircleCut(workspace, cut);
    }

    throw "profile cut shape [" + cut.shape.type + "] not implemented";
  });
})();
