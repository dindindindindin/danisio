import { useState } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MuiLink from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { useTranslation } from "next-i18next";
import { auth } from "../firebase.config";
import { useRouter } from "next/router";
import axios from "axios";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useDispatch } from "react-redux";
import { loggedInUser } from "../redux/userSlice";

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));
const Form = styled("form")(({ theme }) => ({
  width: "100%", // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));
const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const LoginForm = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("client side userCredential ", userCredential);
      const { user } = userCredential;
      const idTokenResult = await user.getIdTokenResult();

      const dbRes = await axios.post(
        "/api/create-or-get-user",
        {},
        { headers: { authtoken: idTokenResult.token } }
      );
      console.log("create or get user res: ", dbRes);

      dispatch(
        loggedInUser({
          id: dbRes.data.id,
          email: dbRes.data.email,
          role: dbRes.data.role,
          token: idTokenResult.token,
        })
      );

      setEmail("");
      setPassword("");
      setErrors({});
      setLoading(false);
      router.push("/");
    } catch (error) {
      const errorCode = error.code;
      setLoading(false);
      if (errorCode === "auth/invalid-email") {
        setErrors({ email: t("account.firebase.validemail") });
      } else if (errorCode === "auth/user-not-found") {
        setErrors({ password: t("account.firebase.usernotfound") });
      } else if (errorCode === "auth/wrong-password") {
        setErrors({ password: t("account.firebase.wrongpw") });
      } else {
        setErrors({ password: error.message });
      }
    }
  };

  return (
    <Wrapper>
      <Form noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label={t("account.email")}
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Typography color="error">{errors.email}</Typography>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          name="password"
          label={t("account.password")}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Typography color="error">{errors.password}</Typography>
        {loading && <LinearProgress />}
        <SubmitButton
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          {t("account.login")}
        </SubmitButton>
        <Grid container>
          <Grid item xs>
            <MuiLink href="#" variant="body2" underline="none">
              {t("account.forgotpw")}
            </MuiLink>
          </Grid>
          <Grid item>
            <MuiLink
              href="#"
              onClick={(e) => props.handleChange(e, 1)}
              variant="body2"
              underline="none"
            >
              {t("account.donthaveacc")}
            </MuiLink>
          </Grid>
        </Grid>
      </Form>
    </Wrapper>
  );
};

export default LoginForm;
