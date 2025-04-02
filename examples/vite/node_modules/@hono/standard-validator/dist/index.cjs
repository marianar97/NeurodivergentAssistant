"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  sValidator: () => sValidator
});
module.exports = __toCommonJS(src_exports);
var import_validator = require("hono/validator");
var sValidator = (target, schema, hook) => (
  // @ts-expect-error not typed well
  (0, import_validator.validator)(target, async (value, c) => {
    const result = await schema["~standard"].validate(value);
    if (hook) {
      const hookResult = await hook(
        result.issues ? { data: value, error: result.issues, success: false, target } : { data: value, success: true, target },
        c
      );
      if (hookResult) {
        if (hookResult instanceof Response) {
          return hookResult;
        }
        if ("response" in hookResult) {
          return hookResult.response;
        }
      }
    }
    if (result.issues) {
      return c.json({ data: value, error: result.issues, success: false }, 400);
    }
    return result.value;
  })
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sValidator
});
