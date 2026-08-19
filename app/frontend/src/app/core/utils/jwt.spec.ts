import { describe, it, expect } from "vitest"
import { decodeJwtPayload } from "./jwt"

function fakeJwt(payload: object): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', type: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.fake-signature`;
}

describe('decodeJwtPayload', () => {
    it('decodes a well-formed token payload', () => {
        const token = fakeJwt({ sub: 'maria.alvarez@clouddesk.io', role: 'ADMIN' });
        const claims = decodeJwtPayload<{ sub: string, role: string }>(token);

        expect(claims).toEqual({ sub: 'maria.alvarez@clouddesk.io', role: 'ADMIN' });
    }),
        it('returns null for a token with invalid base64 in the payload segment', () => {
            expect(decodeJwtPayload("invalid-jwt")).toBeNull();
        }),
        it('return null for a token that is not three dot-separated segments', () => {
            expect(decodeJwtPayload('header.%%%not-base64%%%.signature')).toBeNull;
        })
});