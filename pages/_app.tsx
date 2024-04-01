import GlobalStyles from "@/styles/GlobalStyles";
import type { AppProps } from "next/app";
import Head from "next/head";

import "@fontsource/space-grotesk";
import "@fontsource/inter";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>
      <Component {...pageProps} />
      <GlobalStyles />
    </>
  );
}
