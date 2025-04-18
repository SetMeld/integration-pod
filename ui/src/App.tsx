import { BrowserSolidLdoProvider } from '@ldo/solid-react';
import AppRouter from "./AppRouter";

export default function App() {
  return (
    <BrowserSolidLdoProvider>
      <AppRouter />
    </BrowserSolidLdoProvider>
  );
}
