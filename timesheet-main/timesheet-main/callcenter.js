// const { Client } = require("pg");
// const ExcelJS = require("exceljs");
// const zodiac = require("zodiac-ts");
// var _ = require('lodash');
// const moment = require("moment");
// const { weekdays } = require("moment");
// var alpha = 0.5;
const MaxAccuracy = 0.00001

function Agents(SLA, ServiceTime, CallsPerHour, AHT) {

     let BirthRate, DeathRate, TrafficRate
     let Erlangs, Utilisation, C, SLQueued
     let NoAgents, MaxIterate, Count
     let Server

     try {
          if (SLA > 1) SLA = 1

          BirthRate = CallsPerHour
          DeathRate = 3600 / AHT

          TrafficRate = BirthRate / DeathRate

          Erlangs = Math.trunc((BirthRate * (AHT)) / 3600 + 0.5)

          if (Erlangs < 1) NoAgents = 1;
          else NoAgents = Math.floor(Erlangs);

          Utilisation = TrafficRate / NoAgents

          while (Utilisation >= 1) {
               NoAgents = NoAgents + 1
               Utilisation = TrafficRate / NoAgents
          }

          MaxIterate = NoAgents * 100

          for (let index = 1; index <= MaxIterate; index++) {
               Utilisation = TrafficRate / NoAgents
               if (Utilisation < 1) {
                    Server = NoAgents
                    C = ErlangC(Server, TrafficRate)

                    SLQueued = 1 - C * Math.exp((TrafficRate - Server) * ServiceTime / AHT)
                    if (SLQueued < 0) SLQueued = 0
                    if (SLQueued >= SLA) Count = MaxIterate

                    if (SLQueued > (1 - MaxAccuracy)) Count = MaxIterate
               }
               if (Count != MaxIterate) NoAgents = NoAgents + 1

          }

     } catch (error) {
          console.log(error)
          NoAgents = 0

     }

     return NoAgents
}

function ErlangC(Servers, Intensity) {

     let B, C;
     try {
          if ((Servers < 0) || (Intensity < 0)) {
               return 0;
          }
          B = ErlangB(Servers, Intensity)
          C = B / (((Intensity / Servers) * B) + (1 - (Intensity / Servers)))
     } catch (error) {
          console.log(error)
          C = 0
     }

     return MinMax(C, 0, 1)
}

function ErlangB(Servers, Intensity) {

     let Val, Last, B;
     let MaxIterate;

     try {
          if ((Servers < 0) || (Intensity < 0)) {
               return 0
          }

          MaxIterate = Math.trunc(Servers)
          Val = Intensity
          Last = 1
          for (let Count = 0; Count <= MaxIterate; Count++) {
               B = (Val * Last) / (Count + (Val * Last))
               Last = B
          }
     } catch (error) {
          console.log(error)
          B = 0
     }

     return MinMax(B, 0, 1);
}

function MinMax(val, _min, _max) {
     let result = val
     if (val < _min) result = _min;
     if (val > _max) result = _max;
     return result
}

// async function processData() {

//      const client = new Client({
//           host: "localhost",
//           port: 5432,
//           database: "callcenter",
//           password: "admin",
//           user: "postgres",
//      });

//      await client.connect();
//      let data = await client.query(
//           "SELECT  day, week_day, week_number, hour, received, answered, total_time FROM public.data_company_1 ",
//      );
//      let received_by_weekday = await client.query(
//           "SELECT week_day, received FROM public.sum_received_by_week_day;",
//      );

//      let received_by_weeknumber = await client.query(
//           " SELECT week_number,\
//         received\
//        FROM public.sum_received_by_week_number",
//      );

//      let hour_distribution = await client.query(
//           'select hd.week_day, hd.hour, (hd.dist * wd.dist)::numeric(10,4) as  dist, hd.aht  from hour_distribution hd left join week_day_distribution wd \
//         on hd.week_day = wd.week_day'
//      );


//      await client.end();
//      received_by_weekday = received_by_weekday.rows
//      data = data.rows
//      hour_distribution = hour_distribution.rows
//      received_by_weeknumber.rows.pop();
//      weeknumbers = received_by_weeknumber.rows.map((e) => {
//           return +e.week_number
//      })
//      received_by_weeknumber = received_by_weeknumber.rows.map((e) => {
//           return +e.received
//      })
//      const total_received = _.sumBy(received_by_weekday, function (e) { return +e.received })

//      received_by_weekday.forEach(element => {
//           element.received = +element.received
//           element.dist = element.received / total_received
//      });
//      var des = new zodiac.DoubleExponentialSmoothing(received_by_weeknumber, alpha);
//      //const optimizedAlpha = des.optimizeParameter(20);
//      //des = new zodiac.DoubleExponentialSmoothing(received_by_weeknumber, optimizedAlpha);

//      let number_week_forcast = 10;

//      forecast = des.predict(number_week_forcast + 1).map((e) => Math.round(e))


//      //console.log(hour_distribution);

//      let max_date = _.maxBy(data, function (o) { return o.day; })
//      let max_week = max_date.week_number
//      max_date = moment(max_date.day);

//      let final_result = []

//      const workbook = new ExcelJS.Workbook();
//      const worksheet = workbook.addWorksheet('My Sheet');
//      const forecast_sheet = workbook.addWorksheet('Forecast value');

//      forecast_sheet.getColumn(3).values = [
//           'Forecast vlue',
//           ...forecast
//      ]
//      forecast_sheet.getColumn(1).values = [
//           'Weeknumber',
//           ...weeknumbers
//      ]
//      forecast_sheet.getColumn(2).values = [
//           'Real data',
//           ...received_by_weeknumber
//      ]

//      worksheet.addRow([
//           'Data',
//           'Day of the week',
//           'Week number',
//           'Hour',
//           'Dist',
//           'Forecasted received calls',
//           'AHT',
//           'Agent hours']);

//      for (i = 1; i <= (number_week_forcast * 7); i++) {
//           for (let h = 9; h < 19; h++) {
//                const today = moment(max_date).add(i, 'days')
//                if (today.day() > 5 || today.day() < 1) continue;
//                hour_dist = _.find(hour_distribution, { 'week_day': today.day() - 1, 'hour': h })
//                let new_row = [
//                     today.format('DD/MM/YYYY'),
//                     weekdays(today.day()),
//                     today.week(),
//                     h,
//                     +hour_dist.dist,
//                     Math.round(+forecast[received_by_weeknumber.length + today.week() - max_week - 1] * (+hour_dist.dist)),
//                     +hour_dist.aht,
//                ];
//                new_row.push(Math.round(Agents(0.7, 30, new_row[5], new_row[6]) / (1 - 0.15)));

//                worksheet.addRow(new_row);
//           }
//      }

//      await workbook.xlsx.writeFile('result_company_1.xlsx');
//      console.log("oki");

// }

(async function () {
     // await processData();
     console.log(Agents(0.7, 30, 87, 705) )
})();