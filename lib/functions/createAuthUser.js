import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loggedInUser, logout } from "../../redux/userSlice";
import { auth } from "../../firebase.config";

function createAuthUser() {
  const dispatch = useDispatch();

  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult();

        const dbRes = await axios.post(
          "/api/create-or-get-user",
          {},
          { headers: { authtoken: idTokenResult.token } }
        );
        console.log("create or get user res (withAuthUser): ", dbRes);

        dispatch(
          loggedInUser({
            id: dbRes.data.id,
            email: dbRes.data.email,
            role: dbRes.data.role,
            token: idTokenResult.token,
          })
        );

        return dbRes.data;
      } else {
        dispatch(logout());
        console.log("user is not logged in. (withAuthUser)");
        return null;
      }
    });
  } catch (err) {
    console.log(err.message);
  }
}
export default createAuthUser;
