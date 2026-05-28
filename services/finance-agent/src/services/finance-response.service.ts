import type { InvokeBody, InvokeResponse } from "../schemas/invoke.schema";

export class FinanceResponseService {
  public createResponse(request: InvokeBody): InvokeResponse {
    return {
      ticker: request.ticker.toUpperCase(),
      price: "213.52",
      currency: "USD"
    };
  }
}
