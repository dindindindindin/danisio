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
    isLater(req.body.to, req.body.from)
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
    const intervals = await query(
      `SELECT day, begins, ends FROM time_intervals INNER JOIN days ON days.id = time_intervals.day_id WHERE user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve intervals error" });
    return;
  }

  console.log(intervals);
}
