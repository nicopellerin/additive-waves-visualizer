import { useEffect, useRef } from "react";
import styled from "styled-components";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import { FiChrome } from "react-icons/fi";

const WavesDisplay = dynamic(() => import("./WavesDisplay"), { ssr: false });
import TransportButtons from "./TransportButtons";

import { useAdditiveWaves } from "../context/AdditiveWavesContext";

const WavesCanvas = () => {
  const { waves } = useAdditiveWaves();

  const canvasRef = useRef<HTMLCanvasElement>(null!);

  useEffect(() => {
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d")!;

    const pixelRatio = 2;

    const draw = () => {
      const w = canvas.parentElement?.offsetWidth!;
      const h = canvas.parentElement?.offsetHeight!;

      const width = w * pixelRatio;
      const height = h * pixelRatio;

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width / pixelRatio}px`;
      canvas.style.height = `${height / pixelRatio}px`;

      const lineSpacing = canvas.height / 10;
      const lineSpacingX = canvas.width / 10;

      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";
      ctx.lineWidth = 4;

      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "hsl(255, 255%, 255%, 0.01)");
      gradient.addColorStop(0.5, "hsl(255, 255%, 255%, 0.03)");
      gradient.addColorStop(1, "hsl(255, 255%, 255%, 0.01)");

      ctx.strokeStyle = gradient;

      // Grid rows
      for (let i = 1; i < 10; i++) {
        const y = lineSpacing * i;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Grid columns
      for (let j = 1; j < 10; j++) {
        const x = lineSpacingX * j;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      ctx.strokeStyle = "hsl(301, 92%, 42%, 1)";
      ctx.lineWidth = 8;

      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      for (let x = 0; x < width; x += 0.5) {
        let combinedAmplitude = 0;

        for (let wave of waves.data) {
          combinedAmplitude +=
            wave.waveform === "sine"
              ? wave.calcSample(x, width, 44100)
              : wave.waveform === "square"
              ? wave.calcSampleSquareWave(x, width, 44100)
              : wave.waveform === "sawtooth"
              ? wave.calcSampleSawtoothWave(x, width, 44100)
              : wave.calcSampleTriangleWave(x, width, 44100);
        }

        const scaleFactor = 150;
        combinedAmplitude *= scaleFactor;

        const y = height / 2 - combinedAmplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      for (let wave of waves.data) {
        wave.update();
      }

      ctx.stroke();

      requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      const w = canvas.parentElement?.offsetWidth!;
      const h = canvas.parentElement?.offsetHeight!;

      const width = w * pixelRatio;
      const height = h * pixelRatio;

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width / pixelRatio}px`;
      canvas.style.height = `${height / pixelRatio}px`;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [waves.data]);

  return (
    <>
      <Wrapper>
        <Container>
          <CanvasWrapper>
            <CanvasStyled
              ref={canvasRef}
              id="waves-canvas"
              width="600"
              height="400"
            />
          </CanvasWrapper>
          <TransportButtons />
        </Container>
        <ParamsWrapper>
          <WavesDisplay />
        </ParamsWrapper>
      </Wrapper>
      <BottomWrapper>
        <LevelTitle>Work in progress 🚀</LevelTitle>
        <BestExperienceText>
          For the best experience, please use a Chromium-based
          <span style={{ margin: "0 4px", position: "relative", top: 2 }}>
            <FiChrome />
          </span>
          browser
        </BestExperienceText>
      </BottomWrapper>
    </>
  );
};

export default observer(WavesCanvas);

const Wrapper = styled.div`
  display: grid;
  position: relative;
  border-radius: 8px;
  background: linear-gradient(
    -135deg,
    hsla(257, 68%, 16%, 0.5) 30%,
    hsla(257, 68%, 12%, 1) 100%
  );
  border: 1px solid hsla(257, 68%, 36%, 0.13);
  border-bottom: 5px solid hsla(257, 68%, 36%, 0.23);
  margin: 0 auto;
  filter: drop-shadow(0px 0px 10px hsla(257, 68%, 36%, 0.13));
  grid-template-columns: 1fr;
  max-width: 475px;
  padding: 2px;

  @media (min-width: 800px) {
    grid-template-columns: 1fr 1fr;
    height: 570px;
    max-width: unset;
    width: fit-content;
    padding: 20px;
    gap: 20px;
  }
`;

const Container = styled.div`
  position: relative;
`;

const ParamsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  button {
    margin-bottom: 0.5rem;
  }
`;

const CanvasStyled = styled.canvas`
  position: absolute;
  border: 1px solid hsla(257, 68%, 36%, 0.23);
  border-radius: 6px;
  background: linear-gradient(
    -135deg,
    hsla(257, 68%, 8%, 0.5) 30%,
    hsla(257, 68%, 6%, 1) 100%
  );
  width: 100%;
  height: 100%;
  inset: 0;

  @media (min-width: 800px) {
    border-radius: 2px;
  }
`;

const CanvasWrapper = styled.div`
  position: relative;
  height: 325px;

  @media (min-width: 800px) {
    width: 450px;
    height: 400px;
  }
`;

const BottomWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
`;

const LevelTitle = styled.span`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--primaryColorLighter);
  display: block;
`;

const BestExperienceText = styled.span`
  font-size: 1.6rem;
  text-align: center;
  color: var(--primaryColorLighter);
  opacity: 0.85;
  font-weight: 500;
  margin-top: 20px;
`;
