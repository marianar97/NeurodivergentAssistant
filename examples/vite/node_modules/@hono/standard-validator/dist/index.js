// src/index.ts
import { validator } from "hono/validator";
var sValidator = (target, schema, hook) => (
  // @ts-expect-error not typed well
  validator(target, async (value, c) => {
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
export {
  sValidator
};
