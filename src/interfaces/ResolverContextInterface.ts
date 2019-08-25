import { AuthUser } from "./AuthUserInterface";
import { DbConnection } from "./DbConnectionInterface";

export interface ResolverContext {
  database?: DbConnection
  authorization?: string
  authUser?: AuthUser
}