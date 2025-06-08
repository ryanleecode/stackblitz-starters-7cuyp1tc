import { Rpc, RpcGroup, RpcMiddleware } from '@effect/rpc'
import { Context, Schema as S } from 'effect'

export class Dep extends Context.Tag('Dep')<
  Dep,
  void
>() {}

export class User extends S.Class<User>('User')({
  id: S.String.annotations({
    identifier: 'UserId',
    title: 'User ID',
    description: 'Unique identifier for the user in the system',
  }),
}) {}

export class CurrentUser extends Context.Tag('CurrentUser')<
  CurrentUser,
  User
>() {}

export class MyError extends S.TaggedClass<MyError>('MyError')('MyError', {}) {}
{}

export class MyMiddleware extends RpcMiddleware.Tag<MyMiddleware>()(
  'MyMiddleware',
  {
    provides: CurrentUser,
    failure: MyError,
    requiredForClient: true,
  },
) {}

export const MyRPCs = RpcGroup.make(
  Rpc.make('Test', {
    success: S.Void,
    payload: S.Struct({}),
  }),
).middleware(
  MyMiddleware,
)
