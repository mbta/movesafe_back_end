var fs = require("fs"); // eslint-disable-line

try {
  fs.readFile("scripts/txt/green_line_cars.txt", "utf-8", (err, data) => {
    let script: string =
      "INSERT INTO mbtadb.Cars (line_id, series_number, is_active) VALUES";

    const lines: string[] = data.split(/\r?\n/);

    lines.forEach((line) => {
      script += `("62ef8490-19dd-11ef-968b-0a7699ec4bfd", "${line}", 1), `;
    });

    script = script.slice(0, -2) + ";";

    console.log(script);
  });
} catch (e) {
  console.log(e);
}
