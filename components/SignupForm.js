import { useState, useCallback } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MuiLink from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { useTranslation } from "next-i18next";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.config";
import { useRouter } from "next/router";
import axios from "axios";

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

const SignupForm = (props) => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

  const handleChange = useCallback(
    ({ target: { name, value } }) =>
      setInput((state) => ({ ...state, [name]: value })),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (validate()) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          input.email,
          input.password
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

        // dispatch(
        //   loggedInUser({
        //     id: dbRes.data.id,
        //     email: dbRes.data.email,
        //     role: dbRes.data.role,
        //     token: idTokenResult.token,
        //   })
        // );

        let emptyInput = {};
        emptyInput["email"] = "";
        emptyInput["password"] = "";
        emptyInput["confirmPassword"] = "";
        setInput(emptyInput);
        setLoading(false);

        router.push("/");
      } catch (error) {
        const errorCode = error.code;
        setLoading(false);
        if (errorCode === "auth/email-already-in-use") {
          setErrors({ email: t("account.firebase.emailalready") });
        } else if (errorCode === "auth/invalid-email") {
          setErrors({ email: t("account.firebase.validemail") });
        } else if (errorCode === "auth/weak-password") {
          setErrors({ password: t("account.firebase.weakpw") });
        } else {
          setErrors({ confirmPassword: error.message });
        }
      }
    }
  };

  const validate = () => {
    let currentInput = input;
    let currentErrors = {};
    let isValid = true;

    if (!currentInput["email"]) {
      setLoading(false);
      isValid = false;
      currentErrors["email"] = t("account.validate.enteremail");
    }

    if (currentInput["email"] !== "") {
      var pattern = new RegExp(
        /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
      );
      if (!pattern.test(currentInput["email"])) {
        setLoading(false);
        isValid = false;
        currentErrors["email"] = t("account.validate.validemail");
      }
    }

    if (!currentInput["password"]) {
      setLoading(false);
      isValid = false;
      currentErrors["password"] = t("account.validate.enterpw");
    }

    if (!currentInput["confirmPassword"]) {
      setLoading(false);
      isValid = false;
      currentErrors["confirmPassword"] = t("account.validate.pwagain");
    }

    if (
      currentInput["password"] !== "" &&
      currentInput["confirmPassword"] !== ""
    ) {
      if (currentInput["password"] !== currentInput["confirmPassword"]) {
        setLoading(false);
        isValid = false;
        currentErrors["password"] = t("account.validate.pwdonotmatch");
      }
    }

    setErrors(currentErrors);

    return isValid;
  };

  return (
    <Wrapper>
      <Form noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label={t("account.email")}
          name="email"
          autoComplete="email"
          autoFocus
          onChange={handleChange}
          value={input.email}
        />
        <Typography color="error">{errors.email}</Typography>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label={t("account.password")}
          type="password"
          autoComplete="current-password"
          onChange={handleChange}
          value={input.password}
        />
        <Typography color="error">{errors.password}</Typography>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label={t("account.repeatpw")}
          type="password"
          autoComplete="current-password"
          onChange={handleChange}
          value={input.confirmPassword}
        />
        <Typography color="error">{errors.confirmPassword}</Typography>
        {loading && <LinearProgress />}
        <SubmitButton
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          {t("account.signup")}
        </SubmitButton>
        <Grid container>
          <Grid item xs>
            <MuiLink
              href="#"
              onClick={(e) => props.handleChange(e, 0)}
              variant="body2"
              underline="none"
            >
              {t("account.alreadyhaveacc")}
            </MuiLink>
          </Grid>
        </Grid>
      </Form>
    </Wrapper>
  );
};

export default SignupForm;
