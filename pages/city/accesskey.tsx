import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useCookies } from 'react-cookie';
import classNames from 'classnames';
import ACCESS_KEY_CONTRACT_SOL from '../../helpers/abi/AccessKey.json';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useSwitchNetwork,
  useWaitForTransaction,
} from 'wagmi';
import {
  ACCESS_KEY_CONTRACT_ADDRESS,
  type IProxyMintArgs,
  proxyMintAccessKey,
} from '../../helpers/linea';
import useSWR from 'swr';

const Mint = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const [balance, setBalance] = useState(0);
  const { address, isConnected } = useAccount();
  const [discordCode, setDiscordCode] = useState<string | boolean>(false);
  const [voucher, setVoucher] = useState<IProxyMintArgs | boolean>(false);
  const [cookies, setCookie] = useCookies([
    'check_follow',
    'check_retwit',
    'check_discord',
    'auth_token',
  ]);
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();

  const { data: bigNumberBalance } = useContractRead({
    address: ACCESS_KEY_CONTRACT_ADDRESS,
    abi: ACCESS_KEY_CONTRACT_SOL.abi,
    functionName: 'balanceOf',
    args: [address],
  });

  useEffect(() => {
    setBalance(parseFloat(bigNumberBalance as string));
  }, [bigNumberBalance]);

  const checkDiscordJoin = () => {
    setTimeout(() => {
      setCookie('check_discord', 'true');
    }, 3000);
  };

  const getVouchers = async (url: string | null) => {
    if (!url) return;
    const data = await fetch(url, {
      headers: {
        Authorization: `Bearer ${cookies.auth_token}`,
        'Content-Type': 'application/json',
      },
    });
    const dataVoucher: IProxyMintArgs = await data.json();
    setVoucher(dataVoucher);
  };

  useSWR(
    discordCode ? '/battlemon-api/vouchers/access-keys' : null,
    getVouchers
  );

  useEffect(() => {
    if (balance > 0) {
      setDiscordCode(true);
      return;
    }
    if (!cookies.auth_token || !isConnected) {
      setDiscordCode(false);
    }
  }, [cookies, address, discordCode]);

  const getDiscordCode = async (url: string | null) => {
    if (!url) return;
    const data = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cookies.auth_token}`,
        'Content-Type': 'application/json',
      },
    });
    const {
      code,
      error,
      message,
    }: { code: string; error: string; message: string } = await data.json();
    if (code) {
      setDiscordCode(code);
    }
    if (error && message == 'User has already activated code') {
      setDiscordCode(true);
    }
  };

  const { data: _discordCode } = useSWR(
    address && cookies.auth_token && '/battlemon-api/activation-codes',
    getDiscordCode
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { config: configProxyMintAccessKey } = usePrepareContractWrite(
    proxyMintAccessKey(voucher)
  );
  const {
    data: dataProxyMintAccessKey,
    write: writeProxyMint,
    isError: errorProxyMintAccessKey,
  } = useContractWrite(configProxyMintAccessKey);

  const { data: proxyMintedAccessKey, isSuccess: successProxyMintAccessKey } =
    useWaitForTransaction({
      hash: dataProxyMintAccessKey?.hash,
    });

  useEffect(() => {
    // console.log(proxyMintedAccessKey);
  }, [successProxyMintAccessKey, errorProxyMintAccessKey]);

  if (!hasMounted) return <></>;

  const handleProxyMintButton = () => {
    if (switchNetwork && chain?.id !== 59140) {
      switchNetwork(59140);
      return;
    }

    writeProxyMint?.();
  };

  const onCopyClick = (value: string) => {
    navigator.clipboard.writeText(`/activate code: ${value}`);
  };

  return (
    <div className="container px-4 mt-5 mx-auto">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full lg:col-span-5">
          <video
            loop
            autoPlay
            playsInline
            muted
            className="w-100"
            style={{ borderRadius: '15px', border: '1px solid #fff' }}
          >
            <source
              src={`${process.env.NEXT_PUBLIC_STATIC}/video/keycard.mp4`}
              type="video/mp4"
            />
          </video>
          {balance > 0 ? (
            <div
              className={`bg-white bg-opacity-10 border border-white border-opacity-40 py-3 px-20 rounded-2xl text-white mt-3 text-center`}
            >
              You already have key
            </div>
          ) : (
            <div className="mt-3 bg-midnight-light rounded-2xl">
              <button
                className={classNames(
                  {
                    'opacity-40 pointer-events-none':
                      typeof voucher !== 'object',
                  },
                  'backdrop-blur-xl rounded-2xl border-2 border-white border-opacity-20 text-xl text-white px-4 py-4 w-full'
                )}
                style={{
                  background:
                    'radial-gradient(65.09% 50% at 51.67% 50%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.0625) 100%)',
                }}
                onClick={handleProxyMintButton}
              >
                MINT
              </button>
            </div>
          )}
        </div>
        <div className="col-span-full lg:col-span-7">
          <div
            className={classNames(
              'relative flex flex-col xs:flex-row justify-between gap-3 xs:items-center rounded-2xl shadow p-4 mb-3 text-white border-2 border-white border-opacity-40'
            )}
            style={{
              background:
                discordCode === true
                  ? 'linear-gradient(90.66deg, rgba(56, 191, 128, 0.6) 0.57%, rgba(56, 191, 128, 0.4) 99.48%)'
                  : 'linear-gradient(90.66deg, rgba(255, 255, 255, 0.3) 0.57%, rgba(255, 255, 255, 0.1) 99.48%)',
            }}
          >
            <div className="absolute left-0 top-0 w-full h-full bg-blue bg-opacity-50 blur-xl rounded-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <div className="col col-auto d-flex justify-content-center px-2">
                  <svg
                    fill="none"
                    viewBox="0 0 24 26"
                    width="40"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.6321 22.9682H18.5395L17.8263 20.5728L19.53 22.0887L21.0918 23.5362L23.9346 26V2.68302C23.8877 1.95554 23.5758 1.27373 23.0621 0.77562C22.5484 0.277514 21.8712 0.000341255 21.1677 0.00022733H3.6354C2.93568 -0.00906679 2.26045 0.266947 1.75524 0.76878C1.25003 1.27061 0.955298 1.95808 0.93457 2.68302V20.2854C0.937914 20.6463 1.01078 21.0029 1.14889 21.3342C1.28701 21.6655 1.48759 21.9649 1.73886 22.2148C1.99013 22.4647 2.28704 22.6601 2.61215 22.7895C2.93726 22.9188 3.28403 22.9796 3.6321 22.9682ZM14.66 6.15969H14.6236H14.66ZM6.67962 7.52846C7.74472 6.68674 9.03569 6.20847 10.3743 6.15969L10.5163 6.30683C8.17201 6.88514 7.10885 7.97331 7.10885 7.97331C7.10885 7.97331 7.3928 7.82959 7.88806 7.60716C9.45845 6.95553 11.1446 6.65729 12.8346 6.73222C14.5246 6.80714 16.18 7.25351 17.691 8.04175C17.691 8.04175 16.6245 7.01517 14.4255 6.37527L14.6203 6.1768C15.9377 6.2364 17.2056 6.71424 18.2523 7.54557C19.469 9.88643 20.13 12.4941 20.1805 15.1525C20.121 15.0567 18.9885 16.9559 16.0665 17.0209C16.0665 17.0209 15.5745 16.4391 15.2212 15.9361C16.9283 15.4297 17.5655 14.4134 17.5655 14.4134C17.0843 14.7074 16.5883 14.9747 16.0797 15.2141C15.4638 15.4726 14.8245 15.6663 14.1713 15.7924C11.1535 16.2988 9.46299 15.4502 7.86165 14.7658L7.31686 14.475C7.31686 14.475 7.95079 15.5015 9.58846 15.9977C9.16584 16.5213 8.73991 17.1098 8.73991 17.1098C5.82777 17.038 4.77781 15.1525 4.77781 15.1525C4.81879 12.4907 5.4707 9.87731 6.67962 7.52846Z"
                      fill="currentColor"
                    ></path>
                    <path
                      d="M14.8478 13.8383C15.2069 13.8202 15.5455 13.6597 15.7935 13.3899C16.0415 13.1201 16.1798 12.7617 16.1798 12.3891C16.1798 12.0165 16.0415 11.6582 15.7935 11.3884C15.5455 11.1186 15.2069 10.958 14.8478 10.9399C14.4774 10.9399 14.1222 11.0924 13.8602 11.3639C13.5983 11.6354 13.4512 12.0035 13.4512 12.3874C13.4512 12.7713 13.5983 13.1395 13.8602 13.4109C14.1222 13.6824 14.4774 13.8349 14.8478 13.8349V13.8383Z"
                      fill="currentColor"
                    ></path>
                    <path
                      d="M10.0216 13.8383C10.3807 13.8202 10.7194 13.6597 10.9673 13.3899C11.2153 13.1201 11.3536 12.7617 11.3536 12.3891C11.3536 12.0165 11.2153 11.6582 10.9673 11.3884C10.7194 11.1186 10.3807 10.958 10.0216 10.9399C9.65123 10.9399 9.29599 11.0924 9.03407 11.3639C8.77215 11.6354 8.625 12.0035 8.625 12.3874C8.625 12.7713 8.77215 13.1395 9.03407 13.4109C9.29599 13.6824 9.65123 13.8349 10.0216 13.8349V13.8383Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
                <div className="px-2">
                  <p className="mb-1">
                    <b>Join ChainBeasts Discord Server</b>
                  </p>
                </div>
              </div>
              {typeof discordCode == 'string' && (
                <div style={{ paddingLeft: '65px' }}>
                  <p className="my-0">
                    Go to{' '}
                    <a
                      className="text-white underline cursor-pointer"
                      href="https://discordapp.com/channels/893433519110488064/1116478869118144532"
                      target="_blank"
                      rel="noreferrer"
                    >
                      our special channel
                    </a>
                  </p>
                  <p className="flex flex-wrap items-center my-0 gap-1">
                    Enter command:
                    <br />
                    <span>
                      <kbd>/activate code: {discordCode}</kbd>
                    </span>
                    <svg
                      className="cursor-pointer"
                      onClick={() => onCopyClick(discordCode)}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                    >
                      <title>ic_fluent_copy_24_regular</title>
                      <desc>Created with Sketch.</desc>
                      <g
                        id="🔍-Product-Icons"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        <g
                          id="ic_fluent_copy_24_regular"
                          fill="#fff"
                          fillRule="nonzero"
                        >
                          <path
                            d="M5.50280381,4.62704038 L5.5,6.75 L5.5,17.2542087 C5.5,19.0491342 6.95507456,20.5042087 8.75,20.5042087 L17.3662868,20.5044622 C17.057338,21.3782241 16.2239751,22.0042087 15.2444057,22.0042087 L8.75,22.0042087 C6.12664744,22.0042087 4,19.8775613 4,17.2542087 L4,6.75 C4,5.76928848 4.62744523,4.93512464 5.50280381,4.62704038 Z M17.75,2 C18.9926407,2 20,3.00735931 20,4.25 L20,17.25 C20,18.4926407 18.9926407,19.5 17.75,19.5 L8.75,19.5 C7.50735931,19.5 6.5,18.4926407 6.5,17.25 L6.5,4.25 C6.5,3.00735931 7.50735931,2 8.75,2 L17.75,2 Z M17.75,3.5 L8.75,3.5 C8.33578644,3.5 8,3.83578644 8,4.25 L8,17.25 C8,17.6642136 8.33578644,18 8.75,18 L17.75,18 C18.1642136,18 18.5,17.6642136 18.5,17.25 L18.5,4.25 C18.5,3.83578644 18.1642136,3.5 17.75,3.5 Z"
                            id="🎨-Color"
                          ></path>
                        </g>
                      </g>
                    </svg>
                  </p>
                </div>
              )}
            </div>
            <div className="relative self-stretch">
              <a
                target="_blank"
                rel="noreferrer"
                className="relative z-10 flex justify-center p-3 xs:p-0 items-center text-xl h-full text-white border-2 border-white border-opacity-20 rounded-2xl px-2.5 min-w-28"
                onClick={checkDiscordJoin}
                href="https://discord.gg/JRNVMgXqBA"
              >
                {discordCode === true ? 'Done' : 'Join'}
              </a>
            </div>
          </div>
          <div className="bg-white bg-opacity-10 border-2 border-white border-opacity-40 py-3 px-5 rounded-2xl text-white">
            <p className="mb-4">
              Unique Key-card that gives access to the incredible game world of
              Lemoland, full of adventures and NFT treasures.{' '}
            </p>
            <p className="mb-4">
              Unique NFT key-pass will be available in Testnet and also
              transferred to Mainnet.
            </p>
            <div className="flex justify-between mb-1">
              <b>Contract Address</b>
              <div>0xd622Dc376...80Ca3A19F2</div>
            </div>
            <div className="flex justify-between mb-1">
              <b>Token Standard</b>
              <div>ERC721</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Mint.getLayout = (page: React.ReactElement) => <Layout>{page}</Layout>;
export default Mint;
