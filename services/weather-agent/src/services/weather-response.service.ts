import type { InvokeBody, InvokeResponse } from "../schemas/invoke.schema";

export class WeatherResponseService {
  public createResponse(request: InvokeBody): InvokeResponse {
    const normalized = request.query.toLowerCase();
    const location = normalized.includes("berlin")
      ? "Berlin"
      : normalized.includes("london")
      ? "London"
      : request.query;

    return {
      location,
      temperature: location.toLowerCase().includes("london") ? "16C" : "18C",
      condition: location.toLowerCase().includes("london") ? "Rainy" : "Cloudy"
    };
  }
}
