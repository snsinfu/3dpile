# Three-dimensional visualization of Abelian sandpile model

This repository contains the source of [a web page][page] that shows a
three-dimensional visualization of [Abelian sandpile model][sandpile] using
[Three.js][three].

[page]: https://snsinfu.github.io/3dpile/
[sandpile]: https://en.wikipedia.org/wiki/Abelian_sandpile_model
[three]: https://threejs.org/

## Usage

The instruction below uses [yarn][yarn]. Install dependencies and start a dev
server:

```console
$ yarn install
$ yarn snowpack dev
```

Then, open http://localhost:8080.

Or, you can `snowpack build` the app and serve it via a web server. The
following example uses Python's http.server module:

```console
$ yarn snowpack build
$ cd build
$ python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

[yarn]: https://yarnpkg.com/
