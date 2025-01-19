export class MyTime {
  public epoch: number;
  public offsetDate: Date;
  public timeoffset: number;

  public static readonly SUNDAY = 0;
  public static readonly MONDAY = 1;
  public static readonly TUESDAY = 2;
  public static readonly WEDNESDAY = 3;
  public static readonly THURSDAY = 4;
  public static readonly FRIDAY = 5;
  public static readonly SATURDAY = 6;
  public static readonly DAY_EN =
    'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(',');
  public static readonly DAY_EN_ABBR = 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(',');
  public static readonly DAY_TH =
    'อาทิตย์,จันทร์,อังคาร,พุธ,พฤหัส,ศุกร์,เสาร์'.split(',');
  public static readonly DAY_TH_ABBR = 'อา.,จ.,อ.,พ.,พฤ.,ศ.,ส.'.split(',');
  public static readonly MONTH_EN =
    'January,February,March,April,May,June,July,August,September,October,November,December'.split(
      ',',
    );
  public static readonly MONTH_EN_ABBR =
    'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(',');
  public static readonly MONTH_TH =
    'มกราคม,กุมภาพันธ์,มีนาคม,เมษายน,พฤษภาคม,มิถุนายน,กรกฎาคม,สิงหาคม,กันยายน,ตุลาคม,พฤศจิกายน,ธันวาคม'.split(
      ',',
    );

  public static readonly MONTH_TH_ABBR =
    'ม.ค.,ก.พ.,มี.ค.,เม.ย.,พ.ค.,มิ.ย.,ก.ค.,ส.ค.,ก.ย.,ต.ค.,พ.ย.,ธ.ค.'.split(',');

  /**
   * m as 1-12
   */
  public static createByYMD(y: number, m: number, d: number, offset?: number) {
    return midasTime(
      offset ?? 0,
      `${y.toString().padStart(4, '0')}-${m
        .toString()
        .padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
    );
  }

  /**
   * m as 1-12
   * h as 0-23
   */
  public static createByYMDHNS(
    offset: number,
    y: number,
    m: number,
    d: number,
    h: number,
    n: number,
    s: number,
  ) {
    return midasTime(
      offset,
      `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d
        .toString()
        .padStart(2, '0')} ${h.toString().padStart(2, '0')}:${n
        .toString()
        .padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
    );
  }

  /**
   * @param s YYYY-MM-DD
   * @param s YYYY/MM/DD
   * @sample 2020-4-20 false
   * @sample 2020-04-20 true
   * @sample 2019-02-29 false
   * @sample 2020-02-29 true
   * @sample 2020/04/20 true
   */
  public static isValidDate(s: string, offset?: number): boolean {
    if (!s || s.length !== 10) return false;
    const tmp = s.split('/').join('-');
    return midasTime(offset ?? 0, s).YYYY_MM_DD() === tmp;
  }

  /**
   * @param s HH:NN
   * @param s HH:NN:ss
   * @param s HH:NN.ss.zzz
   * @sample 9:59 false
   * @sample 09:59 true
   * @sample 15:20 true
   * @sample 15:20:59 true
   * @sample 15:20:59 true
   * @sample 15:20:49:293 true
   * @sample 15:20:49.293 true
   * @sample 24:20:49:293 false
   */
  public static isValidTime(s: string, offset?: number): boolean {
    if (!s || (s.length !== 5 && s.length !== 8 && s.length !== 12)) {
      return false;
    }
    // eslint-disable-next-line no-nested-ternary
    let tmp = s.length === 5 ? `${s}:00.000` : s.length === 8 ? `${s}.000` : s;
    tmp = `${tmp.substring(0, 8)}.${tmp.substring(9)}`;
    return midasTime(offset ?? 0, `2020-01-01 ${s}`).HH_NN_SS_ZZZ() === tmp;
  }

  /**
   * @param s YYYY/MM/DD HH:NN
   * @param s YYYY/MM/DD HH:NN:ss
   * @param s YYYY/MM/DD HH:NN.ss.zzz
   * @sample 2020/04/20 5:20 false
   * @sample 2020/04/20 15:20 true
   * @sample 2020/04/16 15:20:59 true
   * @sample 2020/04/16 15:20:59.999 true
   */
  public static isValidDateTime(s: string, offset?: number): boolean {
    if (
      !s ||
      (s.length !== 11 + 5 && s.length !== 11 + 8 && s.length !== 11 + 12)
    ) {
      return false;
    }
    return (
      s.charAt(10) === ' ' &&
      this.isValidDate(s.substring(0, 10), offset ?? 0) &&
      this.isValidTime(s.substring(11), offset ?? 0)
    );
  }

  /**
   * @param dateTime as Date
   * @param dateTime as string, YYYY-MM-DD
   * @param dateTime as string, YYYY-MM-DD hh:nn
   * @param dateTime as string, YYYY-MM-DD hh:nn:ss
   * @param dateTime as string, YYYY-MM-DD hh:nn:ss.zzz
   * @param dateTime as string, ISOString
   * @param dateTime as number, as epoch
   */
  public constructor(offset: number, dateTime?: Date | string | number) {
    if (!dateTime) {
      this.epoch = new Date().getTime();
    } else if (dateTime instanceof Date) {
      this.epoch = dateTime.getTime();
    } else if (typeof dateTime === 'string') {
      if (
        dateTime.length === 24 &&
        dateTime.charAt(10) === 'T' &&
        dateTime.charAt(23) === 'Z'
      ) {
        // ISOString Date
        this.epoch = new Date(dateTime).getTime();
      } else {
        this.epoch = new Date(`${dateTime} GMT+0700`).getTime();
      }
    } else {
      this.epoch = dateTime;
    }
    this.timeoffset = offset;
    const localGMTOffset = -new Date().getTimezoneOffset() / 60;
    this.offsetDate = new Date(
      this.epoch + (this.timeoffset - localGMTOffset) * 60 * 60 * 1000,
    );
  }

  /**
   * @returns epoch
   */
  public getTime(): number {
    return this.epoch;
  }

  /**
   * @returns date object
   */
  public toDate(): Date {
    return new Date(this.epoch);
  }

  /**
   * @returns 2023-01-06T02:18:58.118Z
   */
  public toISOString(): string {
    return this.toDate().toISOString();
  }

  public YYYY_MM_DD(): string {
    const dt = this.offsetDate;
    return `${dt
      .getFullYear()
      .toString()
      .padStart(4, '0')}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }

  public HH_NN_SS(): string {
    const dt = this.offsetDate;
    return `${dt.getHours().toString().padStart(2, '0')}:${dt
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`;
  }

  public HH_NN_SS_ZZZ(): string {
    const dt = this.offsetDate;
    return `${dt.getHours().toString().padStart(2, '0')}:${dt
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}`;
  }

  public YYYY_MM_DD_HH_NN_SS(): string {
    const dt = this.offsetDate;
    return `${dt
      .getFullYear()
      .toString()
      .padStart(4, '0')}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt
      .getDate()
      .toString()
      .padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`;
  }

  public YYYY_MM_DD_HH_NN_SS_ZZZ(): string {
    const dt = this.offsetDate;
    return `${dt
      .getFullYear()
      .toString()
      .padStart(4, '0')}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt
      .getDate()
      .toString()
      .padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}`;
  }

  /**
   * @return 0 = Sunday
   */
  public dayOfWeek(): number {
    return this.offsetDate.getDay();
  }

  public year(): number {
    return this.offsetDate.getFullYear();
  }

  /**
   * @return month 1-12
   */
  public month(): number {
    return this.offsetDate.getMonth() + 1;
  }

  /**
   * @returns 1-31
   */
  public date(): number {
    return this.offsetDate.getDate();
  }

  /**
   * @returns 0-23
   */
  public hour(): number {
    return this.offsetDate.getHours();
  }

  public minute(): number {
    return this.offsetDate.getMinutes();
  }

  public second(): number {
    return this.offsetDate.getSeconds();
  }

  public millisecond(): number {
    return this.offsetDate.getMilliseconds();
  }

  public startOfDay() {
    return midasTime(this.timeoffset, this.YYYY_MM_DD());
  }

  public endOfDay() {
    return midasTime(this.timeoffset, this.YYYY_MM_DD()).addDay(1).addSec(-1);
  }

  public startOfMonth() {
    return MyTime.createByYMD(this.timeoffset, this.year(), this.month(), 1);
  }

  public addDay(n: number) {
    return midasTime(this.timeoffset, this.epoch + n * 1000 * 60 * 60 * 24);
  }

  public addHour(n: number) {
    return midasTime(this.timeoffset, this.epoch + n * 1000 * 60 * 60);
  }

  public addMinute(n: number) {
    return midasTime(this.timeoffset, this.epoch + n * 1000 * 60);
  }

  public addSec(n: number) {
    return midasTime(this.timeoffset, this.epoch + n * 1000);
  }

  public addMSec(n: number) {
    return midasTime(this.timeoffset, this.epoch + n);
  }

  /**
   * change the time part, preserve the date part.
   * @param timeStr 14:59
   * @param timeStr 14:59:59
   * @param timeStr 14:59:59:999
   */
  public changeTime(timeStr: string) {
    if (timeStr.length !== 12 && timeStr.length !== 8 && timeStr.length !== 5) {
      throw new Error('timeStr should be hh:nn or hh:nn:ss or hh:nn:ss.zzz');
    }
    const s = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    return midasTime(this.timeoffset, `${this.YYYY_MM_DD()} ${s}`);
  }

  /**
   * @sample dow DD MMM YYYY hh:nn:ss.zzz
   * @result Mon 05 Sep 2022 15:38:59.990
   * @pattern YYYY - 2022
   * @pattern YY - 22
   * @pattern BBBB - 2565 (Buddhist year)
   * @pattern BB - 65
   * @pattern MM - 09
   * @pattern M - 9
   * @pattern MMM - Sep
   * @pattern MMMM - September
   * @pattern MMMT - ก.ย.
   * @pattern MMMMT - กันยายน
   * @pattern DD - 05
   * @pattern D - 5
   * @pattern hh - 15
   * @pattern nn - 08
   * @pattern ss - 59
   * @pattern zzz - 990
   * @pattern DOW - Monday
   * @pattern dow - Mon
   * @pattern DOWT - จันทร์
   * @pattern dowt - จ.
   */
  public format(pattern?: string): string {
    if (!pattern) {
      return `${this.YYYY_MM_DD()}T${this.HH_NN_SS()}+07:00`;
    }
    return pattern
      .replace('BBBB', (this.year() + 543).toString().padStart(4, '0'))
      .replace(
        'BB',
        (this.year() + 543).toString().padStart(4, '0').substring(2),
      )
      .replace('YYYY', this.year().toString().padStart(4, '0'))
      .replace('YY', this.year().toString().padStart(4, '0').substring(2))
      .replace('DOWT', MyTime.DAY_TH[this.dayOfWeek()])
      .replace('dowt', MyTime.DAY_TH_ABBR[this.dayOfWeek()])
      .replace('DOW', '---1---')
      .replace('dow', '---2---')
      .replace('MMMMT', MyTime.MONTH_TH[this.month() - 1])
      .replace('MMMT', MyTime.MONTH_TH_ABBR[this.month() - 1])
      .replace('MMMM', '---3---')
      .replace('MMM', '---4---')
      .replace('MM', this.month().toString().padStart(2, '0'))
      .replace('M', this.month().toString())
      .replace('DD', this.date().toString().padStart(2, '0'))
      .replace('D', this.date().toString())
      .replace('hh', this.hour().toString().padStart(2, '0'))
      .replace('nn', this.minute().toString().padStart(2, '0'))
      .replace('ss', this.second().toString().padStart(2, '0'))
      .replace('zzz', this.millisecond().toString().padStart(3, '0'))
      .replace('---1---', MyTime.DAY_EN[this.dayOfWeek()])
      .replace('---2---', MyTime.DAY_EN_ABBR[this.dayOfWeek()])
      .replace('---3---', MyTime.MONTH_EN[this.month() - 1])
      .replace('---4---', MyTime.MONTH_EN_ABBR[this.month() - 1]);
  }
}

export const midasTime = (offset: number, dateTime?: Date | string | number) =>
  new MyTime(offset, dateTime);
