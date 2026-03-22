import { Injectable } from '@nestjs/common';

@Injectable()
export class GetCycleStatusUseCase {
  execute() {
    return {
      status: 'pending',
      trackedCycles: 0,
    } as const;
  }
}