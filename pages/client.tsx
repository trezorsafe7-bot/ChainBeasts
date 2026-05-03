import React, { type ReactElement, useEffect } from 'react';
import LayoutSui from '../components/LayoutSui';

const Game = () => {
  useEffect(() => {
    document.documentElement.classList.add('mountings');
    return () => {
      document.documentElement.classList.remove('mountings');
    };
  }, []);

  return (
    <>
      <h2 className="text-center p-5 mt-5 pb-0">Connect ChainBests Game</h2>
      <h4 className="text-center p-3">
        Yuo need to install{' '}
        <a
          style={{ color: '#fff' }}
          href="https://chrome.google.com/webstore/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd"
        >
          Suiet Wallet
        </a>
      </h4>
    </>
  );
};

Game.getLayout = (page: ReactElement) => <LayoutSui>{page}</LayoutSui>;
export default Game;
