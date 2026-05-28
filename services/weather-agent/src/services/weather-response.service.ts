import type { InvokeBody, InvokeResponse } from "../schemas/invoke.schema";

export class WeatherResponseService {
  public createResponse(request: InvokeBody): InvokeResponse {
    const normalized = request.query.toLowerCase();
    if (normalized.includes("berlin")) {
      return {
        location: "Berlin",
        temperature: "18C",
        condition: "Cloudy"
      };
    }

    return {
      location: "Berlin",
      temperature: "18C",
      condition: "Cloudy"
    };
  }
}
