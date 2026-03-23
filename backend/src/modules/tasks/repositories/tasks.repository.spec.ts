import assert from 'node:assert/strict';
import test from 'node:test';

import { TasksRepository } from '@/modules/tasks/repositories/tasks.repository';

function createRepositoryWithDb(db: Record<string, unknown>) {
  return new TasksRepository({ db } as never);
}

test('createTask persists checklist items using the created task id', async () => {
  const insertCalls: unknown[] = [];
  const tx = {
    insert(table: unknown) {
      return {
        values(value: unknown) {
          insertCalls.push({ table, value });

          return {
            async returning() {
              if (insertCalls.length === 1) {
                return [{ id: 'task-1' }];
              }

              return value;
            },
          };
        },
      };
    },
  };
  const db = {
    transaction: async (callback: (transactionClient: typeof tx) => Promise<unknown>) => callback(tx),
  };

  const repository = createRepositoryWithDb(db);
  const result = await repository.createTask({ userId: 'user-1' } as never, [
    { isDone: false, label: 'Revisar indexes', position: 0 },
    { isDone: true, label: 'Rodar em staging', position: 1 },
  ]);

  assert.equal(insertCalls.length, 2);
  const secondInsert = insertCalls[1] as { table: unknown; value: unknown };
  assert.ok(secondInsert.table);
  assert.deepEqual(secondInsert.value, [
    { isDone: false, label: 'Revisar indexes', position: 0, taskId: 'task-1' },
    { isDone: true, label: 'Rodar em staging', position: 1, taskId: 'task-1' },
  ]);
  assert.equal(result.task?.id, 'task-1');
});

test('replaceChecklist clears previous rows before inserting the next ordered checklist', async () => {
  const deleteCalls: string[] = [];
  const insertValues: unknown[] = [];
  const tx = {
    delete() {
      return {
        where() {
          deleteCalls.push('deleted');
          return Promise.resolve();
        },
      };
    },
    insert() {
      return {
        values(value: unknown) {
          insertValues.push(value);

          return {
            async returning() {
              return value;
            },
          };
        },
      };
    },
  };
  const db = {
    transaction: async (callback: (transactionClient: typeof tx) => Promise<unknown>) => callback(tx),
  };

  const repository = createRepositoryWithDb(db);
  const result = await repository.replaceChecklist('task-1', [
    { isDone: false, label: 'Atualizar notas', position: 0 },
  ]);

  assert.equal(deleteCalls.length, 1);
  assert.deepEqual(insertValues[0], [{ isDone: false, label: 'Atualizar notas', position: 0, taskId: 'task-1' }]);
  assert.deepEqual(result, [{ isDone: false, label: 'Atualizar notas', position: 0, taskId: 'task-1' }]);
});