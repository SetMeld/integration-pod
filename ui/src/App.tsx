import { BrowserSolidLdoProvider } from '@ldo/solid-react';
import AppRouter from "./AppRouter";

export default function App() {
  console.log("Attempting render")
  return (
    <BrowserSolidLdoProvider>
      <AppRouter />
    </BrowserSolidLdoProvider>
  );
}
