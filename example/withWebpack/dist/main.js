/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./main.js":
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("\nconst EventWorker = __webpack_require__(/*! event-worker */ \"./node_modules/event-worker/index.js\");\n\nconst sumWorker = new EventWorker(\"sumWorker.js\");\nconst multiplierWorker = new EventWorker(\"multiplyWorker.js\");\nconst dividerWorker = new EventWorker(async mainThread => {\n  mainThread.on(\"divide\", ({payload}) => {\n    return payload.a / payload.b\n  })\n});\n\n( async function() {\n\nlet sumResult = await sumWorker.emit(\"sum\", {a: 2, b: 4});\n\nlet multiplyResult = await multiplierWorker.emit(\"multiply\", {a: sumResult, b: 4});\n\nlet divideResult = await dividerWorker.emit(\"divide\", {a: multiplyResult, b: 6})\n\nconsole.log(`2+4=[${sumResult}] and ${sumResult}*4=[${multiplyResult}] and ${multiplyResult}/6=[${divideResult}]`);\n\n})();\n\n\n\n\n\n\n\n\n//# sourceURL=webpack:///./main.js?");

/***/ }),

/***/ "./node_modules/event-worker/index.js":
/*!********************************************!*\
  !*** ./node_modules/event-worker/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval(";(function innerSelf () {\n  const _newId = ((id = 0) => () => id += 1)()\n\n  const _newEventId = (eventName) => `${_newId()}_${eventName}_`\n\n  const _onMessage = (fn) => ({data}) => {\n    const [id, eventName, error, payload] = data\n    fn.call(fn, id, eventName, error, payload)\n  }\n\n  const _fromFuncToURL = (func) => {\n    const codeToInject = `\n       ${_wrapSelfExecFn(innerSelf + '')}\n       ${_wrapSelfExecFn(func + '', 'new EventWorker()')}\n      `\n    return window.URL.createObjectURL(new Blob([codeToInject]))\n  }\n\n  const _wrapSelfExecFn = (str, params = '') => `;(${str})(${params});`\n\n  const _isFunc = (test) => test instanceof Function\n\n  const _isString = (test) => typeof test === 'string'\n\n  const _createResponseBundle = Symbol('_createResponseBundle')\n  const _createRejectBundle = Symbol('_createRejectBundle')\n  const _deleteCallback = Symbol('_deleteCallback')\n  const _onIncomingMessage = Symbol('_onIncomingMessage')\n\n  function destroyCircular(from, seen) {\n    const to = Array.isArray(from) ? [] : {};\n  \n    seen.push(from);\n  \n    for (const key of Object.keys(from)) {\n      const value = from[key];\n  \n      if (typeof value === 'function') {\n        continue;\n      }\n  \n      if (!value || typeof value !== 'object') {\n        to[key] = value;\n        continue;\n      }\n  \n      if (seen.indexOf(from[key]) === -1) {\n        to[key] = destroyCircular(from[key], seen.slice(0));\n        continue;\n      }\n  \n      to[key] = '[Circular]';\n    }\n  \n    if (typeof from.name === 'string') {\n      to.name = from.name;\n    }\n  \n    if (typeof from.message === 'string') {\n      to.message = from.message;\n    }\n  \n    if (typeof from.stack === 'string') {\n      to.stack = from.stack;\n    }\n  \n    return to;\n  }\n\n  class EventWorker {\n    constructor (opts) {\n      this.callbacks = {}\n      this.terminated = false\n      // if opts is undefined, I assume the environment is the worker\n      this.worker = opts && Object.getPrototypeOf(opts) === Worker.prototype ? opts\n        : _isFunc(opts) ? new Worker(_fromFuncToURL(opts))\n        : (_isString(opts) ? new Worker(opts) : self)\n      this.worker.onmessage = this[_onIncomingMessage]()\n    }\n\n    emit (eventName, payload) {\n      return new Promise((resolve, reject) => {\n        const eventId = _newEventId(eventName)\n\n        this.on(eventId, ({payload, error}) => {\n          this[_deleteCallback](eventId)\n          if (error) return reject(JSON.parse(error))\n          resolve(payload)\n        })\n\n        this[_createResponseBundle](eventId, eventName)(payload)\n      })\n    }\n\n    on (id, callback) {\n      this.callbacks[id] = callback\n      return this\n    }\n\n    terminate () {\n      (this.worker.terminate) ? this.worker.terminate() : close()\n      this.terminated = true\n    }\n\n    [_onIncomingMessage] () {\n      return _onMessage(async (messageId, eventName, error, payload) => {\n        const responseBundle = this[_createResponseBundle](messageId, eventName)\n        const rejectBundle = this[_createRejectBundle](messageId, eventName)\n        const callback = this.callbacks[messageId] || this.callbacks[eventName]\n\n        if (!callback) return\n\n        try {\n          const res = await callback(error ? { error } : { payload})\n          if (res === undefined || error) return\n          responseBundle(res)\n        } catch (error) {\n          rejectBundle(JSON.stringify(destroyCircular(error,[])))\n        }\n      })\n    }\n\n    [_deleteCallback] (id) {\n      delete this.callbacks[id]\n    }\n\n    [_createResponseBundle] (messageId, eventName) {\n      return (payload) => this.worker.postMessage([messageId, eventName, undefined, payload])\n    }\n\n    [_createRejectBundle] (messageId, eventName) {\n      return (error) => this.worker.postMessage([messageId, eventName, error])\n    }\n  }\n\n  if (typeof module !== 'undefined' && module.exports) {\n    module.exports = EventWorker\n  } else if (typeof window !== 'undefined') {\n    window.EventWorker = document.EventWorker = EventWorker\n  } else {\n    self.EventWorker = EventWorker\n  }\n})()\n\n\n//# sourceURL=webpack:///./node_modules/event-worker/index.js?");

/***/ })

/******/ });