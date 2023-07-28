const Excel = require("exceljs");
const types = require("./types");
const moment = require("moment");
const { Client } = require("pg");
const filepart = 'data/CBI Data 20211208/';
const { readdir } = require("fs");
const { promisify } = require("util");

async function importData(file) {

    console.log(file);

    const client = new Client({
        host: "localhost",
        port: 5432,
        database: "Calls",
        password: "admin",
        user: "postgres",
    });

    await client.connect();

    const workbook = new Excel.Workbook();
    await workbook.csv.readFile(file);
    const call_logs = [];
    const sheet = workbook.getWorksheet(1);

    for (let i = 1;i < sheet.rowCount;i++) {
        
        const res = await client.query(`INSERT INTO public.call_2022("CALL_ID", "CALL_INDEX", "COMPANY", "CALL_PROFILE", "CALL_DT", "QUEUE_NAME", "IND_ANSWERED", "WAIT_TIME",
         "CALL_TIME", "HOLD_TIME", "WRAP_UP_TIME", "ABANDON_TIME", "USER")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`, [
                sheet.getCell(`A${i + 1}`).value,
                sheet.getCell(`B${i + 1}`).value,
                sheet.getCell(`C${i + 1}`).value,
                sheet.getCell(`D${i + 1}`).value,
                sheet.getCell(`E${i + 1}`).value,
                sheet.getCell(`F${i + 1}`).value,
                sheet.getCell(`G${i + 1}`).value,
                sheet.getCell(`H${i + 1}`).value,
                sheet.getCell(`I${i + 1}`).value,
                sheet.getCell(`J${i + 1}`).value,
                sheet.getCell(`K${i + 1}`).value,
                sheet.getCell(`L${i + 1}`).value,
                sheet.getCell(`M${i + 1}`).value
            ])
    }

    await client.end();


}

(async function () {

    const files4 = await promisify(readdir)("C:/Users/anhph/_OK");

    for (const file of files4) {
        await importData("C:/Users/anhph/_OK/" + file);
    }
})();