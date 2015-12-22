# metal-cli

Command line tools for metal (e.g. build, soy).

## Install

```sh
$ npm install --global metal-cli
```

## Commands

### build

```sh
$ metal build
```

Builds Metal.js code, compiling soy files and transpiling ES6 to ES5 for example. The default output format is **globals**, but that can be be changed via params, just like many other options. For more details, run `$ metal build --help`.

### soy

```sh
$ metal soy
```

Compiling soy files and automatically makes them export generated components. For more details, run `$ metal soy --help`.
