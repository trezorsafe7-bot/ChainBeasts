import React, { useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color4,
  CubeTexture,
  Engine,
  Scene,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import { LemonGenerator } from './Models/LemonGenerator';
import { useLemonStore } from '../helpers/lemonStore';
import { allItems, allProperties } from '../helpers/dummyLemon';
import { type LemonOwnedNft } from '../helpers/alchemy';
import classNames from 'classnames';

type updateLemonType = (lemon: LemonOwnedNft) => Promise<void>;
let updateSomeLemon: updateLemonType = async () => {};

export default function LemonSandboxScene() {
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  const [background, setBackground] = useState<string>('');
  const [visibleInterface, setVisibleInterface] = useState<boolean>(true);
  const { lemons } = useLemonStore();

  const changeItem = (type: string, name: string) => {
    lemons.ownedNfts[0].rawMetadata.items.forEach((item, index) => {
      if (item.type == type) {
        item.name = name;
      }
    });

    useLemonStore.setState({ lemons });
    updateSomeLemon?.(lemons.ownedNfts[0]);
  };

  const changeProperty = (type: string, name: string) => {
    lemons.ownedNfts[0].rawMetadata.properties.forEach((property, index) => {
      if (property.type == type) {
        property.name = name;
      }
    });

    useLemonStore.setState({ lemons });
    updateSomeLemon?.(lemons.ownedNfts[0]);
  };

  useEffect(() => {
    const engine = new Engine(canvasRef.current, true);

    // Add your code here matching the playground format
    const createScene = function () {
      const scene = new Scene(engine);

      const camera = new ArcRotateCamera(
        'camera',
        Math.PI / 0.292,
        Math.PI / 1.9,
        500,
        new Vector3(0, 122, 0),
        scene
      );

      camera.lowerRadiusLimit = 50;
      camera.upperRadiusLimit = 500;
      camera.attachControl(canvasRef.current, true);

      const hdrTexture = CubeTexture.CreateFromPrefilteredData(
        `${process.env.NEXT_PUBLIC_STATIC}/glb/environmentSpecular.env`,
        scene
      );
      scene.environmentTexture = hdrTexture;
      scene.environmentTexture.level = 1;
      scene.clearColor = new Color4(0, 0, 0, 0.0000000000000001);

      LemonGenerator(scene).then((result) => {
        updateSomeLemon = async (lemon: LemonOwnedNft) => {
          await result.change(lemon);
          // console.log('changed');
          scene.render();
        };
        scene.render();
      });

      return scene;
    };

    const scene = createScene();

    engine.runRenderLoop(function () {
      scene.render();
    });

    window.addEventListener('resize', function () {
      engine.resize();
    });
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="h-screen w-full absolute top-0"
        id="renderCanvas"
        style={{
          background:
            background && background.indexOf('http') > -1
              ? `url(${background})`
              : background,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      />
      <div
        className="absolute px-4 left-0 w-72"
        style={{ display: visibleInterface ? 'block' : 'none' }}
      >
        {lemons.ownedNfts[0].rawMetadata.properties.map((prop, i) => (
          <div key={i} className="pt-1 w-full">
            <b
              className="text-sm px-1"
              style={{ background: '#fff', borderRadius: '3px' }}
            >
              {prop.name}
            </b>
            <br />
            <select
              className="pt-1 pb-1 pr-9 pl-2 w-full rounded border-transparent border-r-8"
              value={prop.name ?? undefined}
              onChange={(e) => {
                changeProperty(prop.type, e.target.value);
              }}
            >
              <option value={undefined}>none</option>
              {allProperties
                .filter((ap) => ap.type == prop.type)
                .map((ap, indx) => (
                  <React.Fragment key={indx}>
                    {ap.name && (
                      <option key={indx} value={ap.name}>
                        {ap.name}
                      </option>
                    )}
                  </React.Fragment>
                ))}
            </select>
          </div>
        ))}
      </div>

      <div
        className="absolute right-0 w-72 px-4"
        style={{ right: '0', display: visibleInterface ? 'block' : 'none' }}
      >
        {lemons.ownedNfts[0].rawMetadata.items.map((prop, i) => (
          <div className="pt-1 w-full" key={i}>
            <b
              className="text-sm px-1"
              style={{ background: '#fff', borderRadius: '3px' }}
            >
              {prop.type}
            </b>
            <br />
            <select
              className="pt-1 pb-1 pr-9 pl-2 w-full rounded"
              value={prop.name ?? undefined}
              onChange={(e) => {
                changeItem(prop.type, e.target.value);
              }}
            >
              <option value={undefined}>none</option>
              {allItems
                .filter((ap) => ap.type == prop.type)
                .map((ap, indx) => (
                  <React.Fragment key={indx}>
                    {ap.name && (
                      <option key={indx} value={ap.name}>
                        {ap.name}
                      </option>
                    )}
                  </React.Fragment>
                ))}
            </select>
          </div>
        ))}
        <br />
        <b
          className="text-sm px-1"
          style={{ background: '#fff', borderRadius: '3px' }}
        >
          Background
        </b>
        <input
          className="p-1 rounded"
          value={background}
          onChange={(e) => {
            setBackground(e.target.value);
          }}
        />
      </div>

      <div
        className={classNames(
          { 'opacity-100': visibleInterface, 'opacity-0': !visibleInterface },
          'absolute w-20 h-20 right-0 bottom-0'
        )}
        onClick={() => {
          setVisibleInterface(!visibleInterface);
        }}
      ></div>
    </>
  );
}
