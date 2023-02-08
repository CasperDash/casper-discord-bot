import { CapserDashConnector, CasperSignerConnector } from "@usedapp/core";
import { CasperProvider, createClient } from "@usedapp/react";

const client = createClient({
  connectors: [new CasperSignerConnector({}), new CapserDashConnector({})],
});

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <CasperProvider client={client}>
        <Component {...pageProps} />
      </CasperProvider>
    </>
  );
}
