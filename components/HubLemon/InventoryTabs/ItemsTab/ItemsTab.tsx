import React, { useEffect, useState } from 'react';
import { type ItemType, useLemonStore } from '../../../../helpers/lemonStore';
import { shallow } from 'zustand/shallow';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import toast from 'react-hot-toast';
import alchemy, { getItems, mintItemData } from '../../../../helpers/alchemy';
import classNames from 'classnames';
import Image from 'next/image';

export const ItemsTab: React.FC = () => {
  const { lemons, activePlatform } = useLemonStore(
    ({ lemons, activePlatform, wearingItem }) => ({
      lemons,
      activePlatform,
      wearingItem,
    }),
    shallow
  );

  const [currentItemsFilter, setCurrentItemsFilter] = useState<
    string | undefined
  >();
  const [inventoryLoader, setInventoryLoader] = useState<boolean>(true);
  const [lemonItems, setLemonItems] = useState<ItemType[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemType | undefined>();
  const { address } = useAccount();

  const filterOutifts =
    (type: string) => (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      if (type == 'all') {
        setCurrentItemsFilter(undefined);
      } else {
        setCurrentItemsFilter(type);
      }
    };

  const clickToItem =
    (item: ItemType) => (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      setSelectedItem(item);
      if (currentItemsFilter != 'dressed') {
        useLemonStore.setState({ wearingItem: item });
      }
    };

  const refreshItems = async () => {
    if (process.env.NEXT_PUBLIC_PRODUCTION == 'true') {
      return;
    }
    if (!address) return;
    const itemsOwnedNfts = await getItems(address);
    const items = itemsOwnedNfts.ownedNfts
      .map((nft) => nft.rawMetadata.properties)
      .filter((x) => x);
    setLemonItems(items);
    setInventoryLoader(false);
  };

  const handleDressedMode = () => {
    setSelectedItem(undefined);
    useLemonStore.setState({ wearingItem: undefined });
    if (currentItemsFilter == 'dressed') {
      setCurrentItemsFilter(undefined);
    } else {
      setCurrentItemsFilter('dressed');
    }
  };

  const { config } = usePrepareContractWrite(
    mintItemData(address, lemonItems.length)
  );
  const { write } = useContractWrite(config);

  const handleMintItem = async () => {
    if (process.env.NEXT_PUBLIC_PRODUCTION == 'true') {
      return false;
    }
    setInventoryLoader(true);

    try {
      await write?.();
      setCurrentItemsFilter(undefined);
    } catch (e) {
      const { message } = e as Error;
      toast.error(message);
      setInventoryLoader(false);
    }
  };

  useEffect(() => {
    refreshItems();
    alchemy.ws.on(
      {
        address: '0xeae26aa7aD3E54C208a22a78bd9E5d2D7ccFC18D',
        topics: [
          '0xe65085e689b77b126ba0bac3b079aa8288f19f4d5445af11c76003f8ab3075dd',
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        ],
      },
      (tx) => {
        setInventoryLoader(true);
        refreshItems();
      }
    );
  }, []);

  return (
    <>
      <div className="relative">
        <div className="grid grid-cols-12 gap-2 p-2.5 self-start w-full min-h-40 h-72 2xl:min-h-50 2xl:h-90 overflow-y-auto">
          {currentItemsFilter == 'dressed' ? (
            <>
              {lemonItems
                .filter(
                  (item) =>
                    item.attachedTo ==
                    lemons.ownedNfts[activePlatform - 1].tokenId
                )
                .map((item, idx) => (
                  <div
                    className={classNames({
                      'bg-white border-opacity-80 col-span-3 border px-1 rounded-xl overflow-hidden h-32 2xl:h-40':
                        item.id === selectedItem?.id,
                    })}
                    key={`${item.type}${idx}`}
                  >
                    <div
                      className="text-center py-2"
                      onClick={clickToItem(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_STATIC}/assets/128/Icon_${item.name}_128.png`}
                        alt={item.type}
                        className="img-fluid"
                      />
                    </div>
                  </div>
                ))}
              {lemonItems.filter(
                (item) =>
                  item.attachedTo ==
                  lemons.ownedNfts[activePlatform - 1].tokenId
              ).length == 0 ? (
                <div className="w-full flex items-center justify-center col-span-full text-white text-opacity-50">
                  <div className="w-full text-center pt-4 mt-2 text-lg">
                    <div className="flex justify-center mb-2">
                      <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.5">
                          <path d="M30.739 39.5833H7.62218C6.70568 39.5833 5.82671 39.1829 5.17865 38.4701C4.53059 37.7573 4.16651 36.7906 4.16651 35.7825C4.16555 35.0564 4.35158 34.3449 4.70305 33.7302C5.05452 33.1156 5.55707 32.623 6.15253 32.3094L25.0197 22.9167L33 27" stroke="white" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" />
                          <path d="M24.8913 22.9167V22.2559C24.9382 21.2422 25.2418 20.2532 25.7774 19.3698C26.3129 18.4864 27.0652 17.7336 27.9727 17.1731C28.7109 16.6949 29.3037 16.0467 29.6934 15.2916C30.0831 14.5366 30.2565 13.7004 30.1966 12.8644C30.1368 12.0284 29.8458 11.221 29.3519 10.5209C28.8581 9.82077 28.1782 9.25171 27.3784 8.86908C26.5786 8.48644 25.6861 8.30327 24.7879 8.33737C23.8896 8.37147 23.0161 8.62168 22.2523 9.06367C21.4886 9.50566 20.8606 10.1244 20.4295 10.8596C19.9983 11.5948 19.7788 12.4216 19.7921 13.2593" stroke="white" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" />
                          <path d="M35.8484 32.0983L38.5001 34.75M38.5001 34.75L41.1517 37.4017M38.5001 34.75L41.1517 32.0983M38.5001 34.75L35.8484 37.4017" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="38.5" cy="34.75" r="8.75" stroke="white" strokeWidth="2.5" />
                        </g>
                      </svg>
                    </div>
                    {"Lemon doesn't have dresset items"}
                  </div>
                </div>
              ) : (
                <></>
              )}
            </>
          ) : (
            <>
              {lemonItems
                .filter(
                  (item) =>
                    (!currentItemsFilter || currentItemsFilter == item.type) &&
                    !item.attachedTo
                )
                .map((item, idx) => (
                  <div
                    className={classNames(
                      {
                        'bg-white bg-opacity-20': item.id === selectedItem?.id,
                      },
                      'col-span-3 border border-white px-1 rounded-xl h-32 2xl:h-40'
                    )}
                    key={`${item.type}${idx}`}
                  >
                    <div
                      className="text-center py-2 cursor-pointer"
                      onClick={clickToItem(item)}
                    >
                      <Image
                        className="mx-auto"
                        src={`${process.env.NEXT_PUBLIC_STATIC}/assets/128/Icon_${item.name}_128.png`}
                        alt={item.type}
                        width={128}
                        height={128}
                      />
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
        <div>
          {currentItemsFilter != 'dressed' && (
            <div className="flex shrink-0 mt-2 bottom-buttons gap-1 2xl:gap-0 px-3 py-2 relative">
              <a className={classNames({ 'bg-blue opacity-80': currentItemsFilter === undefined }, 'relative flex items-center justify-center basis-12 2xl:basis-16 w-12 h-12 2xl:w-16 2xl:h-16 rounded-full')} href={'#'} onClick={filterOutifts('all')}>
                <b className="relative z-10">ALL</b>
                <img className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 basis-12 2xl:1/2 2xl w-12 h-12 2xl:w-16 2xl:h-16" alt="icon" src={`${process.env.NEXT_PUBLIC_STATIC}/assets/tiny/icon_hand_empty.png`} />
              </a>
              <a className={classNames({ 'bg-blue opacity-80': currentItemsFilter === 'cap' }, 'relative flex items-center justify-center basis-12 2xl:basis-16 w-12 h-12 2xl:w-16 2xl:h-16 rounded-full cursor-pointer')} onClick={filterOutifts('cap')}>
                <img src={`${process.env.NEXT_PUBLIC_STATIC}/assets/tiny/icon_cap_64.png`} />
              </a>
              <a className={classNames({ 'bg-blue opacity-80': currentItemsFilter === 'belt' }, 'relative flex items-center justify-center basis-12 2xl:basis-16 w-12 h-12 2xl:w-16 2xl:h-16 rounded-full')} href={'#'} onClick={filterOutifts('belt')}>
                <img src={`${process.env.NEXT_PUBLIC_STATIC}/assets/tiny/icon_belt_64.png`} />
              </a>
              <a className={classNames({ 'bg-blue opacity-80': currentItemsFilter === 'cloth' }, 'relative flex items-center justify-center basis-12 2xl:basis-16 w-12 h-12 2xl:w-16 2xl:h-16 rounded-full')} href={'#'} onClick={filterOutifts('cloth')}>
                <img src={`${process.env.NEXT_PUBLIC_STATIC}/assets/tiny/icon_cloth_64.png`} />
              </a>
              <a className={classNames({ 'bg-blue opacity-80': currentItemsFilter === 'mask' }, 'relative flex items-center justify-center basis-12 2xl:basis-16 w-12 h-12 2xl:w-16 2xl:h-16 rounded-full')} href={'#'} onClick={filterOutifts('mask')}>
                <img src={`${process.env.NEXT_PUBLIC_STATIC}/assets/tiny/icon_mask_64.png`} />
              </a>
              <a className={classNames({ 'bg-blue opacity-80': currentItemsFilter === 'glasses' }, 'relative flex items-center justify-center basis-12 2xl:basis-16 w-12 h-12 2xl:w-16 2xl:h-16 rounded-full')} href={'#'} onClick={filterOutifts('glasses')}>
                <img src={`${process.env.NEXT_PUBLIC_STATIC}/assets/tiny/icon_face_64.png`} />
              </a>
              <a className={classNames({ 'bg-blue opacity-80': currentItemsFilter === 'shoes' }, 'relative flex items-center justify-center basis-12 2xl:basis-16 w-12 h-12 2xl:w-16 2xl:h-16 rounded-full')} href={'#'} onClick={filterOutifts('shoes')}>
                <img src={`${process.env.NEXT_PUBLIC_STATIC}/assets/tiny/icon_foot_64.png`} />
              </a>
              <a className={classNames({ 'bg-blue opacity-80': currentItemsFilter === 'back' }, 'relative flex items-center justify-center basis-12 2xl:basis-16 w-12 h-12 2xl:w-16 2xl:h-16 rounded-full')} href={'#'} onClick={filterOutifts('back')}>
                <img src={`${process.env.NEXT_PUBLIC_STATIC}/assets/tiny/icon_back_128.png`} />
              </a>
              <a className={classNames({ 'bg-blue opacity-80': currentItemsFilter === 'fire_arms' }, 'relative flex items-center justify-center basis-12 2xl:basis-16 w-12 h-12 2xl:w-16 2xl:h-16 rounded-full')} href={'#'} onClick={filterOutifts('fire_arms')}>
                <img src={`${process.env.NEXT_PUBLIC_STATIC}/assets/tiny/icon_hand_r_64.png`} />
              </a>
              <a className={classNames({ 'bg-blue opacity-80': currentItemsFilter === 'cold_arms' }, 'relative flex items-center justify-center basis-12 2xl:basis-16 w-12 h-12 2xl:w-16 2xl:h-16 rounded-full')} href={'#'} onClick={filterOutifts('cold_arms')}>
                <img src={`${process.env.NEXT_PUBLIC_STATIC}/assets/tiny/icon_cold_arms_64.png`} />
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="absolute w-full -bottom-20 left-0 flex gap-3">
        <div className="flex py-1 basis-1/3">
          <a href={'#'} className="relative text-xs uppercase font-semibold py-4 bg-white bg-opacity-20 rounded-xl text-center rounded-md text-xl justify-center w-full flex text-black border border-white border-opacity-80" onClick={handleMintItem}>
            <div className="absolute w-full h-3/5 blur-[30px]" style={{ backgroundColor: '#A04CF4' }}></div>
            <span className="relative flex items-center gap-2 justify-center self-center text-white text-center w-full">
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 22V17M5 7V2M2.5 4.5H7.5M2.5 19.5H7.5M13.5 3L11.7658 7.50886C11.4838 8.24209 11.3428 8.60871 11.1235 8.91709C10.9292 9.1904 10.6904 9.42919 10.4171 9.62353C10.1087 9.84281 9.74209 9.98381 9.00886 10.2658L4.5 12L9.00886 13.7342C9.74209 14.0162 10.1087 14.1572 10.4171 14.3765C10.6904 14.5708 10.9292 14.8096 11.1235 15.0829C11.3428 15.3913 11.4838 15.7579 11.7658 16.4911L13.5 21L15.2342 16.4911C15.5162 15.7579 15.6572 15.3913 15.8765 15.0829C16.0708 14.8096 16.3096 14.5708 16.5829 14.3765C16.8913 14.1572 17.2579 14.0162 17.9911 13.7342L22.5 12L17.9911 10.2658C17.2579 9.98381 16.8913 9.8428 16.5829 9.62353C16.3096 9.42919 16.0708 9.1904 15.8765 8.91709C15.6572 8.60871 15.5162 8.24209 15.2342 7.50886L13.5 3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Mint random item
            </span>
          </a>
        </div>
        <div className="flex py-1 basis-1/3">
          <a href={'#'} className="relative text-xs uppercase font-semibold py-4 bg-white bg-opacity-20 rounded-xl text-center rounded-md text-xl justify-center w-full flex text-black border border-white border-opacity-80" onClick={handleDressedMode}>
            <div className="absolute w-full h-3/5 blur-[30px]" style={{ backgroundColor: '#11A6C5' }}></div>
            <span className="relative z-10 flex items-center gap-2 text-white justify-center self-center text-center w-full">
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 9H17C19.4853 9 21.5 11.0147 21.5 13.5C21.5 15.9853 19.4853 18 17 18H12.5M3.5 9L7.5 5M3.5 9L7.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {currentItemsFilter == 'dressed' ? 'Back' : 'Dressed items'}
            </span>
          </a>
        </div>
        <div className="flex py-1 basis-1/3">
          <a href={'#'} className={classNames({ 'bg-stone-400 bg-opacity-40': !selectedItem, 'bg-white bg-opacity-20': selectedItem }, 'relative text-xs uppercase font-semibold py-4 text-center rounded-md text-xl justify-center w-full flex text-black border border-white border-opacity-80 rounded-xl')}>
            <div className="absolute w-full left-1/2 -translate-x-1/2 h-3/5 blur-[30px]" style={{ backgroundColor: '#19CA60' }}></div>
            <span className="relative z-10 flex items-center gap-2 text-white justify-center self-center text-center w-full">
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 22.5C18.299 22.5 23 17.799 23 12C23 6.20101 18.299 1.5 12.5 1.5C6.70101 1.5 2 6.20101 2 12C2 17.799 6.70101 22.5 12.5 22.5Z" stroke="white" strokeWidth="2" strokeMiterlimit="10" />
                <path d="M7.5 12L10.1644 14.3979C10.5447 14.7402 11.122 14.7402 11.5023 14.3979L17.5 9" stroke="white" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" />
              </svg>
              {currentItemsFilter == 'dressed' ? 'Take Off' : 'Confirm'}
            </span>
          </a>
        </div>
      </div>
    </>
  );
};