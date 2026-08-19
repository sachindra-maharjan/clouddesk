import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { TokenStorage } from './token-storage';

describe('TokenStorage', () => {
  let tokenStorage: TokenStorage;

  beforeEach(() => {
    tokenStorage = new TokenStorage();
    localStorage.clear();
  });

  it('return null when no token has been stored', () => {
    expect(tokenStorage.get).toBeNull;
  }),
    it('store and retrieve a token', () => {
      tokenStorage.set('signed-jwt-token');
      expect(tokenStorage.get()).toEqual('signed-jwt-token');
    }),
    it('clears a stored token', () => {
      tokenStorage.set("signed.jwt.token");
      tokenStorage.clear();

      expect(tokenStorage.get()).toBeNull();

    })



});
