import Papa from "papaparse";

export const writeCSV = async (data: any[], filename: string) => {
  const csv = Papa.unparse(
    data.map((v) => {
      Object.keys(v).forEach((key) => {
        if (typeof v[key] === "object" || Array.isArray(v[key])) {
          v[key] = JSON.stringify(v[key]);
        }
      });
      return v;
    }),
    {
      header: true,
      delimiter: "|",
    }
  );

  await Bun.write(filename, csv, { createPath: true });
};
