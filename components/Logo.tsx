import React from 'react';
import Link from 'next/link';

export default function Logo() {
  return (
    <div className="navbar-brand">
      <Link href="/">
        <svg
          height={46}
          version="1.1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 494 82"
        >
          <g>
            {/* C — x 0..46 */}
            <path
              fill="white"
              style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
              d="M0,0 H46 V12 H12 V58 H46 V70 H0 V0 Z"
            />

            {/* h — x 54..96 */}
            <path
              fill="white"
              style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
              d="M54,0 H66 V30 H84 V20 H96 V70 H84 V42 H66 V70 H54 V0 Z"
            />

            {/* a — x 104..146 */}
            <path
              fill="white"
              style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
              d="M104,24 H146 V70 H104 V24 Z M116,36 V44 H134 V36 H116 Z M116,56 V58 H134 V56 H116 Z"
            />

            {/* i — x 154..166 */}
            <path
              fill="white"
              style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
              d="M154,0 H166 V10 H154 V0 Z M154,20 H166 V70 H154 V20 Z"
            />

            {/* n — x 174..220 */}
            <path
              fill="white"
              style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
              d="M174,20 H186 V70 H174 V20 Z M186,20 H220 V32 H198 V70 H186 V20 Z M208,20 H220 V70 H208 V20 Z"
            />

            {/* B — x 232..282 */}
            <path
              fill="white"
              style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
              d="M232,0 H282 V12 H244 V32 H282 V44 H244 V58 H282 V70 H232 V0 Z M244,12 V32 H270 V12 H244 Z M244,44 V58 H270 V44 H244 Z"
            />

            {/* e — x 290..332 */}
            <path
              fill="white"
              style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
              d="M290,20 H332 V70 H290 V20 Z M302,32 V44 H332 V32 H302 Z M302,58 V70 H290 V20 H332 V32 H302 Z"
            />

            {/* a — x 340..382 */}
            <path
              fill="white"
              style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
              d="M340,20 H382 V70 H340 V20 Z M352,32 V44 H370 V32 H352 Z M352,56 V58 H370 V56 H352 Z"
            />

            {/* s — x 390..432 */}
            <path
              fill="white"
              style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
              d="M390,20 H432 V44 H402 V32 H390 V20 Z M390,44 H432 V58 H402 V70 H390 V44 Z"
            />

            {/* t — x 440..476 */}
            <path
              fill="white"
              style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
              d="M452,0 H464 V20 H476 V32 H464 V70 H452 V32 H440 V20 H452 V0 Z"
            />

            {/* s — x 484..526 */}
            <path
              fill="white"
              style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
              d="M484,20 H526 V44 H496 V32 H484 V20 Z M484,44 H526 V58 H496 V70 H484 V44 Z"
            />
          </g>
        </svg>
      </Link>
      <div
        className="nav-link text-center"
        style={{ color: 'white', fontSize: '18px', lineHeight: '26px' }}
      >
        &nbsp;
        <span className="fps-container">
          <span id="fps">0</span> FPS
        </span>
        &nbsp;
      </div>
    </div>
  );
}