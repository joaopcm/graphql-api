import { AuthUser } from "./AuthUserInterface";
import { DataLoaders } from "./DataLoadersInterface";
import { DbConnection } from "./DbConnectionInterface";
import { RequestedFields } from "../graphql/ast/RequestedFields";

export interface ResolverContext {
  database?: DbConnection
  authorization?: string
  authUser?: AuthUser
  dataloaders?: DataLoaders
  requestedFields?: RequestedFields
}