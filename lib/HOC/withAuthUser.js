import { useState } from "react";
import createAuthUser from "../functions/createAuthUser";

export default function withAuthUser(WrappedComponent) {
  return function WithAuthUser(props) {
    //   const [loading, setLoading] = useState(false);
    //   setLoading(true);
    const authUser = createAuthUser();
    //  setLoading(false);
    console.log("withAuthUser user: ", authUser);
    return <WrappedComponent authUser={authUser} {...props} />;
  };
}
