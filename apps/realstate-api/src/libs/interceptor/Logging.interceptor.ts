
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger:Logger = new Logger();
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const recordTime = Date.now();
    const requesType = context.getType<GqlContextType>();
    if(requesType === "http") {
       /* Develop if needed */ 
    } else if(requesType === "graphql"){
         /* (1) Print request */ 
        const gqlContext = GqlExecutionContext.create(context);
         this.logger.log(`${this.stringify(gqlContext.getContext().req.body)}`, `REQUEST`);
         /* (2) Errors handing via Graphql */ 
         /* (3) No Errors , Giving response below */ 
     return next.handle() .pipe(
        tap((context) => {
            const responseTime = Date.now() - recordTime;
            this.logger.log(`${this.stringify(context)} - ${responseTime}ms \n\n`, `RESPONSE`)
        }),
      );
        
  }
    }

    private stringify(context: GqlExecutionContext):string {
        return JSON.stringify(context).slice(0, 75);
    }
}
