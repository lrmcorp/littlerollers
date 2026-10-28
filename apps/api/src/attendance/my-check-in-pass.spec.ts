import { AttendanceController } from './attendance.controller';
import { buildPass, parsePass, passBelongsTo } from './check-in-pass';

describe('GET /me/check-in-pass', () => {
  const controller = new AttendanceController({} as never);
  const minta = (userId: string) =>
    controller.myCheckInPass({ principal: { userId } } as never);

  it('memberi pass milik akun yang sedang masuk', () => {
    const { pass } = minta('user-a');

    expect(pass).toBe(buildPass('user-a'));
    expect(passBelongsTo('user-a', parsePass(pass)!)).toBe(true);
  });

  it('tidak bisa dipakai untuk mendapatkan pass orang lain', () => {
    const { pass } = minta('user-a');

    expect(passBelongsTo('user-b', parsePass(pass)!)).toBe(false);
  });

  it('selalu sama untuk akun yang sama, sehingga cukup disimpan sekali', () => {
    expect(minta('user-a').pass).toBe(minta('user-a').pass);
  });
});
