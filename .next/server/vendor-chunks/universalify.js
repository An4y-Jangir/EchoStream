"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/universalify";
exports.ids = ["vendor-chunks/universalify"];
exports.modules = {

/***/ "(rsc)/./node_modules/universalify/index.js":
/*!********************************************!*\
  !*** ./node_modules/universalify/index.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n\nexports.fromCallback = function (fn) {\n  return Object.defineProperty(function () {\n    if (typeof arguments[arguments.length - 1] === 'function') fn.apply(this, arguments)\n    else {\n      return new Promise((resolve, reject) => {\n        arguments[arguments.length] = (err, res) => {\n          if (err) return reject(err)\n          resolve(res)\n        }\n        arguments.length++\n        fn.apply(this, arguments)\n      })\n    }\n  }, 'name', { value: fn.name })\n}\n\nexports.fromPromise = function (fn) {\n  return Object.defineProperty(function () {\n    const cb = arguments[arguments.length - 1]\n    if (typeof cb !== 'function') return fn.apply(this, arguments)\n    else {\n      delete arguments[arguments.length - 1]\n      arguments.length--\n      fn.apply(this, arguments).then(r => cb(null, r), cb)\n    }\n  }, 'name', { value: fn.name })\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvdW5pdmVyc2FsaWZ5L2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFZOztBQUVaLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLEdBQUcsWUFBWSxnQkFBZ0I7QUFDL0I7O0FBRUEsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLFlBQVksZ0JBQWdCO0FBQy9CIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbXVzaWMtcGxheWVyLy4vbm9kZV9tb2R1bGVzL3VuaXZlcnNhbGlmeS9pbmRleC5qcz80N2Q1Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLmZyb21DYWxsYmFjayA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV0gPT09ICdmdW5jdGlvbicpIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoXSA9IChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHJldHVybiByZWplY3QoZXJyKVxuICAgICAgICAgIHJlc29sdmUocmVzKVxuICAgICAgICB9XG4gICAgICAgIGFyZ3VtZW50cy5sZW5ndGgrK1xuICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICB9KVxuICAgIH1cbiAgfSwgJ25hbWUnLCB7IHZhbHVlOiBmbi5uYW1lIH0pXG59XG5cbmV4cG9ydHMuZnJvbVByb21pc2UgPSBmdW5jdGlvbiAoZm4pIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgY2IgPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdXG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICBlbHNlIHtcbiAgICAgIGRlbGV0ZSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdXG4gICAgICBhcmd1bWVudHMubGVuZ3RoLS1cbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykudGhlbihyID0+IGNiKG51bGwsIHIpLCBjYilcbiAgICB9XG4gIH0sICduYW1lJywgeyB2YWx1ZTogZm4ubmFtZSB9KVxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/universalify/index.js\n");

/***/ })

};
;