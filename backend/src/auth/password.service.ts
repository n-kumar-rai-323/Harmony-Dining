import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

const COST = 12;

// A real bcrypt hash of a random string, used to keep verify() timing
// roughly constant when the account does not exist (anti-enumeration).
const DUMMY_HASH = '$2b$12$aBcDeFgHiJkLmNoPqRsTuOeImnAbCdEfGhIjKlMnOpQrStUvWxYz1';

@Injectable()
export class PasswordService {
  hash(plain: string): Promise<string> {
    return hash(plain, COST);
  }

  async verify(plain: string, hashOrNull: string | null): Promise<boolean> {
    if (!hashOrNull) {
      // Spend comparable time, then fail.
      await compare(plain, DUMMY_HASH);
      return false;
    }
    return compare(plain, hashOrNull);
  }

  /** Basic strength gate; the DTO also enforces length. */
  isStrongEnough(plain: string): boolean {
    return (
      plain.length >= 10 &&
      /[a-z]/.test(plain) &&
      /[A-Z]/.test(plain) &&
      /[0-9]/.test(plain)
    );
  }
}
