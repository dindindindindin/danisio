const admin = require("../../fbAdmin.config");
export function userAuth(ssrf) {
  return async (context) => {
    if (!context.req.cookies.idToken) {
      return {
        redirect: {
          destination: "/account",
        },
      };
    }
    try {
      const firebaseUser = await admin
        .auth()
        .verifyIdToken(context.req.cookies.idToken);
      context.req.user = firebaseUser;
    } catch {
      res.status(401).json({ err: "invalid or expired token" });
    }
    // Continue on to call `getServerSideProps` logic
    return await ssrf(context);
  };
}
