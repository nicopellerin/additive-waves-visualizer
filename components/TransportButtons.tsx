import { FaPlay, FaStop } from "react-icons/fa";
import styled from "styled-components";
import { observer } from "mobx-react-lite";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

import Button from "./Button";
const VolumeKnob = dynamic(() => import("./VolumeKnob"), {
  ssr: true,
});

import { useAdditiveWaves } from "../context/AdditiveWavesContext";

const TransportButtons = () => {
  const {
    waves,
    isGlobalBypassed,
    handleGlobalBypass,
    isPlaying,
    handlePlay,
    handleStop,
  } = useAdditiveWaves();

  return (
    <ButtonGroup>
      <BypassButton
        isActive={isGlobalBypassed}
        onClick={handleGlobalBypass}
        whileTap={{
          scale: 0.98,
        }}
      >
        BYPASS
      </BypassButton>
      <ButtonWrapper>
        <ButtonStyled
          variant="primary"
          onClick={handlePlay}
          animate={{
            scale: isPlaying ? 0.95 : 1,
            filter: "none",
          }}
        >
          <FaPlay />
        </ButtonStyled>
      </ButtonWrapper>
      <ButtonWrapper>
        <ButtonStyled
          variant="secondary"
          onClick={handleStop}
          style={{
            filter: "none",
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <FaStop />
        </ButtonStyled>
      </ButtonWrapper>
      <VolumeKnob onChange={(value: number) => waves.setGlobalVolume(value)} />
    </ButtonGroup>
  );
};

export default observer(TransportButtons);

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  padding: 20px 12px;

  @media (min-width: 800px) {
    margin-top: 10px;
    gap: 16px;
    padding: 20px;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsla(0, 8%, 56%, 0.1);
  padding: 4px;
  border-radius: 4px;
`;

const BypassButton = styled(motion.button)<{ isActive: boolean }>`
  background: hsla(300, 86%, 15%, 0.4);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 1.4rem;
  font-weight: 500;
  color: hsla(320, 86%, 76%, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-right: 12px;
  border: 2px solid hsla(320, 86%, 36%, 0.1);
  height: 40px;
  user-select: none;

  @media (min-width: 800px) {
    margin-right: 24px;
  }

  ${({ isActive }) =>
    isActive &&
    `background: hsla(20, 86%, 56%, 1);
    border: 2px solid hsla(20, 86%, 36%, 1);
    filter: drop-shadow(0px 0px 10px hsla(20, 86%, 36%, 1));
    color: hsla(20, 86%, 6%, 1);
  `}
`;

const ButtonStyled = styled(Button)`
  @media (max-width: 800px) {
    padding: 8px;
    width: 55px;
    height: 55px;
  }
`;
