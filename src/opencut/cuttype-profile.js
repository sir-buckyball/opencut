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
 * TODO: more shapes (polygons)
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

    var numZPasses = Math.ceil(Math.abs(cut.z_top - cut.depth) / cut.z_step_size);
    for (var k = 0; k < numZPasses; k++) {
      // Decide how far down to drop.
      if (z <= cut.depth) {
        break;
      } else if (z > cut.z_top) {
        z = Math.max(cut.depth, cut.z_top - cut.z_step_size);
      } else {
        z = Math.max(cut.depth, z - cut.z_step_size);
      }

      // Drop down, go around (if we can, otherwise go up to release material).
      gcode.push("G1 Z" + z + " F" + workspace.plunge_rate);
      if (r == 0) {
        gcode.push("G1 Z" + cut.z_top + " F" + workspace.z_rapid_rate);
      } else if (cut.side == "outside") {
        gcode.push("G3 X" + (x - r) + " Y" + y + " I" + 0 + " J" + (-r) + " F" + workspace.feed_rate);
        gcode.push("G3 X" + x + " Y" + (y - r) + " I" + r + " J" + 0 + " F" + workspace.feed_rate);
        gcode.push("G3 X" + (x + r) + " Y" + y + " I" + 0 + " J" + r + " F" + workspace.feed_rate);
        gcode.push("G3 X" + x + " Y" + (y + r) + " I" + (-r) + " J" + 0 + " F" + workspace.feed_rate);
      } else {
        gcode.push("G2 X" + (x + r) + " Y" + y + " I" + 0 + " J" + (-r) + " F" + workspace.feed_rate);
        gcode.push("G2 X" + x + " Y" + (y - r) + " I" + (-r) + " J" + 0 + " F" + workspace.feed_rate);
        gcode.push("G2 X" + (x - r) + " Y" + y + " I" + 0 + " J" + r + " F" + workspace.feed_rate);
        gcode.push("G2 X" + x + " Y" + (y + r) + " I" + r + " J" + 0 + " F" + workspace.feed_rate);
      }
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
   * Return the distance between a point, and a line segment defined
   * by 2 points.
   *
   * Copied from
   * http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
   */
  function distToSegment(p, v, w) {
    var dist2 = function(v, w) {
      return Math.pow(v[0] - w[0], 2) + Math.pow(v[1] - w[1], 2);
    };

    var l2 = dist2(v, w);
    if (l2 == 0) {
      return Math.sqrt(dist2(p, v));
    }
    var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt(dist2(p, [v[0] + t * (w[0] - v[0]),
                               v[1] + t * (w[1] - v[1])]));
  }

  function trimRepeatedPoints(pts) {
    var prev = pts[0];
    var trimmedPoints = [prev];
    for (var i = 1; i < pts.length; i++) {
      var p = pts[i];
      if (!(prev[0] == p[0] && prev[1] == p[1])) {
        prev = p;
        trimmedPoints.push(p);
      }
    }
    return trimmedPoints;
  }

  /**
   * Generate tool path and gcode for a single layer of a points path cut. The
   * caller is responsible for initial positioning, removal, and z-repeats.
   *
   * The return value is an object as follows:
   *   start - x,y position the gcode expects to start at
   *   gcode - gcode to move the tool for a single layer
   *   segments - a list of objects describing each gcode segment
   *   warnings - any warnings that were generated
   */
  var generatePointsCutLayer = function (workspace, cut) {
    var out = {
      gcode: [],
      segments: [],
      warnings: [],
    };

    // Helper method to simplify segment addition and start/end tracking.
    var pushSegment = function(segment) {
      // If the starting point isn't specified, guess.
      if (segment.start === undefined) {
        if (out.segments.length > 0) {
          segment.start = out.segments[out.segments.length - 1].end;
        } else if (out.start !== undefined)  {
          segment.start = out.start;
        }
      }
      out.segments.push(segment);

      // Update the gcode for the given segment.
      if (segment.type == "arc") {
        out.gcode.push((segment.ccw ? "G3" : "G2") +
            " X" + segment.end[0] +
            " Y" + segment.end[1] +
            " I" + segment.center[0] +
            " J" + segment.center[1] +
            " F" + workspace.feed_rate);
      } else if (segment.type == "line") {
        out.gcode.push("G1" +
            " X" + segment.end[0] +
            " Y" + segment.end[1] +
            " F" + workspace.feed_rate);
      } else {
        console.log("unknown segment type: " + JSON.stringify(segment));
      }
    };

    // We should join the ends if the first and last points are the same.
    var joinEnds = (cut.points.length > 2 &&
        cut.points[0][0] == cut.points[cut.points.length - 1][0] &&
        cut.points[0][1] == cut.points[cut.points.length - 1][1]);

    // Start running around the points.
    for (var j = 0; j < cut.points.length; j++) {
      var pt = cut.points[j];
      var prev = cut.points[Math.max(0, j - 1)];
      var next = cut.points[Math.min(j + 1, cut.points.length - 1)];
      if (joinEnds) {
        if (j == 0) {
          prev = cut.points[cut.points.length - 2];
        } else if (j == cut.points.length -1) {
          next = cut.points[1];
        }
      }

      // Math.atan2 gives the angle of a point from (-PI, PI]
      var a1 = Math.atan2(pt[0] - prev[0], pt[1] - prev[1]);
      var a2 = Math.atan2(next[0] - pt[0], next[1] - pt[1]);
      if (prev[0] == pt[0] && prev[1] == pt[1]) {
        a1 = a2;
      } else if (pt[0] == next[0] && pt[1] == next[1]) {
        a2 = a1;
      }
      var cornerAngle = a2 - a1;
      if (cornerAngle < -Math.PI) {
        cornerAngle += 2 * Math.PI;
      } else if (cornerAngle > Math.PI) {
        cornerAngle -= 2 * Math.PI;
      }

      // Convenience variable for the bit radius.
      var r = workspace.bit_diameter / 2;
      var cr = (!joinEnds && (j == 0 || j == cut.points.length - 1)) ? 0
          : Math.max((cornerAngle > 0) ? r: 0, cut.corner_radius);
      var coff = -cr * Math.tan(Math.abs(cornerAngle) / 2);
      if (coff * coff > Math.pow(pt[0] - prev[0], 2) + Math.pow(pt[1] - prev[1], 2)) {
        if (cut.corner_radius > 0) {
          throw "corner_radius [" + cut.corner_radius + "] is too large for point " + JSON.stringify(pt);
        }
      }
      var toX = pt[0] + r * Math.cos(a1) + coff * Math.sin(a1);
      var toY = pt[1] - r * Math.sin(a1) + coff * Math.cos(a1);

      // Cap the offset if the distance is too great.
      if (distToSegment([toX, toY], prev, pt) > r * 1.01) {
        toX = pt[0] + r * Math.cos(a1);
        toY = pt[1] - r * Math.sin(a1);
        out.warnings.push("tight corner at " + JSON.stringify(pt)
            + " resulted in a potentially bad path.");
      }

      if (j == 0) {
        toX = pt[0] + r * Math.cos(a2) - coff * Math.sin(a2);
        toY = pt[1] - r * Math.sin(a2) - coff * Math.cos(a2);

        // Cap the offset if the distance is too great.
        if (distToSegment([toX, toY], pt, next) > r * 1.01) {
          toX = pt[0] + r * Math.cos(a2);
          toY = pt[1] - r * Math.sin(a2);
          out.warnings.push("tight corner at " + JSON.stringify(pt)
              + " resulted in a potentially bad path.");
        }
      }
      if (cornerAngle > 0 && (cut.corner_radius <= 0 || cut.corner_compensation)) {
        // TODO: There is some evidence that cornerAngle is really
        // (90 - alpha / 2) where alpha is the angle between 3 points.
        // The distance calculation should really be sin().
        var dist = r / Math.cos(cornerAngle / 2);
        var np = [pt[0] + dist * Math.cos(a1 + cornerAngle / 2),
                  pt[1] - dist * Math.sin(a1 + cornerAngle / 2)];

        // Make sure our target point is somewhere along the line segment.
        if (distToSegment(np, prev, pt) > r * 1.01) {
          out.warnings.push("tight corner at " + JSON.stringify(pt)
              + " resulted in a potentially bad path.");
        } else {
          toX = np[0];
          toY = np[1];
        }
      }

      if (j == 0) {
        out.start = [toX, toY];
      } else {
        pushSegment({type: "line", end:[toX, toY]});

        // When we are on the outside of an angle, we MUST arc around the
        // corner to keep it sharp without going out of our way. When we are
        // on the inside, we MAY need to apply corner compensation. In either
        // case we also MAY need arc to apply a corner_radius.

        // Special case where we are effectively doing a 180.
        if (Math.abs(Math.PI - cornerAngle) < 0.001) {
          pushSegment({
            type: "arc",
            end:[pt[0] + r * Math.cos(a2), pt[1] - r * Math.sin(a2)],
            center: [-r * Math.cos(a1), r * Math.sin(a1)],
            radius: r,
            ccw: true,
          });
        } else if (cornerAngle < 0) {
          var np2 = [pt[0] + r * Math.cos(a2) - coff * Math.sin(a2),
                    pt[1] - r * Math.sin(a2) - coff * Math.cos(a2)];
          // Don't go too far away.
          if (distToSegment(np2, pt, next) > r * 1.01) {
            np2 = [pt[0] + r * Math.cos(a2), pt[1] - r * Math.sin(a2)];
          }

          // TODO: arc interpolations over 120˚ are not recommended. split this arc.
          pushSegment({
            type: "arc",
            end:[np2[0], np2[1]],
            center: [-(r + cr) * Math.cos(a1), (r + cr) * Math.sin(a1)],
            radius: r + cr,
            ccw: true,
          });

        } else if (cornerAngle > 0) {
          // Cut to the corner if compensation is enabled.
          if (cut.corner_compensation === true) {
            var dx = pt[0] - toX;
            var dy = pt[1] - toY;
            var mag = (workspace.bit_diameter / 2) / Math.sqrt(dx * dx + dy * dy);
            pushSegment({type: "line", end:[pt[0] - (dx * mag), pt[1] - (dy * mag)]});
            pushSegment({type: "line", end:[toX, toY]});

          } else if (cut.corner_radius > r) {
            // TODO: arc interpolations over 120˚ are not recommended. split this arc.
            pushSegment({
              type: "arc",
              end:[pt[0] + r * Math.cos(a2) - coff * Math.sin(a2), pt[1] - r * Math.sin(a2) - coff * Math.cos(a2)],
              center: [(cr - r) * Math.cos(a1), -(cr - r) * Math.sin(a1)],
              radius: cr - r,
              ccw: false,
            });
          }
        }
      }
    }
    return out;
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

    if (cut.corner_radius === undefined) {
      cut.corner_radius = 0;
    } else if (cut.corner_radius < 0) {
      throw "corner_radius must be >= 0";
    }

    // Remove all repeated points (0 length segments)
    cut.points = trimRepeatedPoints(cut.points);
    if (cut.points.length < 2) {
      throw "a path must have at least 2 distinct points";
    }

    // Outside profile cuts are best done counter-clockwise.
    if (cut.side == "outside") {
      cut.points.reverse();
    }

    // We should join the ends if the first and last points are the same.
    var joinEnds = (cut.points.length > 2 &&
        cut.points[0][0] == cut.points[cut.points.length - 1][0] &&
        cut.points[0][1] == cut.points[cut.points.length - 1][1]);

    // Move to roughly where need to be.
    var z = workspace.safety_height;
    gcode.push("G90");
    gcode.push("G1 Z" + workspace.safety_height + " F" + workspace.z_rapid_rate);

    // Calculate the path for each layer.
    var layer = generatePointsCutLayer(workspace, cut);
    warnings.push.apply(warnings, layer.warnings);

    var numZPasses = Math.ceil(Math.abs(cut.z_top - cut.depth) / cut.z_step_size);
    for (var k = 0; k < numZPasses; k++) {
      // Decide how far down to drop.
      if (z <= cut.depth) {
        break;
      } else if (z > cut.z_top) {
        z = Math.max(cut.depth, cut.z_top - cut.z_step_size);
      } else {
        z = Math.max(cut.depth, z - cut.z_step_size);
      }

      // Initial tool positioning.
      if (k == 0 || !joinEnds) {
        gcode.push("G0 X" + layer.start[0] + " Y" + layer.start[1] + " F" + workspace.feed_rate);
      }
      gcode.push("G1 Z" + z + " F" + workspace.plunge_rate);

      // Add the layer gcode.
      gcode.push.apply(gcode, layer.gcode);

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
  
  window.opencut.registerHelper("profileCutLayer",
      "Return an object containing the gcode for a single layer of a profile cut.",
      generatePointsCutLayer);
})();
