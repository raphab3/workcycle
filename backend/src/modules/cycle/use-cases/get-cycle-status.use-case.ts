import { Injectable } from '@nestjs/common';

import { createTodayContractStatus } from '@/modules/cycle/types/today';

@Injectable()
export class GetCycleStatusUseCase {
  execute() {
    return createTodayContractStatus();
  }
}