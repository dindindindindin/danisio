import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Layout from "../components/Layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/router";
import { auth } from "../firebase.config";

const Form = styled("form")(({ theme }) => ({
  width: "100%", // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));
const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["account", "nav"])),
      // Will be passed to the page component as props
    },
  };
}

const ForgotPassword = (props) => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");

  const { t } = useTranslation("account");
  const router = useRouter();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (user && user.token) router.push("/");
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const config = {
      url: "http://localhost:3000/account",
      handleCodeInApp: true,
    };
    try {
      await sendPasswordResetEmail(auth, email, config);
      setEmail("");
      setErrors("");
      setSuccess(t("account.forgotpwsuccess"));
    } catch (error) {
      const errorCode = error.code;
      if (errorCode === "auth/invalid-email") {
        setErrors(t("account.firebase.validemail"));
      } else if (errorCode === "auth/user-not-found") {
        setErrors(t("account.firebase.usernotfound"));
      } else {
        setErrors(error.message);
        console.log(error.message);
      }
    }
  };

  return (
    <Layout>
      <Container maxWidth="xs">
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
          <Typography color="error">{errors}</Typography>
          <Typography color="primary">{success}</Typography>
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            {t("account.sendemail")}
          </SubmitButton>
        </Form>
      </Container>
    </Layout>
  );
};

export default ForgotPassword;
