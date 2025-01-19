import { writeCSV } from "./csv/csv.service";
import { MyHoraScrapingService } from "./scraping/myhora.service";
import type {
  ThaiLottoData,
  ThaiLottoDataWithDate,
} from "./scraping/scraping.service";
import { ThaiTime } from "./utils/thai-time";

// getDates() จะ return ข้อมูลที่เป็น array ของ string ที่เป็นวันที่
const myhora = new MyHoraScrapingService();
const dates = await myhora.getDates();
const dataCSV1: Record<
  string,
  {
    date: string;
  }[]
> = {};

dataCSV1["all"] = [];
for (const date of dates) {
  const thaiTime = new ThaiTime(date);
  const year = thaiTime.format("YYYY");
  const yearThai = thaiTime.format("BBBB");

  dataCSV1["all"].push({
    date: thaiTime.YYYY_MM_DD(),
  });

  if (!dataCSV1[year]) {
    dataCSV1[year] = [];
  }
  dataCSV1[year].push({
    date: thaiTime.YYYY_MM_DD(),
  });

  if (!dataCSV1[yearThai]) {
    dataCSV1[yearThai] = [];
  }
  dataCSV1[yearThai].push({
    date: thaiTime.YYYY_MM_DD(),
  });
}

for (const key in dataCSV1) {
  await writeCSV(dataCSV1[key], `./data/date/${key}.csv`);
  await Bun.write(`./data/date/${key}.json`, JSON.stringify(dataCSV1[key]), {
    createPath: true,
  });
}

const list = await myhora.getAll();

const dataCSV2: Record<string, (ThaiLottoData & { date: string })[]> = {};
const dataJSON2: Record<string, string> = {};
dataCSV2["all"] = [];
for (const { date, ...data } of list) {
  const thaiTime = new ThaiTime(date);
  const year = thaiTime.format("YYYY");
  const yearThai = thaiTime.format("BBBB");
  const output = {
    date: thaiTime.YYYY_MM_DD(),
    ...data,
  };

  dataCSV2["all"].push(output);

  if (dataCSV2[year]) {
    dataCSV2[year].push(output);
  } else {
    dataCSV2[year] = [output];
  }

  if (dataCSV2[yearThai]) {
    dataCSV2[yearThai].push(output);
  } else {
    dataCSV2[yearThai] = [output];
  }
}

for (const key in dataCSV2) {
  await writeCSV(dataCSV2[key], `./data/result/${key}.csv`);
  await Bun.write(`./data/result/${key}.json`, JSON.stringify(dataCSV2[key]), {
    createPath: true,
  });
}
