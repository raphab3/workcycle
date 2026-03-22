import { Controller, Get } from '@nestjs/common';

import { CycleFinderService } from '@/modules/cycle/services/cycle-finder.service';

@Controller('cycle')
export class CycleController {
  constructor(private readonly cycleFinderService: CycleFinderService) {}

  @Get('status')
  getStatus() {
    return this.cycleFinderService.getStatus();
  }
}