import { HttpServer } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { ConfigProvider, Console, Effect, Layer } from 'effect'
import { Dep, MyError, MyMiddleware, MyRPCs } from './schema.js'

const RpcsLive = MyRPCs.toLayer(
  Effect.gen(function*() {
    const handler = yield* MyRPCs.accessHandler('Test').pipe(
      Effect.provide(
        MyRPCs.toLayerHandler('Test', () =>
          Effect.gen(function*() {
            yield* Console.log('test')
          })),
      ),
    )

    return {
      Test: handler,
    }
  }),
)

const MyMiddlewareLive: Layer.Layer<MyMiddleware, never, Dep> = Layer.effect(
  MyMiddleware,
  Effect.gen(function*() {
    yield* Dep

    return MyMiddleware.of(() =>
      Effect.gen(function*() {
        // REMOVE THIS AND IT WORKS
        yield* Effect.sleep('1 second')

        yield* Console.log('FRAUD')

        return yield* Effect.fail(new MyError())
      })
    )
  }),
)

const { handler } = RpcServer.toWebHandler(MyRPCs, {
  layer: Layer.mergeAll(
    Layer.provideMerge(
      Layer.mergeAll(
        RpcsLive,
        Layer.provideMerge(
          MyMiddlewareLive,
          Layer.succeed(Dep, void 0),
        ),
      ),
      Layer.setConfigProvider(ConfigProvider.fromMap(new Map([]))),
    ),
    RpcSerialization.layerNdjson,
    HttpServer.layerContext,
  ),
})

// Back to Bun serve
const port = Number(process.env.PORT) || 3000

Bun.serve({
  port,
  fetch: async (request) => {
    const response = await handler(request)
    console.log('Request handled')
    return response
  },
})

console.log(`🚀 Server running at http://localhost:${port}`)
