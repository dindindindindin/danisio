import "../styles/index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { appWithTranslation } from "next-i18next";
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
export default appWithTranslation(MyApp);
