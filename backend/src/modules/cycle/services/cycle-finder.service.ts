import { Injectable } from '@nestjs/common';

import { GetCycleStatusUseCase } from '@/modules/cycle/use-cases/get-cycle-status.use-case';

@Injectable()
export class CycleFinderService {
  constructor(private readonly getCycleStatusUseCase: GetCycleStatusUseCase) {}

  getStatus() {
    return this.getCycleStatusUseCase.execute();
  }
}