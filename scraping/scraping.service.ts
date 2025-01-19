export type ThaiLottoData = {
  firstPrize: string;
  nearFirstPrize: string[];
  secondPrize: string[];
  thirdPrize: string[];
  fourthPrize: string[];
  fifthPrize: string[];
  firstThreeDigits: string[];
  lastThreeDigits: string[];
  twoDigits: string[];
};

export type ThaiLottoDataWithDate = { date: Date } & ThaiLottoData;

export abstract class ThaiLottoScrapingService {
  abstract getPreviousDate(): string | Promise<Date | null>;
  abstract getCurrentDate(): string | Promise<Date | null>;
  abstract getDates(): string[] | Promise<Date[]>;
  abstract getDatesByYear(year: number): string[] | Promise<Date[]>;
  abstract getLottoDataByDate(date: Date): ThaiLottoData | Promise<ThaiLottoData | null>;
  abstract getLottoDataByPrevious(): ThaiLottoData | Promise<ThaiLottoData | null>;
  abstract getByYear(year: number): ThaiLottoDataWithDate[] | Promise<ThaiLottoDataWithDate[]>;
  abstract getByMonth(month: number, year: number): ThaiLottoDataWithDate[] | Promise<ThaiLottoDataWithDate[]>;
  abstract getAll(): ThaiLottoDataWithDate[] | Promise<ThaiLottoDataWithDate[]>;
}
