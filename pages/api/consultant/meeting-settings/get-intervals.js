import query from "../../../../db";
const admin = require("../../../../fbAdmin.config");

const stringToTimeString = (hour, min) => {
  let date = new Date();
  date.setHours(parseInt(hour), parseInt(min));
  return date.toTimeString();
};

export default async function getIntervals(req, res) {
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

  try {
    //retrieve intervals
    var intervals = await query(
      `SELECT id, hour_begins, min_begins, hour_ends, min_ends, priority_id FROM time_intervals WHERE user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve interval error" });
    return;
  }

  let intervalsArr = [];

  //for each interval
  for (let i = 0; i < intervals.length; i++) {
    try {
      //retrieve dayIds
      var dayIdsRes = await query(
        `SELECT day_id FROM time_interval_days WHERE time_interval_id = ${intervals[i].id};`
      );
    } catch (err) {
      res.status(500).json({ error: "retrieve dayIds error" });
      return;
    }
    let dayIds = dayIdsRes.map((dayId) => dayId.day_id);

    try {
      //retrieve exclusions
      var exclusionsRes = await query(
        `SELECT hour_begins, min_begins, hour_ends, min_ends FROM time_exclusions WHERE time_interval_id = ${intervals[i].id};`
      );
    } catch (err) {
      res.status(500).json({ error: "retrieve exclusions error" });
      return;
    }

    //parse exclusionsRes to time
    const exclusions = exclusionsRes.map((exclusion) => ({
      begins: stringToTimeString(exclusion.hour_begins, exclusion.min_begins),
      ends: stringToTimeString(exclusion.hour_ends, exclusion.min_ends),
    }));

    //create an object for response
    intervalsArr.push({
      id: intervals[i].id,
      begins: stringToTimeString(
        intervals[i].hour_begins,
        intervals[i].min_begins
      ),
      ends: stringToTimeString(intervals[i].hour_ends, intervals[i].min_ends),
      priority: intervals[i].priority_id,
      days: dayIds,
      exclusions: exclusions,
    });
  }

  res.status(200).json(intervalsArr);
}
