import { MyTime } from './my-time';

export class ThaiTime extends MyTime {
  public constructor(dateTime?: Date | string | number) {
    super(7, dateTime);
  }
  public static createByYMD(y: number, m: number, d: number) {
    return new ThaiTime(
      `${y.toString().padStart(4, '0')}-${m
        .toString()
        .padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
    );
  }
  public static override isValidDate(s: string): boolean {
    if (!s || s.length !== 10) return false;
    const tmp = s.split('/').join('-');

    return new ThaiTime(s).YYYY_MM_DD() === tmp;
  }
  public static override isValidTime(s: string): boolean {
    if (!s || (s.length !== 5 && s.length !== 8 && s.length !== 12)) {
      return false;
    }
    // eslint-disable-next-line no-nested-ternary
    let tmp = s.length === 5 ? `${s}:00.000` : s.length === 8 ? `${s}.000` : s;
    tmp = `${tmp.substring(0, 8)}.${tmp.substring(9)}`;
    return new ThaiTime(`2020-01-01 ${s}`).HH_NN_SS_ZZZ() === tmp;
  }
  public static override isValidDateTime(s: string): boolean {
    if (
      !s ||
      (s.length !== 11 + 5 && s.length !== 11 + 8 && s.length !== 11 + 12)
    ) {
      return false;
    }
    return (
      s.charAt(10) === ' ' &&
      this.isValidDate(s.substring(0, 10)) &&
      this.isValidTime(s.substring(11))
    );
  }
}
