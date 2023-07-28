
select count("CALL_ID") as received, sum("IND_ANSWERED") as answered, sum( coalesce("CALL_TIME", 0) + coalesce("HOLD_TIME", 0) + coalesce("WRAP_UP_TIME", 0)) as total 
, "QUEUE_NAME" , DATE("CALL_DT") as "date", extract('hour' from "CALL_DT") as hour, extract(isodow from "CALL_DT")-1 as week_day ,extract('week' from "CALL_DT") as week,extract('month' from "CALL_DT") as month
from calls_data_2021 where "CALL_PROFILE" = 'INBOUND' and extract('year' from "CALL_DT") > 2020
group by "QUEUE_NAME",extract('day' from "CALL_DT"),extract('hour' from "CALL_DT") , extract(isodow from "CALL_DT")-1,extract('week' from "CALL_DT"),extract('month' from "CALL_DT"),DATE("CALL_DT")
order by date desc