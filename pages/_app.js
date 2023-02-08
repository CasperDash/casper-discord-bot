import { CapserDashConnector, CasperSignerConnector } from "@usedapp/core";
import { CasperProvider, createClient } from "@usedapp/react";
import "../css/style.css";
import Layout from "../components/layout";

const client = createClient({
  connectors: [new CasperSignerConnector({}), new CapserDashConnector({})],
});

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <CasperProvider client={client}>
        <Component {...pageProps} />
      </CasperProvider>
    </Layout>
  );
}
