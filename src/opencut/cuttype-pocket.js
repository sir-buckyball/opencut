/**
 * Generate the gcode for a pocket cut. This type of cut is meant to hollow out
 * an area to a specified depth and is useful when you don't want to cut all the
 * way through the workpiece.
 *
 * IMPORTANT: paths for pockets are assumed to be closed (eg, the first and
 * last point will be connected). Additionally paths are assumed to be defined
 * in a clockwise order.
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
      throw "pocket rectangle 'origin' not defined";
    } else if (cut.shape.origin.length != 2) {
      throw "pocket rectangle 'origin' expected to be 2 coordinates";
    }

    if (cut.shape.size === undefined || cut.shape.size === null) {
      throw "pocket square 'size' not defined";
    } else if (cut.shape.size.length != 2) {
      throw "pocket square 'size' expected to be 2 numbers";
    }

    var originX = cut.shape.origin[0];
    var originY = cut.shape.origin[1];
    var maxWidth = cut.shape.size[0];
    var maxHeight = cut.shape.size[1];

    // Validate required parameters.
    if (typeof originX != "number" || typeof originY != "number") {
      throw "pocket rectangle origin not a numbers";
    } else if (typeof maxWidth != "number" || typeof maxHeight != "number") {
      throw "pocket rectangle size not a numbers";
    } else if (maxWidth <= 0) {
      throw "pocket rectangle width must be a positive number";
    } else if (maxHeight <= 0) {
      throw "pocket rectangle height must be a positive number";
    }

    // Validate corner compensation options.
    var cornerCompensation = 0;
    if (cut.corner_compensation !== undefined) {
      if (typeof cut.corner_compensation !== "boolean") {
        throw "profile cornerCompensation is expected to be a boolean";
      } else if (cut.corner_compensation === true) {
        var r = workspace.bit_diameter / 2;
        cornerCompensation = r - r / Math.sqrt(2);
      }
    }

    // Adjust the bounds for the bit diameter.
    originX += workspace.bit_diameter / 2;
    originY += workspace.bit_diameter / 2;
    maxWidth -= workspace.bit_diameter;
    maxHeight -= workspace.bit_diameter;

    // Move to a safe height, then move over to our starting point.
    var z = workspace.safety_height;
    gcode.push("G90");
    gcode.push("G1 Z" + z + " F" + workspace.z_rapid_rate);
    gcode.push("G0 X" + originX + " Y" + originY + " F" + workspace.feed_rate);

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

      // The strategy is to make a starting cut in the center, then grow around
      // the initial cut until we reach our final size.
      var width = Math.max(0, maxWidth - maxHeight);
      var height = Math.max(0, maxHeight - maxWidth);
      var x = originX + ((maxWidth - width) / 2);
      var y = originY + ((maxHeight - height) / 2);
      var bitR = workspace.bit_diameter / 2;

      // Make the first cut in the center.
      gcode.push("G90");
      gcode.push("G1 Z" + workspace.safety_height + " F" + workspace.z_rapid_rate);
      gcode.push("G4 P0");
      gcode.push("G0 X" + x + " Y" + y + " F" + workspace.feed_rate);
      gcode.push("G1 Z" + (z + 2 * workspace.z_step_size) + " F" + workspace.z_rapid_rate);
      gcode.push("G1 Z" + z + " F" + workspace.plunge_rate);
      gcode.push("G1 X" + (x + width) + " Y" + (y + height) + " F" + workspace.feed_rate);

      // Now build around the cut.
      var numPasses = Math.floor(Math.min(maxWidth, maxHeight) / workspace.bit_diameter);
      gcode.push("G91");
      for (var i = 0; i < numPasses; i++) {
        width += bitR;
        gcode.push("G1 X" + bitR);
        height += bitR;
        gcode.push("G1 Y-" + height);
        width += bitR;
        gcode.push("G1 X-" + width);
        height += bitR;
        gcode.push("G1 Y" + height);
        gcode.push("G1 X" + width);
      }

      // Do the finishing pass on this layer.
      gcode.push("G90");
      gcode.push("G1 X" + (originX + maxWidth) + " Y" + (originY + maxHeight));
      gcode.push("G1 X" + (originX + maxWidth) + " Y" + originY);
      if (cornerCompensation > 0) {
        gcode.push("G1" +
            " X" + (originX + maxWidth + cornerCompensation) +
            " Y" + (originY - cornerCompensation));
        gcode.push("G1 X" + (originX + maxWidth) + " Y" + originY);
      }
      gcode.push("G1 X" + originX + " Y" + originY);
      if (cornerCompensation > 0) {
        gcode.push("G1" +
            " X" + (originX - cornerCompensation) +
            " Y" + (originY - cornerCompensation));
        gcode.push("G1 X" + originX + " Y" + originY);
      }
      gcode.push("G1 X" + originX + " Y" + (originY + maxHeight));
      if (cornerCompensation > 0) {
        gcode.push("G1" +
            " X" + (originX - cornerCompensation) +
            " Y" + (originY + maxHeight + cornerCompensation));
        gcode.push("G1 X" + originX + " Y" + (originY + maxHeight));
      }
      gcode.push("G1 X" + (originX + maxWidth) + " Y" + (originY + maxHeight));
      if (cornerCompensation > 0) {
        gcode.push("G1" +
            " X" + (originX + maxWidth + cornerCompensation) +
            " Y" + (originY + maxHeight + cornerCompensation));
        gcode.push("G1 X" + (originX + maxWidth) + " Y" + (originY + maxHeight));
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
    var rmax = cut.shape.radius - workspace.bit_diameter / 2;
    if (rmax < 0) {
      rmax = 0;
      warnings.push("bit too large to cut a circle of radius [" + cut.shape.radius + "]");
    }

    // Move to a safe height, then to our starting point.
    var z = workspace.safety_height;
    gcode.push("G90");
    gcode.push("G1 Z" + z + " F" + workspace.z_rapid_rate);
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

      // Go to the center of the circle, then plunge.
      gcode.push("G1 X" + x + " Y" + y +
          " Z" + (z + 2 * workspace.z_step_size) + " F" + workspace.feed_rate);
      gcode.push("G4 P0");
      gcode.push("G1 Z" + z + " F" + workspace.plunge_rate);

      // Make a bunch of circles radiating outward.
      for (var r = workspace.bit_diameter / 2; r < rmax; r +=+ workspace.bit_diameter / 2) {
        gcode.push("G1 X" + x + " Y" + (y + r) + " F" + workspace.feed_rate);
        gcode.push("G2 X" + (x + r) + " Y" + y + " I" + 0 + " J" + (-r));
        gcode.push("G2 X" + x + " Y" + (y - r) + " I" + (-r) + " J" + 0);
        gcode.push("G2 X" + (x - r) + " Y" + y + " I" + 0 + " J" + r);
        gcode.push("G2 X" + x + " Y" + (y + r) + " I" + r + " J" + 0);
      }

      // Make the final round.
      gcode.push("G1 X" + x + " Y" + (y + rmax) + " F" + workspace.feed_rate);
      gcode.push("G2 X" + (x + rmax) + " Y" + y + " I" + 0 + " J" + (-rmax));
      gcode.push("G2 X" + x + " Y" + (y - rmax) + " I" + (-rmax) + " J" + 0);
      gcode.push("G2 X" + (x - rmax) + " Y" + y + " I" + 0 + " J" + rmax);
      gcode.push("G2 X" + x + " Y" + (y + rmax) + " I" + r + " J" + 0);
    }

    // Bring the cutter up to a safe movement area.
    gcode.push("G1 Z" + workspace.safety_height + " F" + workspace.z_rapid_rate);
    gcode.push("G4 P0");

    return {
      "warnings": warnings,
      "gcode": gcode
    };
  };

  window.opencut.registerCutType("pocket", function generatePathCut(workspace, cut) {
    if (cut.points !== undefined) {
      throw "pocket cuts for a sequence of points is not implemented";
    }

    if (cut.depth === undefined || typeof cut.depth != "number" || cut.depth >= 0) {
      throw "pocket cut has an invalid 'depth'";
    }

    // TODO: warn about parameters which don't make sense (like side for pocket cuts).

    if (cut.shape === undefined || cut.shape === null) {
      throw "profile cut shape not defined";
    } else if (cut.shape.type === undefined || cut.shape.type === null) {
      throw "pocket cut shape type not defined";
    } else if (cut.shape.type == "rectangle") {
      return doRectangleCut(workspace, cut);
    } else if (cut.shape.type == "circle") {
      return doCircleCut(workspace, cut);
    }

    throw "pocket cut shape [" + cut.shape.type + "] not implemented";
  });
})();
