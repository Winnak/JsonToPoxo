# JsonToPoxo

Converts a JSON object into a Plain Old X Object, where X is a programming language

Currently only JSON to Csharp is supported.

## TODOs

* Hook up options so that things can be configured on the frontend.

* Check if array is uniformly typed.

* Type deduction by providing multiple examples

  If the user provides a list of objects, where some fields are sometimes null,
  JsonToPoxo should be able to use type information from objects where it's not
  null.

* Add unit tests

* Package JsonToPoxo separately so people can use it in their packages.

* Use the input to generate examples in the documentation of the Poxo.

* Add option to download a zipped version with one Poxo per file.

* Add more languages
