module("opencut");
test("empty job validation", function() {
  var results = window.opencut.toGCode({});
  ok(results.errors.length != 0, "expected some errors");
});
