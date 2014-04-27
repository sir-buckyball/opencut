/**
 * A cut type which just injects gcode into the output program.
 */
window.opencut.registerCutType("gcode", function generatePathCut(workspace, cut) {
  // Basic validations.
  if (cut.gcode === undefined || cut.gcode === null || cut.gcode.length === 0) {
    throw "gcode cut does not specify 'gcode' list";
  }

  return {
    "warnings": [],
    "gcode": cut.gcode
  };
});
