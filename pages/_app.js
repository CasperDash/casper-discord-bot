import {
  CasperProvider,
  createClient,
  CasperDashConnector,
  CasperSignerConnector,
} from "@casperdash/usewallet";
import "../css/style.css";
import Layout from "../components/layout";

const client = createClient({
  connectors: [new CasperSignerConnector(), new CasperDashConnector()],
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
