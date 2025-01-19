import * as cheerio from "cheerio";
import type {
  ThaiLottoData,
  ThaiLottoDataWithDate,
  ThaiLottoScrapingService,
} from "./scraping.service";
import { ThaiTime } from "../utils/thai-time";

function normalizeSpaces(str: string) {
  return str.replace(/\s+/g, " ").trim();
}
function thaiDateToJsDate(thaiDateString: string) {
  // Map ของชื่อเดือนภาษาไทยเป็นตัวเลข
  const thaiMonths: Record<string, number> = {
    มกราคม: 0, // January (0-based index in JS)
    กุมภาพันธ์: 1, // February
    มีนาคม: 2, // March
    เมษายน: 3, // April
    พฤษภาคม: 4, // May
    มิถุนายน: 5, // June
    กรกฎาคม: 6, // July
    สิงหาคม: 7, // August
    กันยายน: 8, // September
    ตุลาคม: 9, // October
    พฤศจิกายน: 10, // November
    ธันวาคม: 11, // December
  };

  // แยกส่วนประกอบของวันที่
  const parts = normalizeSpaces(thaiDateString).split(" ");
  if (parts.length !== 3) {
    throw new Error(
      'รูปแบบวันที่ไม่ถูกต้อง. ต้องอยู่ในรูปแบบ "วัน เดือน ปี" เช่น "17 มกราคม 2568"'
    );
  }

  const day = parseInt(parts[0], 10);
  const month = thaiMonths[parts[1]];
  const yearBE = parseInt(parts[2], 10);

  // แปลงปีพุทธศักราชเป็นคริสต์ศักราช (ลบด้วย 543)
  const yearCE = yearBE - 543;

  // สร้าง Date object
  const date = new Date(yearCE, month, day);

  // ตรวจสอบความถูกต้องของวันที่
  if (isNaN(date.getTime())) {
    throw new Error("วันที่ไม่ถูกต้อง");
  }

  return date;
}

export class MyHoraScrapingService implements ThaiLottoScrapingService {
  private readonly mainPage = "https://myhora.com/หวย/";

  private async fetchPage(url: string): Promise<cheerio.CheerioAPI> {
    const response = await fetch(url);
    const html = await response.text();
    return cheerio.load(html);
  }
  async getPreviousDate(): Promise<Date | null> {
    const $ = await this.fetchPage(this.mainPage);
    const date = $(
      "#container > div.content-main-fullwidth > div:nth-child(9) > div.lotto-left > div:nth-child(9) > h3"
    ).text();
    const regex = /งวดวันที่\s+(.*)/;
    const output: Date | null = null;
    const match = date.match(regex);
    if (!match) {
      return output;
    }
    if (match.length < 2) {
      return output;
    }
    const result = match[1];
    return new Date(thaiDateToJsDate(result));
  }
  async getCurrentDate(): Promise<Date | null> {
    const $ = await this.fetchPage(this.mainPage);
    const date = $(
      "#container > div.content-main-fullwidth > div:nth-child(9) > div.lotto-left > div:nth-child(3) > a"
    ).text();
    return new Date(thaiDateToJsDate(date));
  }
  async getDates(): Promise<Date[]> {
    const $ = await this.fetchPage(this.mainPage);
    const listYearsElement = $(
      "#container > div.content-main-fullwidth > div:nth-child(9) > div.lotto-left > div.mb-15"
    ).children();

    const dates: Date[] = [];
    for (let i = 0; i < listYearsElement.length; i++) {
      const text = listYearsElement.eq(i).text();
      const year = parseInt(text.replaceAll("ตรวจหวย ", ""), 10);
      if (!Number.isNaN(year)) {
        const yearDates = await this.getDatesByYear(year - 543);
        dates.push(...yearDates);
      }
    }
    return dates;
  }
  async getDatesByYear(year: number): Promise<Date[]> {
    const thaiYear = year + 543;
    const url = `https://myhora.com/หวย/ปี-${thaiYear}.aspx`;
    const $ = await this.fetchPage(url);
    const listDatesElement = $("#dl_lottery_stats_list > tbody").children();

    const dates: Date[] = [];
    for (let i = 0; i < listDatesElement.length; i++) {
      const date = $(
        `#dl_lottery_stats_list > tbody > tr:nth-child(${
          i + 1
        }) > td > a > font`
      )
        .text()
        .replaceAll("ตรวจสลากกินแบ่งรัฐบาล งวด ", "");
      dates.push(new Date(thaiDateToJsDate(date.trim())));
    }
    return dates;
  }
  async getLottoDataByDate(date: Date): Promise<ThaiLottoData | null> {
    const thaiTime = new ThaiTime(date);
    const url = thaiTime.format("https://myhora.com/หวย/งวด-D-MMMMT-BBBB.aspx");
    const $ = await this.fetchPage(url);
    const data: ThaiLottoData = {
      firstPrize: "",
      nearFirstPrize: [],
      secondPrize: [],
      thirdPrize: [],
      fourthPrize: [],
      fifthPrize: [],
      firstThreeDigits: [],
      lastThreeDigits: [],
      twoDigits: [],
    };

    // main lotto
    const mainLotto = "#main_lotto > div.lot-dr";
    const firstMainElement = $(`${mainLotto} > div:nth-child(1)`).text();
    data.firstPrize = firstMainElement;
    const secondMainElement = $(`${mainLotto} > div:nth-child(2)`).text();
    if (secondMainElement && secondMainElement.length > 0) {
      data.firstThreeDigits = secondMainElement.split(" ");
    }
    const thirdMainElement = $(`${mainLotto} > div:nth-child(3)`).text();
    data.lastThreeDigits = thirdMainElement.split(" ");
    const fourthMainElement = $(`${mainLotto} > div:nth-child(4)`).text();
    data.twoDigits = fourthMainElement.split(" ");

    // near first prize
    const nearFirstPrizeElement = $(
      `#p_result2 > div:nth-child(1) > div.lot-cw70.lotto-fx`
    ).text();
    if (nearFirstPrizeElement && nearFirstPrizeElement.length > 0) {
      data.nearFirstPrize = nearFirstPrizeElement
        .split(" ")
        .filter((x) => x.trim().length > 0);
    }

    // second prize
    const secondPrizeSection = "#p_result2 > div:nth-child(5)";
    const totalSecondPrizeElement = $(secondPrizeSection).children().length;
    for (let i = 1; i <= totalSecondPrizeElement; i++) {
      const secondPrizeElement = $(
        `${secondPrizeSection} > div:nth-child(${i})`
      ).text();
      data.secondPrize.push(secondPrizeElement);
    }

    // third prize
    const thirdPrizeSection = "#p_result2 > div:nth-child(9)";
    const totalThirdPrizeElement = $(thirdPrizeSection).children().length;
    for (let i = 1; i <= totalThirdPrizeElement; i++) {
      const thirdPrizeElement = $(
        `${thirdPrizeSection} > div:nth-child(${i})`
      ).text();
      data.thirdPrize.push(thirdPrizeElement);
    }

    // fourth prize
    const fourthPrizeSection = "#p_result2 > div:nth-child(13)";
    const totalFourthPrizeElement = $(fourthPrizeSection).children().length;
    for (let i = 1; i <= totalFourthPrizeElement; i++) {
      const fourthPrizeElement = $(
        `${fourthPrizeSection} > div:nth-child(${i})`
      ).text();
      data.fourthPrize.push(fourthPrizeElement);
    }

    // fifth prize
    const fifthPrizeSection = "#p_result2 > div:nth-child(17)";
    const totalFifthPrizeElement = $(fifthPrizeSection).children().length;
    for (let i = 1; i <= totalFifthPrizeElement; i++) {
      const fifthPrizeElement = $(
        `${fifthPrizeSection} > div:nth-child(${i})`
      ).text();
      data.fifthPrize.push(fifthPrizeElement);
    }
    return data;
  }
  async getLottoDataByPrevious(): Promise<ThaiLottoData | null> {
    const date = await this.getPreviousDate();
    if (!date) {
      return null;
    }
    return this.getLottoDataByDate(date);
  }
  async getByYear(year: number): Promise<ThaiLottoDataWithDate[]> {
    const dates = await this.getDatesByYear(year);
    const results: ThaiLottoDataWithDate[] = [];
    for (const date of dates) {
      const data = await this.getLottoDataByDate(date);
      if (data) {
        results.push({ date, ...data });
      }
    }
    return results;
  }
  async getByMonth(
    // start with 1
    month: number,
    year: number
  ): Promise<ThaiLottoDataWithDate[]> {
    let dates = await this.getDatesByYear(year);
    dates = dates.filter((date) => date.getMonth() + 1 === month);

    const results: ThaiLottoDataWithDate[] = [];

    for (const date of dates) {
      const data = await this.getLottoDataByDate(date);
      if (data) {
        results.push({ date, ...data });
      }
    }

    return results;
  }

  async getAll(): Promise<ThaiLottoDataWithDate[]> {
    const results: ThaiLottoDataWithDate[] = [];
    const dates = await this.getDates();
    for (const date of dates) {
      const data = await this.getLottoDataByDate(date);
      if (data) {
        results.push({ date, ...data });
      }
    }

    return results;
  }
}
