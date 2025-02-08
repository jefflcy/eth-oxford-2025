// src/pages/_app.js
import ContextProvider from '@/context'; // This imports your context/index.tsx
import '../app/globals.css'; // Ensure your global styles (including Tailwind) are loaded

export default function MyApp({ Component, pageProps }) {
  // You can pass cookies if needed, here we use null.
  return (
    <ContextProvider cookies={null}>
      <Component {...pageProps} />
    </ContextProvider>
  );
}
