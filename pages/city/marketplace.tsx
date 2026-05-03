import React, { useEffect, useRef, useState } from 'react';
import Layout from '../../components/Layout';
import * as BABYLON from '@babylonjs/core';
import { SceneLoader, Vector3 } from '@babylonjs/core';
import {
  type GLTFFileLoader,
  GLTFLoaderAnimationStartMode,
} from '@babylonjs/loaders';
import usePickAxe from '../../hooks/usePickAxe';
import Image from 'next/dist/client/image';
import { BabylonLoader } from '../../components/BabylonLoader';
import { useAuth } from '../../hooks/useAuth';

const Marketplace = () => {
  const { mintPickAxe, successMintPickAxe } = usePickAxe();
  const { isAuthorized } = useAuth();
  const canvasRef = useRef(null);
  const [loader, setLoader] = useState<boolean>(true);
  const [isChestOpened, setIsChestOpened] = useState(false);

  const handleOpen = async () => {
    setLoader(true);
    await mintPickAxe?.(1, 0.0066);
  };

  useEffect(() => {
    successMintPickAxe && setIsChestOpened(true);
  }, [successMintPickAxe]);

  useEffect(() => {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

    if (!canvas) {
      return;
    }

    const engine = new BABYLON.Engine(canvas, true);

    const createScene = () => {
      const scene = new BABYLON.Scene(engine);
      const camera = new BABYLON.ArcRotateCamera(
        'camera',
        -Math.PI / 2,
        Math.PI / 2.1,
        175,
        new BABYLON.Vector3(0, 0, 0),
        scene
      );
      camera.lowerRadiusLimit = 175;
      camera.upperRadiusLimit = 175;
      camera.upperBetaLimit = camera.beta;
      camera.lowerBetaLimit = camera.beta;

      camera.fov = 0.01;
      camera.setTarget(new Vector3(0, 0.5, 0));

      camera.attachControl(canvasRef.current, true);
      const light = new BABYLON.HemisphericLight(
        'light',
        new BABYLON.Vector3(10, 10, -10),
        scene
      );
      light.intensity = 0.5;

      const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
        `${process.env.NEXT_PUBLIC_STATIC}/glb/environmentSpecular.env`,
        scene
      );
      scene.environmentTexture = hdrTexture;
      scene.environmentTexture.level = 1;
      scene.clearColor = new BABYLON.Color4(0, 0, 0, 0.0000000000000001);

      BABYLON.SceneLoader.OnPluginActivatedObservable.add((loader) => {
        (loader as GLTFFileLoader).animationStartMode =
          GLTFLoaderAnimationStartMode.NONE;
      });

      return scene;
    };

    const scene = createScene();

    SceneLoader.ImportMeshAsync(
      '',
      `${process.env.NEXT_PUBLIC_MODELS}/treasure/`,
      'basket_b.gltf',
      scene
    ).then((c) => {
      // console.log(c);
      const rootNode = c.meshes[0];
      rootNode.rotate(new Vector3(0, 200, 0), 1);
      rootNode.position = new Vector3(0, 0, 0);
    });
    scene.executeWhenReady(() => {
      engine.hideLoadingUI();
    });

    const FpsElement =
      typeof document !== 'undefined' && document.getElementById('fps');

    engine.runRenderLoop(function () {
      scene.render();
      if (FpsElement) FpsElement.innerHTML = engine.getFps().toFixed(2);
    });

    window.addEventListener('resize', function () {
      engine.resize();
    });

    return () => {
      engine.hideLoadingUI();
    };
  }, []);

  if (!isAuthorized) return <BabylonLoader isConnected={false} />;

  return (
    <>
      <div className="relative container px-4 mx-auto">
        {!isChestOpened ? (
          <>
            <canvas
              className="w-full h-full"
              id="renderCanvas"
              ref={canvasRef}
            ></canvas>
            <button
              className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-md px-8 py-4 text-lg bg-white font-bold text-white bg-opacity-20 hover:bg-gradient-to-r hover:from-purple-fade-from hover:to-purple-fade-from transition-all"
              onClick={handleOpen}
            >
              0.01 ETH!
            </button>
          </>
        ) : (
          <div className="flex justify-center pt-24">
            <div>
              <Image
                src="/resources/assets/axes/blue-axe.png"
                width={256}
                height={256}
                alt="axe"
              />
              <div className="mt-5 text-center text-white text-xl">
                Congratulations!!
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

Marketplace.getLayout = (page: React.ReactElement) => <Layout>{page}</Layout>;
export default Marketplace;
