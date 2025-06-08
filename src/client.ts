import { FetchHttpClient } from '@effect/platform'
import {
  RpcClient,
  RpcGroup,
  RpcMiddleware,
  RpcSerialization,
} from '@effect/rpc'
import { Console, Effect, Layer } from 'effect'
import { MyMiddleware, MyRPCs } from './schema.js'

const program = Effect.gen(function*() {
  const client = yield* RpcClient.make(
    RpcGroup.make().merge(MyRPCs),
  ).pipe(
    Effect.provide(RpcMiddleware.layerClient(
      MyMiddleware,
      ({ request }) =>
        Effect.succeed({
          ...request,
          headers: request.headers,
        }),
    )),
  )

  yield* client.Test()
}).pipe(
  Effect.tapError((err) => Console.log(err)),
  Effect.timeout('5 seconds'),
  Effect.scoped,
  Effect.provide(
    RpcClient.layerProtocolHttp({ url: 'http://localhost:3000' }).pipe(
      Layer.provide([
        FetchHttpClient.layer,
        RpcSerialization.layerNdjson,
      ]),
    ),
  ),
)

await Effect.runPromise(program)
