import Papa from "papaparse";

export const writeCSV = async (data: any[], filename: string) => {
  const csv = Papa.unparse(data, {
    header: true,
    delimiter: "|",
  });

  await Bun.write(filename, csv, { createPath: true });
};