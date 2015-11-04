# opencut

opencut is a declarative CAM program for generating gcode for CNC
milling/routing machines by stating what cuts you would like to have made.

[YAML](http://yaml.org) is used to describe the cuts the machine should make in
a way which balances human readability and machine processing. Under the hood
the description of the cuts to make is connverted to a [JSON](http://www.json.org)
object and passed to the opencut API which in turn generates the
[gcode](https://en.wikipedia.org/wiki/G-code) which corresponds to the job.

### Example

    name: example_drink_coaster
    units: inch
    bit_diameter: 0.125
    feed_rate: 100
    plunge_rate: 10
    z_step_size: 1
    cuts:
    - type: profile
      side: outside
      depth: -0.25
      shape: {type: rectangle, origin: [0, 0], size: [4, 4]}
    - type: pocket
      depth: -0.1
      shape: {type: circle, center: [0, 0], radius: 1.5}


## Getting started

The easiest way to get started is to create a [YAML](http://yaml.org/)
description of your "job" in the
[built-in editor](http://sir-buckyball.github.io/opencut/src/index.html), then
press the compile button to download the gcode.

Advanced users may choose to pass a [JSON](http://www.json.org/) object directly
to the Javascript library. It is also possible to load in additional cut types.

    TODO: add demo links


## Documentation

    TODO: copy documentation here
