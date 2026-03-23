import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { cert, getApp, getApps, initializeApp, type App, type ServiceAccount } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

import { env } from '@/shared/config';

const FIREBASE_APP_NAME = 'workcycle-backend';

function hasExplicitFirebaseConfig() {
  return Boolean(
    env.FIREBASE_CLIENT_EMAIL
    || env.FIREBASE_PRIVATE_KEY
    || env.FIREBASE_PROJECT_ID
    || env.FIREBASE_SERVICE_ACCOUNT_JSON
    || env.FIREBASE_SERVICE_ACCOUNT_PATH,
  );
}

function normalizePrivateKey(privateKey: string | undefined) {
  return privateKey?.replace(/\\n/g, '\n');
}

interface FirebaseServiceAccountInput {
  clientEmail?: string | undefined;
  privateKey?: string | undefined;
  projectId?: string | undefined;
}

function ensureServiceAccountFields(serviceAccount: FirebaseServiceAccountInput): ServiceAccount {
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('Invalid Firebase Admin configuration. Provide a service account JSON, path, or project/client/private key trio.');
  }

  return {
    clientEmail: serviceAccount.clientEmail,
    privateKey: serviceAccount.privateKey,
    projectId: serviceAccount.projectId,
  };
}

function buildServiceAccountFromJson(rawJson: string) {
  const serviceAccount = JSON.parse(rawJson) as ServiceAccount & {
    client_email?: string;
    private_key?: string;
    project_id?: string;
  };

  return ensureServiceAccountFields({
    clientEmail: serviceAccount.clientEmail ?? serviceAccount.client_email,
    privateKey: normalizePrivateKey(serviceAccount.privateKey ?? serviceAccount.private_key),
    projectId: serviceAccount.projectId ?? serviceAccount.project_id,
  });
}

function resolveServiceAccountPath(configuredPath: string) {
  const normalizedRelativePath = configuredPath.replace(/^[.][\\/]/, '');
  const candidatePaths = isAbsolute(configuredPath)
    ? [configuredPath]
    : [
        resolve(process.cwd(), configuredPath),
        resolve(process.cwd(), '..', normalizedRelativePath),
      ];

  return candidatePaths.find((candidatePath) => existsSync(candidatePath)) ?? null;
}

function buildServiceAccount() {
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return buildServiceAccountFromJson(env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  if (env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const resolvedPath = resolveServiceAccountPath(env.FIREBASE_SERVICE_ACCOUNT_PATH);

    if (resolvedPath) {
      const rawJson = readFileSync(resolvedPath, 'utf-8');

      return buildServiceAccountFromJson(rawJson);
    }
  }

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    return null;
  }

  return ensureServiceAccountFields({
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: normalizePrivateKey(env.FIREBASE_PRIVATE_KEY),
    projectId: env.FIREBASE_PROJECT_ID,
  });
}

@Injectable()
export class FirebaseAdminService {
  private readonly app: App | null;

  constructor() {
    this.app = this.initializeApp();
  }

  isConfigured() {
    return Boolean(this.app);
  }

  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    if (!this.app) {
      throw new InternalServerErrorException('Firebase Admin is not configured.');
    }

    try {
      return await getAuth(this.app).verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Firebase token is invalid or expired.');
    }
  }

  private initializeApp() {
    if (!hasExplicitFirebaseConfig()) {
      return null;
    }

    const serviceAccount = buildServiceAccount();

    if (!serviceAccount) {
      throw new Error('Invalid Firebase Admin configuration. Provide a service account JSON, path, or project/client/private key trio.');
    }

    if (getApps().some((app) => app.name === FIREBASE_APP_NAME)) {
      return getApp(FIREBASE_APP_NAME);
    }

    return initializeApp(
      {
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId!,
      },
      FIREBASE_APP_NAME,
    );
  }
}