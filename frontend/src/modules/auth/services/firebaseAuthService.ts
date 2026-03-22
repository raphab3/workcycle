'use client';

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';

import { isFirebaseClientConfigured } from '@/config/env';
import { getFirebaseAuth } from '@/lib/firebase';

async function loginWithEmail(input: { email: string; password: string }) {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), input.email, input.password);

  return credential.user.getIdToken();
}

async function registerWithEmail(input: { displayName: string; email: string; password: string }) {
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), input.email, input.password);

  if (input.displayName.trim()) {
    await updateProfile(credential.user, {
      displayName: input.displayName.trim(),
    });
  }

  return credential.user.getIdToken(true);
}

async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const credential = await signInWithPopup(getFirebaseAuth(), provider);

  return credential.user.getIdToken();
}

export const firebaseAuthService = {
  isEnabled: () => isFirebaseClientConfigured,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
};