import query from "../../../../db";
const admin = require("../../../../fbAdmin.config");
import { toDate } from "date-fns";

//is value a valid time?
const isValueValid = (value) => {
  if (value instanceof Date)
    if (
      value.getHours() < 24 &&
      value.getHours() >= 0 &&
      value.getMinutes() < 60 &&
      value.getMinutes() >= 0
    )
      return true;
    else return false;
  else return false;
};

//is 'to' later than 'from'?
const isLater = (from, to) => {
  if (from instanceof Date && to instanceof Date) {
    if (from.getHours() < to.getHours()) {
      return true;
    } else if (from.getHours() == to.getHours()) {
      if (from.getMinutes() < to.getMinutes()) {
        return true;
      } else return false;
    } else return false;
  } else return false;
};

//is 'to' later than or equal to 'from'?
const isLaterOrEqual = (from, to) => {
  if (from instanceof Date && to instanceof Date) {
    if (from.getHours() < to.getHours()) {
      return true;
    } else if (from.getHours() == to.getHours()) {
      if (from.getMinutes() <= to.getMinutes()) {
        return true;
      } else return false;
    } else return false;
  } else return false;
};

const stringToTime = (hour, min) => {
  let date = new Date();
  date.setHours(parseInt(hour), parseInt(min));
  return date;
};

const reqStringToTime = (time) => {
  let date = new Date(time);
  return date;
};

export default async function newInterval(req, res) {
  //check token
  try {
    const firebaseUser = await admin.auth().verifyIdToken(req.cookies.idToken);

    req.user = firebaseUser;
  } catch (err) {
    res.status(401).json({ err: "invalid or expired token" });
    return;
  }

  //retrieve userId
  try {
    var userId = await query(
      `SELECT id FROM users WHERE email = '${req.user.email}';`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve userId error" });
    return;
  }

  req.body.from = reqStringToTime(req.body.from);
  req.body.to = reqStringToTime(req.body.to);
  for (let i = 0; i < req.body.exclusions.length; i++) {
    req.body.exclusions[i] = {
      from: reqStringToTime(req.body.exclusions[i].from),
      to: reqStringToTime(req.body.exclusions[i].to),
    };
  }

  if (
    //if no days selected and interval is not valid
    req.body.days.length === 0 ||
    !isValueValid(req.body.from) ||
    !isValueValid(req.body.to) ||
    isLater(req.body.to, req.body.from) //matches with ui function?
  ) {
    res.status(500).json({ error: "value check 1st gate error" });
    return;
  }

  //compare exclusions
  for (let i = 0; i < req.body.exclusions.length; i++) {
    if (
      //if exclusion is not valid
      !isValueValid(req.body.exclusions[i].from) ||
      !isValueValid(req.body.exclusions[i].to)
    ) {
      res.status(500).json({ error: "value check 2nd gate error" });
      return;
    }

    for (let j = 0; j < req.body.exclusions.length; j++) {
      //if it's not the same exclusion
      if (i !== j) {
        if (
          //if other exclusion is not valid
          !isValueValid(req.body.exclusions[j].from) ||
          !isValueValid(req.body.exclusions[j].to)
        ) {
          res.status(500).json({ error: "value check 3rd gate error" });
          return;
        }

        if (
          //if exclude from is between other exclusions
          (isLaterOrEqual(
            req.body.exclusions[j].from,
            req.body.exclusions[i].from
          ) &&
            isLaterOrEqual(
              req.body.exclusions[i].from,
              req.body.exclusions[j].to
            )) || //if exclude to is between other exclusions
          (isLaterOrEqual(
            req.body.exclusions[j].from,
            req.body.exclusions[i].to
          ) &&
            isLaterOrEqual(
              req.body.exclusions[i].to,
              req.body.exclusions[j].to
            )) || //if exclude from and to encompasses other exclusions
          (isLaterOrEqual(
            req.body.exclusions[i].from,
            req.body.exclusions[j].from
          ) &&
            isLaterOrEqual(
              req.body.exclusions[j].to,
              req.body.exclusions[i].to
            ))
        ) {
          res.status(500).json({ error: "value check 4th gate error" });
          return;
        }
      }
    }
  }
  try {
    //retrieve previous intervals for comparison
    var intervals = await query(
      `SELECT day_id, hour_begins, min_begins, hour_ends, min_ends FROM time_intervals INNER JOIN time_interval_days ON time_interval_days.time_interval_id = time_intervals.id WHERE user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve previous intervals error" });
    return;
  }

  for (let i = 0; i < intervals.length; i++) {
    for (let j = 0; j < req.body.days.length; j++) {
      //if there's a same day interval
      if (intervals[i].day_id == req.body.days[j]) {
        if (
          //if from is between other intervals
          (isLaterOrEqual(
            stringToTime(intervals[i].hour_begins, intervals[i].min_begins),
            req.body.from
          ) &&
            isLaterOrEqual(
              req.body.from,
              stringToTime(intervals[i].hour_ends, intervals[i].min_ends)
            )) ||
          //if to is between other intervals
          (isLaterOrEqual(
            stringToTime(intervals[i].hour_begins, intervals[i].min_begins),
            req.body.to
          ) &&
            isLaterOrEqual(
              req.body.to,
              stringToTime(intervals[i].hour_ends, intervals[i].min_ends)
            )) ||
          //if from and to encompasses other intervals
          (isLaterOrEqual(
            req.body.from,
            stringToTime(intervals[i].hour_begins, intervals[i].min_begins)
          ) &&
            isLaterOrEqual(
              stringToTime(intervals[i].hour_ends, intervals[i].min_ends),
              req.body.to
            ))
        ) {
          res
            .status(500)
            .json({ error: "collision error", errorCode: "collision" });
          return;
        }
      }
    }
  }

  try {
    //insert interval
    await query(
      `INSERT INTO time_intervals (user_id, hour_begins, min_begins, hour_ends, min_ends, priority_id) VALUES (${
        userId[0].id
      }, '${req.body.from.getHours()}', '${req.body.from.getMinutes()}', '${req.body.to.getHours()}', '${req.body.to.getMinutes()}', ${
        req.body.priority === "preferred" ? 0 : 1
      });`
    );
  } catch (err) {
    res.status(500).json({ error: "insert interval error" });
    return;
  }

  try {
    //retrieve its id
    var intervalId = await query(
      `SELECT id FROM time_intervals WHERE user_id = ${
        userId[0].id
      } AND hour_begins = '${req.body.from.getHours()}' AND min_begins = '${req.body.from.getMinutes()}' AND hour_ends = '${req.body.to.getHours()}' AND min_ends = '${req.body.to.getMinutes()}';`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve intervalId error" });
    return;
  }

  req.body.days.map(async (dayId) => {
    try {
      //insert the interval_days
      await query(
        `INSERT INTO time_interval_days (time_interval_id, day_id) VALUES (${intervalId[0].id}, ${dayId});`
      );
    } catch (err) {
      res.status(500).json({ error: "insert interval days error" });
      return;
    }
  });

  try {
    //insert exclusions
    req.body.exclusions.map(async (exclusion) => {
      await query(
        `INSERT INTO time_exclusions (time_interval_id, hour_begins, min_begins, hour_ends, min_ends) VALUES (${
          intervalId[0].id
        }, '${exclusion.from.getHours()}', '${exclusion.from.getMinutes()}', '${exclusion.to.getHours()}', '${exclusion.to.getMinutes()}');`
      );
    });
  } catch (err) {
    res.status(500).json({ error: "insert exclusions error" });
    return;
  }

  res.status(200).json({ success: "success" });
}
