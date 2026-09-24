import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      service: "creative-academy-api",
      timestamp: new Date().toISOString(),
      uptimeSec: Math.round(process.uptime()),
    };
  }
}