import { Resolver, Query } from "@nestjs/graphql"


@Resolver()
export class AppResolver {
    @Query(() => String)
     sayHi() {
        return "Welcome to GraphQl API"
    }
}