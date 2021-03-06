/* global paper:false */
/* global breakupGcodeCommand:false analyzeGcode:false extractCommandSequence:false */
/* exported newGcodeRenderer */

/**
 * Create a new gcode renderer.
 * 
 * The result is an API object with the following methods:
 *  - renderGcode(string)
 *  - setSize(array<number>)
 *
 * @param canvas {Element} - The canvas element to use.
 */
function newGcodeRenderer(canvas) {
  var analysis = {
    minPos: {X: 0, Y: 0},
    maxPos: {X: 0, Y: 0},
  };

  /* Resize the paperjs view to fit everything rendered. */
  var resizeView = function(options) {
    options = options || {};
    var workspaceWidth = Math.max(analysis.maxPos.X - analysis.minPos.X, 50);
    var workspaceDepth = Math.max(analysis.maxPos.Y - analysis.minPos.Y, 50);

    var left = analysis.minPos.X;
    var bottom = analysis.minPos.Y;
    if (options.bit_diameter) {
      workspaceWidth += options.bit_diameter * 2;
      workspaceDepth += options.bit_diameter * 2;
      left -= options.bit_diameter;
      bottom -= options.bit_diameter;
    }

    // Set an appropriate zoom/centering given our analysis.
    paper.view.setZoom(Math.min(
      paper.view.viewSize.width / (workspaceWidth * 1.1),
      paper.view.viewSize.height / (workspaceDepth * 1.1)));
    paper.view.setCenter(new paper.Point(
      left + workspaceWidth / 2,
      bottom + workspaceDepth / 2));
  };

  /* Set the size of the paper canvas. */
  var setSize = function(bounds) {
    paper.view.viewSize = [bounds.width, bounds.height];
    resizeView();
  };
  
  var warn = function(str) {
    // TODO: display in the rendered view.
    console.warn(str);
  };

  /**
   * Render the list of gcode commands onto a canvas.
   *
   * Options:
   *  - bit_diameter: The size of the bit to use in millimeters.
   *
   * @param opt_options {Object} - Extra options to use
   */
  var renderGcode = function(gcode, opt_options) {
    var options = opt_options || {};

    console.time("renderGcode");
    
    var commandSequence = extractCommandSequence(gcode);

    // Run an analysis on the gcode to determine the appropriate bounds for rendering.
    analysis = analyzeGcode(commandSequence);
    if (!options.hide_grid) {
      analysis.maxPos.X = Math.max(50, analysis.maxPos.X);
      analysis.maxPos.Y = Math.max(50, analysis.maxPos.Y);
    }
    resizeView(options);

    // Clear out any previous paths.
    paper.project.clear();

    // A scaling factor from current units to mm.
    var scale = 1;

    // A toggle for absolute v. relative coordinate specification.
    var isRelative = false;

    // The current tool position.
    var pos = {
      "X": 0,
      "Y": 0,
      "Z": 0
    };

    // A paper group for all of the paths to be rendered.
    var allPaths = new paper.Group();

    // Draw a little graph table representing out workspace.
    if (!options.hide_grid) {
      var gridLineWidth = 1 / paper.view.getZoom();
      var gridWidth = 10 * Math.ceil(Math.max(50, analysis.maxPos.X) / 10);
      var gridDepth = 10 * Math.ceil(Math.max(50, analysis.maxPos.Y) / 10);
      for (var ix = 10; ix <= gridWidth; ix += 10) {
        allPaths.addChild(new paper.Path.Line({
          "from": [ix, 0],
          "to": [ix, gridDepth],
          "strokeColor": "#DCFFFF",
          "strokeWidth": gridLineWidth * (ix % 50 == 0) ? 1.5 : 1,
        }));
      }
      for (var iy = 10; iy <= gridDepth; iy += 10) {
        allPaths.addChild(new paper.Path.Line({
          "from": [0, iy],
          "to": [gridWidth, iy],
          "strokeColor": "#DCFFFF",
          "strokeWidth": gridLineWidth * (iy % 50 == 0) ? 1.5 : 1,
        }));
      }
      allPaths.addChild(new paper.Path.Line({
        "from": [0, 0],
        "to": [gridWidth, 0],
        "strokeColor": "#A3CCCC",
        "strokeWidth": 2 * gridLineWidth,
      }));
      allPaths.addChild(new paper.Path.Line({
        "from": [0, 0],
        "to": [0, gridDepth],
        "strokeColor": "#A3CCCC",
        "strokeWidth": 2 * gridLineWidth,
      }));
    }


    var depthColor = function(depth1, depth2) {
      var depth = Math.min(depth1, depth2);
      if (depth > 0) {
        return "green";
      }

      var c = Math.round(255 - (depth / analysis.minPos.Z) * 224);
      return "rgb(" + c + "," + c + "," + c + ")";
    };

    console.time("renderGcode: gcode processing");
    var bitRadius = options["bit_diameter"] / 2 || (1 / paper.view.getZoom());
    var prevInstruction = "";
    for (var i = 0; i < commandSequence.length; i++) {
      var command = prevInstruction + commandSequence[i];
      var parts = breakupGcodeCommand(command);

      var cType = parts[0][0];
      var cNum = parseInt(parts[0].substr(1), 10);

      // The carriage return can pass new arguments to the previous command.
      prevInstruction = command.endsWith('\r') ? cType + cNum + " " : "";

      // Read the command parameters.
      var params = {};
      for (var j = 1; j < parts.length; j++) {
        params[parts[j][0].toUpperCase()] = parseFloat(parts[j].substr(1)) || 0;
      }

      if (cType == "G" && (cNum === 0 || cNum === 1)) {
        var endX = ((isRelative || params.X === undefined) ? pos.X : 0) +
            ((params.X === undefined) ? 0 : params.X * scale);
        var endY = ((isRelative || params.Y === undefined) ? pos.Y : 0) +
            ((params.Y === undefined) ? 0 : params.Y * scale);
        var endZ = ((isRelative || params.Z === undefined) ? pos.Z : 0) +
            ((params.Z === undefined) ? 0 : params.Z * scale);

        // If we only moved in Z, render a circle.
        if (pos.X == endX && pos.Y == endY && endZ < pos.Z) {
          var drillSpot = new paper.Shape.Circle(
              new paper.Point([pos.X, pos.Y]), bitRadius);
          drillSpot.strokeWidth = 0;
          drillSpot.fillColor = depthColor(pos.Z, endZ);
          allPaths.addChild(drillSpot);
        } else {
          var line = paper.Path.Line({
            from: [pos.X, pos.Y],
            to: [endX, endY],
            strokeColor: depthColor(pos.Z, endZ),
            strokeCap: 'round',
            strokeWidth: 2 * bitRadius,
          });
          allPaths.addChild(line);
          if (cNum === 0) {
            line.dashArray = [1, 2];
            line.strokeWidth =  1 / paper.view.getZoom();
          }
        }

        // Update our known position.
        pos.X = endX;
        pos.Y = endY;
        pos.Z = endZ;
      } else if (cType == "G" && (cNum === 2 || cNum === 3)) {
        if (params.I === undefined || params.J === undefined) {
          warn("implementation only supports specification of both I and J: " + command);
          continue;
        }

        // circular interpolation (clockwise)
        var arcEndX = ((isRelative || params.X === undefined) ? pos.X : 0) +
            ((params.X === undefined) ? 0 : params.X * scale);
        var arcEndY = ((isRelative || params.Y === undefined) ? pos.Y : 0) +
            ((params.Y === undefined) ? 0 : params.Y * scale);
        var arcEndZ = ((isRelative || params.Z === undefined) ? pos.Z : 0) +
            ((params.Z === undefined) ? 0 : params.Z * scale);

        // TODO: implement missing axii (Z, A, B, C, K)
        var arcStart = new paper.Point(pos.X, pos.Y);
        var arcEnd = new paper.Point(arcEndX, arcEndY);

        var center = arcStart.add(new paper.Point(params.I * scale, params.J * scale));
        var through = arcStart.subtract(center);
        through.angle = arcStart.add(arcEnd).subtract(center).subtract(center).angle;
        through = through.add(center);

        allPaths.addChild(paper.Path.Arc({
          from: [pos.X, pos.Y],
          through: [through.x, through.y],
          to: [arcEndX, arcEndY],
          strokeColor: depthColor(pos.Z, arcEndZ),
          strokeCap: 'round',
          strokeWidth: 2 * bitRadius,
        }));

        // Update our known position.
        pos.X = arcEndX;
        pos.Y = arcEndY;
        pos.Z = arcEndZ;
      } else if (cType == "G" && cNum === 4) {
        // dwell
      } else if (cType == "G" && cNum === 9) {
        // exact stop, non-modal
      } else if (cType == "G" && cNum === 17) {
        // XY plane selection
        // TODO: support other axis specification
      } else if (cType == "G" && cNum === 20) {
        // programming in inches
        scale = 25.4;
      } else if (cType == "G" && cNum === 21) {
        // programming in mm
        scale = 1;
      } else if (cType == "G" && cNum === 28) {
        // return to home
        if (params.X !== undefined) {
          pos.X = 0;
        }
        if (params.Y !== undefined) {
          pos.Y = 0;
        }
        if (params.Z !== undefined) {
          pos.Z = 0;
        }
      } else if (cType == "G" && cNum === 40) {
        // tool radius compensation off.
        // TODO: implement tool radius compensation.
      } else if (cType == "G" && cNum === 61) {
        // exact stop, modal
      } else if (cType == "G" && cNum === 64) {
        // cancel exact stop, modal
      } else if (cType == "G" && cNum === 90) {
        // absolute coordinates.
        isRelative = false;
      } else if (cType == "G" && cNum === 91) {
        // relative coordinates.
        isRelative = true;
      } else if (cType == "G" && cNum === 92) {
        // coordinate system offset. This command effectively states that the machine
        // is at the specified coordinates.

        // Fake support for this by validating that the command does not mess
        // with an axis we care about.
        // TODO: implement real support for this.
        if (params.X !== undefined ||
            params.Y !== undefined ||
            params.Z !== undefined) {
          warn("coordinate system offset (G92) not implemented.");
        }
      } else if (cType == "M") {
        // Most M codes can safely be ignored.

        switch(cNum) {
        case 0: // compulsory stop
        case 1: // optional stop
        case 2: // end of program
        case 3: // spindle on clockwise
        case 4: // spindle on counterclockwise
        case 5: // spindle stop
        case 6: // tool change for linuxcnc
        case 7: // coolant on, mist
        case 8: // coolant on, flood
        case 9: // coolant off
        case 30: // end of program with return to top
        case 40: // reprap eject
        case 82: // reprap extruder absolute mode
        case 83: // reprap extruder relative mode
        case 84: // reprap stop idle hold
        case 104: // reprap set extruder temperature
        case 105: // reprap get extruder temperature
        case 106: // reprap fan on
        case 107: // reprap fan off
        case 108: // reprap set extruder speed
        case 109: // reprap set extruder temperature and wait
        case 140: // reprap set bed temperature (fast)
        case 141: // reprap set chamber temperature (fast)
        case 143: // reprap set maximum hot-end temperature
        case 190: // reprap wait for bed temperature to reach target
          continue;
        default:
          warn("unimplemented gcode command: " + parts[0]);
        }
      } else {
        warn("unknown gcode command: " + parts[0]);
      }
    }
    console.timeEnd("renderGcode: gcode processing");

    // Invert everything (to move the origin to the bottom left).
    allPaths.scale(1, -1);

    paper.view.draw();
    console.timeEnd("renderGcode");
  };


  // Initialize paper.js
  paper.setup(canvas);

  // Render an empty workspace.
  renderGcode([]);

  return {
    setSize: setSize,
    resizeView: resizeView,
    renderGcode: renderGcode,
  };
}
