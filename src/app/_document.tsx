
// This file is a fallback to ensure critical meta tags are present for crawlers.
// Next.js App Router's metadata API in layout.tsx is the primary method.

import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta 
          name="description" 
          content="Order confidential health products like self-test kits, emergency contraception, and more in Ghana. Anonymous, private, and discreet delivery for students and young professionals." 
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
