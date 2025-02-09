// src/pages/_app.js
import ContextProvider from '@/context';
import '../app/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <ContextProvider cookies={null}>
      <Component {...pageProps} />
    </ContextProvider>
  );
}
