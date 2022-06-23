const admin = require("../../fbAdmin.config");
import query from "../../db";

export function withMemberAuth(ssrf) {
  return async (context) => {
    //if no token redirect
    if (!context.req.cookies.idToken) {
      return {
        redirect: {
          destination: "/account",
        },
      };
    }

    //token check
    try {
      const firebaseUser = await admin
        .auth()
        .verifyIdToken(context.req.cookies.idToken);
      context.req.user = firebaseUser;
    } catch {
      return {
        redirect: {
          destination: "/",
        },
      };
    }

    // Continue on to call `getServerSideProps` logic
    return await ssrf(context);
  };
}

export function withConsultantAuth(ssrf) {
  return async (context) => {
    console.log("inside withConsultantAuth");
    let error = false;

    //if no token redirect
    if (!context.req.cookies.idToken) {
      return {
        redirect: {
          destination: "/account",
        },
      };
    }

    //token check
    try {
      var firebaseUser = await admin
        .auth()
        .verifyIdToken(context.req.cookies.idToken);
      context.req.user = firebaseUser;
    } catch {
      error = true;
      console.log("withConsultantAuth token error");
      return await ssrf(context, error);
    }

    //retrieve user info from db
    try {
      var user = await query(
        `SELECT * FROM users WHERE email = '${firebaseUser.email}';`
      );
    } catch (err) {
      error = true;
      console.log("withConsultantAuth db fetch error");
      return await ssrf(context, error);
    }

    //if not consultant redirect
    if (user[0].role !== "consultant") {
      error = true;
      console.log("withConsultantAuth not a consultant");
      return await ssrf(context, error);
    }

    // Continue on to call `getServerSideProps` logic
    return await ssrf(context, error);
  };
}
