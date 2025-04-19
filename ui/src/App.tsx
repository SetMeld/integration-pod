import { BrowserSolidLdoProvider } from '@ldo/solid-react';
import AppRouter from "./AppRouter";
import { Toaster } from "react-hot-toast"; 

export default function App() {
  return (
    <BrowserSolidLdoProvider>
      <AppRouter />
      <Toaster />
    </BrowserSolidLdoProvider>
  );
}
