import { StandardSchemaV1 } from '@standard-schema/spec';
import { Env, ValidationTargets, Context, TypedResponse, Input, MiddlewareHandler } from 'hono';

type HasUndefined<T> = undefined extends T ? true : false;
type TOrPromiseOfT<T> = T | Promise<T>;
type Hook<T, E extends Env, P extends string, Target extends keyof ValidationTargets = keyof ValidationTargets, O = {}> = (result: ({
    success: true;
    data: T;
} | {
    success: false;
    error: ReadonlyArray<StandardSchemaV1.Issue>;
    data: T;
}) & {
    target: Target;
}, c: Context<E, P>) => TOrPromiseOfT<Response | void | TypedResponse<O>>;
declare const sValidator: <Schema extends StandardSchemaV1, Target extends keyof ValidationTargets, E extends Env, P extends string, In = StandardSchemaV1.InferInput<Schema>, Out = StandardSchemaV1.InferOutput<Schema>, I extends Input = {
    in: HasUndefined<In> extends true ? { [K in Target]?: In extends ValidationTargets[K] ? In : { [K2 in keyof In]?: ValidationTargets[K][K2]; }; } : { [K in Target]: In extends ValidationTargets[K] ? In : { [K2 in keyof In]: ValidationTargets[K][K2]; }; };
    out: { [K in Target]: Out; };
}, V extends I = I>(target: Target, schema: Schema, hook?: Hook<StandardSchemaV1.InferOutput<Schema>, E, P, Target>) => MiddlewareHandler<E, P, V>;

export { type Hook, sValidator };
