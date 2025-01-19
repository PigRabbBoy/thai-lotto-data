import { MyHoraScrapingService } from "./scraping/myhora.service";


const myhora = new MyHoraScrapingService();

const result = await myhora.getByYear(2024);
console.log(result);