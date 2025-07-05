import React from 'react';

export const metadata = {
  title: 'kk Agentic',
  description: 'Coding Agentic',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
