const Excel = require("exceljs");
const types = require("./types");
const moment = require("moment");
const { Client } = require("pg");
const filepart = 'data/CBI Data 20211208/';
const { readdir } = require("fs");
const { promisify } = require("util");
function nextLetter(s) {
    if (s === "Z") return "AA";
    return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function (a) {
        var c = a.charCodeAt(0);
        switch (c) {
            case 90:
                return "A";
            case 122:
                return "a";
            default:
                return String.fromCharCode(++c);
        }
    });
}

function getValue(e) {
    if (e.value == null) return e.value
    return e.value.result || e.value;
}

async function importData(file, importedMonths) {
    console.log(file)

    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(file);
    const months = workbook.worksheets
        .filter(
            (sheet) =>
                !["Dropdown", "INSTRUCTIONS", "For Reference Only"].includes(
                    sheet.name
                )
        )
        .map((sheet) => sheet.name.trim());

    const works = [];
    for (const month of months) {
        if (!importedMonths.includes(month)) continue;

        const sheet = workbook.getWorksheet(month);
        const workerName = getValue(sheet.getCell("C2"));
        const team = getValue(sheet.getCell("C3"));
        const contractedHours = getValue(sheet.getCell("S2"))
        const position = getValue(sheet.getCell("C4"))
        const type_of_contract = getValue(sheet.getCell("C5"))
        const rows = {};
        var start_absences = 0;
        var end_absences = 0;
        for (let i = 1; i < sheet.rowCount; i++) {
            const type = types.find(
                (type) => sheet.getCell(`B${i}`).value ? (type.name === sheet.getCell(`B${i}`).value.toString().trim().toLowerCase()) : null
            );
            if (type) {
                rows[type.key] = i;
            }
            if (sheet.getCell(`B${i}`).value === "ABSENCES")
                start_absences = i;
            if (sheet.getCell(`B${i}`).value === "Total Absences")
                end_absences = i;
        }

        for (const row in rows) {
            let key = rows[row] + 1;
            while (sheet.getCell(`B${key}`).value !== "Total") {
                if (sheet.getCell(`B${key}`).value) {
                    const days = moment().month(month).year(2021).daysInMonth();
                    let day = 1;
                    let col = "C";
                    const workName = getValue(sheet.getCell(`B${key}`));
                    const logs = [];
                    while (day <= days) {
                        if ((+sheet.getCell(`${col}${key}`).value) > 0)
                            logs.push({
                                date: getValue(sheet.getCell(`${col}${11}`)),
                                weekday: getValue(sheet.getCell(`${col}${10}`)),
                                hour: +sheet.getCell(`${col}${key}`).value,
                            });
                        day++;
                        col = nextLetter(col);
                    }
                    works.push({
                        work_name: workName,
                        type: row,
                        logs,
                        worker: workerName,
                        team,
                        contractedHours,
                        file,
                        position,
                        type_of_contract
                    });
                }
                key++;
            }
        }

        if (end_absences > start_absences) {
            for (let key = start_absences + 1; key < end_absences; key++) {
                if (sheet.getCell(`B${key}`).value) {
                    const days = moment().month(month).year(2021).daysInMonth();
                    let day = 1;
                    let col = "C";
                    const workName =
                        sheet.getCell(`B${key}`).value.result ||
                        sheet.getCell(`B${key}`).value;
                    const logs = [];
                    while (day <= days) {
                        if ((+sheet.getCell(`${col}${key}`).value) > 0)
                            logs.push({
                                date: sheet.getCell(`${col}${11}`).value.result,
                                weekday: sheet.getCell(`${col}${10}`).value.result,
                                hour: +sheet.getCell(`${col}${key}`).value,
                            });
                        day++;
                        col = nextLetter(col);
                    }
                    works.push({
                        work_name: workName,
                        type: 'absences',
                        logs,
                        worker: workerName,
                        team,
                        contractedHours,
                        file,
                        position,
                        type_of_contract
                    });
                }
            }
        }
    }

    const workbook_result = new Excel.Workbook();
    await workbook_result.xlsx.readFile(filepart+'result.xlsx');
    const worksheet = workbook_result.getWorksheet('Worklogs')

    for (const work of works) {
        for (const log of work.logs) {
            let new_row =
                [
                    log.date,
                    log.weekday,
                    work.team,
                    work.worker,
                    work.contractedHours,
                    work.type,
                    work.work_name,
                    log.hour,
                    work.file,
                    work.position,
                    work.type_of_contract
                ];
            worksheet.addRow(new_row);
        }
    }
    await workbook_result.xlsx.writeFile(filepart+'result.xlsx');
}

(async function () {

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Worklogs');
    worksheet.addRow([
        'date',
        'weekday',
        'team',
        'name',
        'contracted_hours',
        'type',
        'work_name',
        'hour',
        'file_name',
        'position',
        'type_of_contract'
    ]);
    await workbook.xlsx.writeFile(filepart+'result.xlsx');

    // await importData("data/CBI Data 20211208/Aug 2021/Geoff Pearce CBI August 2021.xlsx", ["August"]);

    // const files1 = await promisify(readdir)("data/CBI Data 20211208/Apr 2021");

    // for (const file of files1) {
    //     await importData("data/CBI Data 20211208/Apr 2021/" + file, ["April"]);
    // }

   
    // const files3 = await promisify(readdir)("data/CBI Data 20211208/February 2021");

    // for (const file of files3) {
    //     await importData(filepart+ "February 2021/" + file, ["February"]);
    // }

    const files4 = await promisify(readdir)("data/CBI Data 20211208/July 2021");

    for (const file of files4) {
        await importData("data/CBI Data 20211208/July 2021/" + file, ["July"]);
    }

    // const files9 = await promisify(readdir)("data/CBI Data 20211208/Jun 2021");

    // for (const file of files9) {
    //     await importData("data/CBI Data 20211208/Jun 2021/" + file, ["June"]);
    // }

    // const files5 = await promisify(readdir)("data/CBI Data 20211208/March 2021");

    // for (const file of files5) {
    //     await importData("data/CBI Data 20211208/March 2021/" + file, ["March"]);
    // }

    const files6 = await promisify(readdir)("data/CBI Data 20211208/November 2021");

    for (const file of files6) {
        await importData("data/CBI Data 20211208/November 2021/" + file, ["November"]);
    }

    const files2 = await promisify(readdir)("data/CBI Data 20211208/August 2021");

    for (const file of files2) {
        await importData("data/CBI Data 20211208/August 2021/" + file, ["August"]);
    }


    const files7 = await promisify(readdir)("data/CBI Data 20211208/October 2021");

    for (const file of files7) {
        await importData(filepart+ "October 2021/" + file, ["October"]);
    }

    const files8 = await promisify(readdir)("data/CBI Data 20211208/September 2021");

    for (const file of files8) {
        await importData(filepart+ "September 2021/" + file, ["September"]);
    }

})();