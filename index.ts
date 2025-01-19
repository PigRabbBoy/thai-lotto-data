import { MyHoraScrapingService } from "./scraping/myhora.service";


const myhora = new MyHoraScrapingService();

await myhora.getDates();