import query from "../../../../db";
const admin = require("../../../../fbAdmin.config");

//is value a valid time?
const isValueValid = (value) => {
  if (value instanceof Date)
    if (
      value.getHours() <= 24 &&
      value.getHours() >= 0 &&
      value.getMinutes() <= 59 &&
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
  console.log("from: ", from, " to: ", to);
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
    var intervals = await query(
      `SELECT day, begins, ends FROM time_intervals INNER JOIN days ON days.id = time_intervals.day_id WHERE user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve intervals error" });
    return;
  }

  console.log(intervals);

  for (let i = 0; i < intervals.length; i++) {
    for (let j = 0; j < req.body.days.length; j++) {
      //if there's a same day interval
      if (intervals[i].day === req.body.days[j]) {
        if (
          //if from is between other intervals
          (isLaterOrEqual(intervals[i].from, req.body.from) &&
            isLaterOrEqual(req.body.from, intervals[i].to)) ||
          //if to is between other intervals
          (isLaterOrEqual(intervals[i].from, req.body.to) &&
            isLaterOrEqual(req.body.to, intervals[i].to)) ||
          //if from and to encompasses other intervals
          (isLaterOrEqual(req.body.from, intervals[i].from) &&
            isLaterOrEqual(intervalsp[i].to, req.body.to))
        ) {
          res
            .status(500)
            .json({ error: "collision error", errorCode: "collision" });
          return;
        }
      }
    }
  }

  let addedIntervalIds = [];

  req.body.days.map(async (dayId) => {
    try {
      //insert the interval
      await query(
        `INSERT INTO time_intervals (user_id, day_id, hour_begins, min_begins, hour_ends, min_ends, priority) VALUES (${
          userId[0].id
        }, ${dayId}, '${req.body.from.getHours()}', '${req.body.from.getMinutes()}', '${req.body.to.getHours()}', '${req.body.to.getMinutes()}', '${
          req.body.priority
        }');`
      );
    } catch (err) {
      res.status(500).json({ error: "insert interval error" });
      return;
    }

    try {
      //retrieve its id
      var addedIntervalId = await query(
        `SELECT id FROM time_intervals WHERE user_id = ${
          userId[0].id
        } AND day_id = ${dayId} AND hour_begins = '${req.body.from.getHours()}' AND min_begins = '${req.body.from.getMinutes()}' AND hour_ends = '${req.body.to.getHours()}' AND min_ends = '${req.body.to.getMinutes()}';`
      );
    } catch (err) {
      res.status(500).json({ error: "retrieve interval id error" });
      return;
    }

    //store the ids
    addedIntervalIds.push(addedIntervalId[0].id);
  });

  try {
    //for each interval insert exclusions
    addedIntervalIds.map(async (intervalId) => {
      req.body.exclusions.map(async (exclusion) => {
        await query(
          `INSERT INTO time_exclusions (time_interval_id, hour_begins, min_begins, hour_ends, min_ends) VALUES (${intervalId}, '${exclusion.from.getHours()}', '${exclusion.from.getMinutes()}' '${exclusion.to.getHours()}' '${exclusion.to.getMinutes()}');`
        );
      });
    });
  } catch (err) {
    res.status(500).json({ error: "insert exclusion error" });
    return;
  }
}
