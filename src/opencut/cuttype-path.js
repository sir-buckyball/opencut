/**
 * Generate the gcode for a path cut. This is a path which follows the specified
 * path with the center of the cutting bit.
 *
 * TODO: shapes
 */
(function() {
  var trimRepeatedPoints = function(pts) {
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
  };

  var rotatePoint = function(pt, angle, center) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var x = pt[0] - center[0];
    var y = pt[1] - center[1];
    return [(x * c - y * s) + center[0],
            (x * s + y * c) + center[1]];
  };

  var pathGcode = function(pts, opt_options) {
    opt_options.bit_diameter = opt_options.bit_diameter || 0;
    opt_options.path_offset = opt_options.path_offset || 0;
    pts = trimRepeatedPoints(pts);

    var gcode = [];
    var r = opt_options.path_offset;

    // Calculate the starting point we should be positioned at. Since this
    // method does not care about the Z positioning, the calling code needs
    // this value.
    var sa = Math.atan2(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
    var start = [pts[0][0] + r * Math.cos(sa), pts[0][1] - r * Math.sin(sa)];

    // Start running around the points.
    for (var j = 1; j < pts.length - 1; j++) {
      var prev = pts[j - 1];
      var pt = pts[j];
      var next = pts[j + 1];

      // Math.atan2 gives the angle of a point from (-PI, PI]
      var a1 = Math.atan2(pt[0] - prev[0], pt[1] - prev[1]);
      var a2 = Math.atan2(next[0] - pt[0], next[1] - pt[1]);
      var cornerAngle = a2 - a1;
      if (cornerAngle < -Math.PI) {
        cornerAngle += 2 * Math.PI;
      } else if (cornerAngle > Math.PI) {
        cornerAngle -= 2 * Math.PI;
      }

      // Convenience variable for the bit radius.
      gcode.push("G1 X" + (pt[0] + r * Math.cos(a1)) +
                   " Y" + (pt[1] - r * Math.sin(a1)));
      if (r != 0) {
        var np = [pt[0] + r * Math.cos(a2), pt[1] - r * Math.sin(a2)];
        // When we are on the outside of an angle, we MUST arc around the
        // corner to keep it sharp without going out of our way.
        if (cornerAngle < 0) {
          gcode.push("G3 X" + np[0] + " Y" + np[1] +
                       " I" + (-r * Math.cos(a1)) +
                       " J" + (r * Math.sin(a1)));
        } else if (Math.abs(Math.PI - cornerAngle) < 0.0001) {
          var midpoint = rotatePoint(np, - Math.PI / 2, pt);
          gcode.push("G3 X" + midpoint[0] + " Y" + midpoint[1] +
                       " I" + (-r * Math.cos(a1)) +
                       " J" + (r * Math.sin(a1)));
          gcode.push("G3 X" + np[0] + " Y" + np[1] +
                       " I" + (-r * Math.sin(a1)) +
                       " J" + (-r * Math.cos(a1)));
        } else if (cornerAngle != 0) {
          gcode.push("G1 X" + np[0] + " Y" + np[1]);
        }
      }
    }

    // Add the final point.
    var k = pts.length - 1;
    var ka = Math.atan2(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
    gcode.push("G1 X" + (pts[k][0] + r * Math.cos(ka)) +
                 " Y" + (pts[k][1] - r * Math.sin(ka)));

    return {
      "gcode": gcode,
      "start_point": start
    };
  };

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
    if (cut.width === undefined) {
      cut.width = workspace.bit_diameter;
    }
    if (cut.width < workspace.bit_diameter) {
      throw "cut width cannot be smaller than the bit diameter";
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

    // Calculate the XY path.
    var path = pathGcode(cut.points, {bit_diameter: workspace.bit_diameter});

    // We should join the ends if the first and last points are the same.
    var joinEnds = (cut.points.length > 2 &&
        cut.points[0][0] == cut.points[cut.points.length - 1][0] &&
        cut.points[0][1] == cut.points[cut.points.length - 1][1]);

    gcode.push("G90");

    // Stay safe.
    var z = workspace.safety_height;
    gcode.push("G1 Z" + z + " F" + workspace.z_rapid_rate);

    // Cut the paths.
    var numZPasses = Math.ceil(Math.abs(cut.z_top - cut.depth) / cut.z_step_size);
    for (var k = 0; k < numZPasses; k++) {
      // Rapid move over to the starting point.
      if (k == 0 || !joinEnds) {
        gcode.push("G0 X" + path.start_point[0] + " Y" + path.start_point[1]);
      }

      // Decide how far down to drop and plunge.
      if (z > cut.z_top) {
        z = Math.max(cut.depth, cut.z_top - cut.z_step_size);
      } else {
        z = Math.max(cut.depth, z - cut.z_step_size);
      }
      gcode.push("G1 Z" + z + " F" + workspace.plunge_rate);

      // Cut the path. We are alreay at the starting point.
      gcode.push("G1 F" + workspace.feed_rate);
      Array.prototype.push.apply(gcode, path.gcode);

      if (cut.width > workspace.bit_diameter) {
        joinEnds = false;
        var sideAmt = (cut.width - workspace.bit_diameter) / 2;

        // Note that we should loop around just a bit more to get the path to
        // cover the front wrap-around. We'll do a climb cut (CCW) for a better
        // finish for this "pocketing".
        var sidePts = [];
        cut.points.reverse();
        Array.prototype.push.apply(sidePts, cut.points);
        cut.points.reverse();
        Array.prototype.push.apply(sidePts, cut.points);
        sidePts.push(cut.points[cut.points.length - 2]);

        var r = workspace.bit_diameter / 2;
        var widths = [];
        for (var w = r; w < sideAmt; w += r) {
          widths.push(w);
        }
        widths.push(sideAmt);
        for (var i = 0; i < widths.length; i++) {
          var p = pathGcode(sidePts, {
            bit_diameter: workspace.bit_diameter,
            path_offset: widths[i]
          });

          // Go to the start and add all but the last gcode move (it goes
          // too far, but we generated it so we'd get a nice loop around).
          gcode.push("G1 X" + p.start_point[0] + " Y" + p.start_point[1]);
          Array.prototype.push.apply(gcode, p.gcode);
          gcode.pop();
        }
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
})();
