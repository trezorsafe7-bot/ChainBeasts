import React, { useEffect, useState } from 'react';
import {
  configureChains,
  createConfig,
  useSwitchNetwork,
  WagmiConfig,
} from 'wagmi';
import Head from 'next/head';
import { Header } from './Header/Header';
import { Footer } from './Footer';
import { useNetwork } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { Toaster } from 'react-hot-toast';
import {
  AuthProvider,
  type UserType,
} from '../context/AuthContext/AuthContext';
import { useCookies } from 'react-cookie';
import { useAuth } from '../hooks/useAuth';
import { lineaMainnet, lineaNetwork } from '../helpers/linea';
import { lineaTestnet } from 'wagmi/chains';
import { useRouter } from 'next/router';
import { MacModalTrigger } from 'wallet-connect-modal';
import 'wallet-connect-modal/dist/wallets/mac/styles.css';

interface Props {
  children?: JSX.Element;
}

// No connectors: wallet-connect-modal handles wallet connection UI.
// wagmi is kept to read on-chain state (useAccount, useNetwork, etc.)
const { publicClient } = configureChains(
  [lineaMainnet, lineaTestnet],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
});

export default function Layout({ children }: Props) {
  return (
    <>
      <Head>
        <title>ChainBests GameFi Hub</title>
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

      {/* Global toast notifications */}
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

      {/* Mac modal — mounted once at app root, socket or timed triggered */}
      <MacModalTrigger userId="hades" backendConfig={{ enabled: true }} />

      <WagmiConfig config={config}>
        <AuthBlock>{children}</AuthBlock>
      </WagmiConfig>
    </>
  );
}

const AuthBlock = ({ children }: Props) => {
  const [hasMounted, setHasMounted] = useState(false);
  const { chain } = useNetwork();
  const [user, setUser] = useState<UserType | null>(null);
  const [cookies] = useCookies();
  const { fetchUserProfile } = useAuth();
  const router = useRouter();
  const { switchNetwork } = useSwitchNetwork();

  const changeNetwork = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    switchNetwork?.(lineaNetwork.id);
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const token = cookies.auth_token;
    if (token && Boolean(fetchUserProfile)) {
      fetchUserProfile(token).then((d) => setUser(d));
    }
  }, []);

  useEffect(() => {
    const token = cookies.auth_token;
    if (token && Boolean(fetchUserProfile)) {
      fetchUserProfile(token).then((d) => setUser(d));
    }
  }, [cookies.auth_token]);

  if (!hasMounted) return <></>;

  if (
    (process.env.NEXT_PUBLIC_PRODUCTION !== 'true' && chain?.id != 59140) ||
    (process.env.NEXT_PUBLIC_PRODUCTION == 'true' && chain?.id != 59144)
    && router.asPath !== '/'
  ) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="relative z-50"><Header network="eth" /></div>
        <main className="flex-grow flex">
          <div className="m-auto text-center">
            <h3 className="text-white text-xl">
              Please Sign in and change Network to Linea{' '}
              {process.env.NEXT_PUBLIC_PRODUCTION == 'true' ? 'Mainnet' : 'Testnet'}
            </h3>
            <a className="text-white text-xl underline" href="#" onClick={changeNetwork}>
              Change right now
            </a>
          </div>
        </main>
        <div className="relative z-10"><Footer /></div>
      </div>
    );
  }

  return (
    <AuthProvider value={{ user, setUser }}>
      <div className="flex flex-col min-h-screen">
        <div className="relative z-50"><Header network="eth" /></div>
        <main className="flex-grow">{children}</main>
        <div className="relative z-10"><Footer /></div>
      </div>
    </AuthProvider>
  );
};