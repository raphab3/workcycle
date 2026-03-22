import { Injectable } from '@nestjs/common';

import { QUEUE_NAMES, type QueueName } from '@/shared/providers/queues/queues.constants';

@Injectable()
export class QueuesService {
  listQueues(): QueueName[] {
    return Object.values(QUEUE_NAMES);
  }

  async enqueue(_queueName: QueueName, _payload: unknown) {
    void _queueName;
    void _payload;

    return;
  }
}