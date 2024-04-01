import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { observer } from "mobx-react-lite";
import { motion, useMotionValue } from "framer-motion";

import Knob from "../stores/Knob";

interface Props {
  onChange: (value: number) => void;
}

const VolumeKnob = observer(({ onChange }: Props) => {
  const rotation = useMotionValue(100);

  const knobRef = useRef<HTMLDivElement>(null);

  const [knob] = useState(() => Knob.create(rotation, 0, 100, 100, onChange));

  useEffect(() => {
    if (knobRef.current) {
      const unsub = knob.addMouseDownEvent(knobRef.current);

      return () => {
        unsub();
      };
    }
  }, [knob]);

  return (
    <Wrapper>
      <KnobComp
        ref={knobRef}
        id="volume-knob"
        style={{
          rotate: knob.rotation,
        }}
      >
        <KnobLine />
      </KnobComp>
      <Title>Volume</Title>
    </Wrapper>
  );
});

export default VolumeKnob;

const Wrapper = styled.div`
  position: relative;
  margin-left: 12px;

  @media (min-width: 800px) {
    margin-left: 24px;
  }
`;

const KnobComp = styled(motion.div)`
  width: 100%;
  height: 100%;
  background: linear-gradient(
    -135deg,
    hsla(257, 68%, 26%, 1) 30%,
    hsla(257, 68%, 20%, 1) 100%
  );
  border-radius: 50%;
  transition: transform 0.2s;
  width: 44px;
  height: 44px;
`;

const KnobLine = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 50%;
  background: var(--secondaryColorLighter);
  transform: translateX(-50%);
`;

const Title = styled.span`
  display: block;
  font-size: 1.2rem;
  color: var(--primaryColorLighter);
  font-weight: 600;
  opacity: 0.75;
  user-select: none;
  margin-top: 2px;
`;
