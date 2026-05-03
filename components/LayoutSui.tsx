import React from 'react';
import { WalletProvider } from '@suiet/wallet-kit';
import Head from 'next/head';
import { Header } from './Header/Header';
import { Footer } from './Footer';
import { Toaster } from 'react-hot-toast';

interface Props {
  children?: JSX.Element;
}

export default function LayoutSui({ children }: Props) {
  return (
    <>
      <Head>
        <title>CHainBests GameFi Hub</title>
        <meta name="description" content="Battlemon - To the last drop of juice" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:site_name" content="Battlemon" />
        <meta property="og:title" content="Battlemon GameFi Hub" />
        <meta property="og:description" content="To the last drop of juice" />
        <meta property="og:image" content="https://promo.battlemon.com/battlemon.jpg" />
        <meta property="og:url" content="https://promo.battlemon.com/battlemon.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@BATTLEM0N" />
        <meta name="twitter:creator" content="@BATTLEM0N" />
        <meta name="twitter:title" content="Battlemon GameFi Hub" />
        <meta name="twitter:description" content="To the last drop of juice" />
        <meta name="twitter:image" content="https://promo.battlemon.com/battlemon.jpg" />
      </Head>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#151515',
            color: 'white',
            textTransform: 'uppercase',
            borderRadius: '3px',
            fontFamily: 'Arial',
            width: '300px',
          },
          error: { style: { background: '#c00', color: 'white' } },
        }}
      />
      <WalletProvider>
        <Header network="sui" />
        <main>{children}</main>
        <Footer />
      </WalletProvider>
    </>
  );
}