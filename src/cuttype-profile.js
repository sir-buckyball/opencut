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
    var warnings = [];
    var gcode = [];

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

    // Validate corner compensation options.
    var cornerCompensation = 0;
    if (cut.corner_compensation !== undefined) {
      if (typeof cut.corner_compensation !== "boolean") {
        throw "profile cornerCompensation is expected to be a boolean";
      } else if (cut.corner_compensation === true && cut.side == "inside") {
        var d = workspace.bit_diameter;
        cornerCompensation = Math.sqrt(d * d * 2) - d;
      }
    }

    // Since this is a profile cut, we want to be on the side of the lines.
    if (cut.side == "inside") {
      x += workspace.bit_diameter / 2;
      y += workspace.bit_diameter / 2;
      width -= workspace.bit_diameter;
      height -= workspace.bit_diameter;
    } else {
      x -= workspace.bit_diameter / 2;
      y -= workspace.bit_diameter / 2;
      width += workspace.bit_diameter;
      height += workspace.bit_diameter;
    }

    // Move to a safe height, then move over to our starting point.
    var z = workspace.safety_height;
    gcode.push("G90");
    gcode.push("G0 Z" + z + " F" + workspace.plunge_rate);
    gcode.push("G0 X" + x + " Y" + y + " F" + workspace.feed_rate);

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
      gcode.push("G1 X" + x + " Y" + y + " F" + workspace.feed_rate);
      gcode.push("G1 X" + x + " Y" + (y + height) + " F" + workspace.feed_rate);
      if (cornerCompensation > 0) {
        gcode.push("G1" +
            " X" + (x - cornerCompensation) +
            " Y" + (y + height + cornerCompensation) +
            " F" + workspace.feed_rate);
        gcode.push("G1 X" + x + " Y" + (y + height) + " F" + workspace.feed_rate);
      }
      gcode.push("G1 X" + (x + width) + " Y" + (y + height) + " F" + workspace.feed_rate);
      if (cornerCompensation > 0) {
        gcode.push("G1" +
            " X" + (x + width + cornerCompensation) +
            " Y" + (y + height + cornerCompensation) +
            " F" + workspace.feed_rate);
        gcode.push("G1 X" + (x + width) + " Y" + (y + height) + " F" + workspace.feed_rate);
      }
      gcode.push("G1 X" + (x + width) + " Y" + y + " F" + workspace.feed_rate);
      if (cornerCompensation > 0) {
        gcode.push("G1" +
            " X" + (x + width + cornerCompensation) +
            " Y" + (y - cornerCompensation) +
            " F" + workspace.feed_rate);
        gcode.push("G1 X" + (x + width) + " Y" + y + " F" + workspace.feed_rate);
      }
      gcode.push("G1 X" + x + " Y" + y + " F" + workspace.feed_rate);
      if (cornerCompensation > 0) {
        gcode.push("G1" +
            " X" + (x - cornerCompensation) +
            " Y" + (y - cornerCompensation) +
            " F" + workspace.feed_rate);
        gcode.push("G1 X" + x + " Y" + y + " F" + workspace.feed_rate);
      }
    }

    // Bring the cutter up to a safe movement area.
    gcode.push("G1 Z0 F" + workspace.plunge_rate);
    gcode.push("G0 Z" + workspace.safety_height);

    return {
      "warnings": warnings,
      "gcode": gcode
    };
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
    gcode.push("G0 Z" + z + " F" + workspace.plunge_rate);
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
    gcode.push("G1 Z0 F" + workspace.plunge_rate);
    gcode.push("G0 Z" + workspace.safety_height);

    return {
      "warnings": warnings,
      "gcode": gcode
    };
  };

  window.opencut.registerCutType("profile", function generatePathCut(workspace, cut) {
    if (cut.points !== undefined) {
      throw "profile cuts for a sequence of points is not implemented";
    }

    if (cut.depth === undefined || typeof cut.depth != "number" || cut.depth >= 0) {
      throw "path cut has an invalid 'depth'";
    }

    if (cut.side === undefined || cut.side === null) {
      throw "profile cut side [inside/outside] not specified";
    } else if (cut.side != "inside" && cut.side != "outside") {
      throw "unknown profile cut side [" + cut.side + "], expected 'inside' or 'outside'";
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
