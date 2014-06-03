function resizeView() {
  var minX = -0.01;
  var minY = -0.01;
  var maxX = 0.01;
  var maxY = 0.01;
  var allItems = paper.project.getItems();
  for (var k = 0; k < allItems.length; k++) {
    var bounds = allItems[k].getBounds();
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  }
  paper.view.setCenter(new paper.Point(
    minX + (maxX - minX) / 2, minY + (maxY - minY) / 2));

  var scaleX = (paper.view.getBounds().width / ((maxX - minX) * 1.1)) * paper.view.getZoom();
  var scaleY = (paper.view.getBounds().height / ((maxY - minY) * 1.1)) * paper.view.getZoom();
  paper.view.setZoom(Math.min(scaleX, scaleY));
}

function renderYaml(txt) {
  console.time("render YAML");
  paper.project.clear();

  // parse the YAML.
  var job = function(t) {
    // Sadly, the YAML parser doesn't deal with comments nicely.
    var contentLines = [];
    var lines = txt.split("\n");
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].split("#", 2)[0].trim().length > 0) {
        contentLines.push(lines[i]);
      }
    }
    return window.YAML.parse(contentLines.join("\n"));
  }(txt);

  // Render the shapes which the cuts will be centered around.
  var cutShapes = new paper.Group();
  for (var i = 0; i < job.cuts.length; i++) {
    var cut = job.cuts[i];
    if (cut.points && cut.points.length > 0) {
      if (cut.type == "drill") {
        for (var k = 0; k < cut.points.length; k++) {
          var drillSpot = new paper.Shape.Circle(
            new paper.Point(cut.points[k]), job.bit_diameter / 2);
          drillSpot.strokeColor = "black";
          drillSpot.fillColor = "grey";
          cutShapes.addChild(drillSpot);
        }
      } else {
        var path = new paper.Path();
        path.moveTo(new paper.Point(cut.points[0]));
        for (var j = 1; j < cut.points.length; j++) {
          path.lineTo(new paper.Point(cut.points[j]));
        }
        cutShapes.addChild(path);
      }
    }

    if (cut.shape) {
      if (cut.shape.type == "circle") {
        cutShapes.addChild(new paper.Shape.Circle(
          new paper.Point(cut.shape.center), cut.shape.radius));
      } else if (cut.shape.type == "rectangle") {
        cutShapes.addChild(new paper.Shape.Rectangle(
          new paper.Point(cut.shape.origin), new paper.Size(cut.shape.size)));
      } else {
        console.log("unknown shape: " + cut.shape.type);
      }
    }

    if (cutShapes.lastChild) {
      cutShapes.lastChild.strokeColor = (cut.color !== undefined) ? cut.color : "black";
    }
  }

  // Invert everything (to move the origin to the bottom left).
  cutShapes.scale(1, -1);

  resizeView();

  // The view must be resized before setting the stroke width
  // so we know how wide to stroke.
  cutShapes.style.strokeWidth = 1 / paper.view.getZoom();

  paper.view.draw();
  console.timeEnd("render YAML");
}


function renderGcode(txt) {
  console.log("TODO: implement support for gcode");
}


function handleFile(file) {
  console.log("processing file: " + file.name);
  console.time("read file");
  var reader = new FileReader();
  reader.onloadend = function(evt) {
    if (evt.target.readyState == FileReader.DONE) {
      console.timeEnd("read file");

      // TODO: this should be endsWith, but that is not yet supported...
      if (file.name.indexOf(".yaml") != -1) {
        renderYaml(evt.target.result);
      } else if (file.name.indexOf(".gcode") != -1 || file.name.indexOf(".nc") != -1) {
        renderGcode(evt.target.result);
      } else {
        console.log("unknown file type");
      }
    }
  };
  reader.readAsText(file);
}


function setupDragDrop() {
  var dropZone = $("body")[0];
  dropZone.addEventListener('dragover', function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }, false);
  dropZone.addEventListener('drop', function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    console.log("file drop detected.");

    var files = [];
    if (evt.target.files) {
      files = evt.target.files; // FileList object
    } else if (evt.dataTransfer) {
      files = evt.dataTransfer.files; // FileList object.
    } else {
      console.log("unknown file input");
    }
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, false);
}

$(document).ready(function() {
  setupDragDrop();

	paper.setup(document.getElementById('myCanvas'));

  // Listen for updates from our main page.
  window.addEventListener("message", function(event) {
    console.log("got a message from the heavens:\n" + event.data);
    renderYaml(event.data);
  }, false);

  // Update the viewport on resize.
  $(window).resize(function() {
    resizeView();
  });
});
