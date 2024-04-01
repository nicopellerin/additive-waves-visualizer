import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { FaPlus, FaTrash } from "react-icons/fa";

import Slider from "./Slider";

import { useAdditiveWaves } from "../context/AdditiveWavesContext";

const WavesDisplay = () => {
  const {
    waves: w,
    handleSelectWaveform,
    handleMuteWave,
    handleWaveChange,
    handleAddWave,
    handleRemoveWave,
  } = useAdditiveWaves();

  const waves = w.data;

  return (
    <List>
      {waves.map((wave, index) => (
        <ListItem key={wave.id}>
          <HeadingWrapper>
            <Heading>
              <Label>
                <Freq>{Math.floor(waves[index].frequency)}hz</Freq>
              </Label>
              <div>
                <SelectedWaveButton
                  isActive={waves[index].waveform === "sine"}
                  onClick={() => handleSelectWaveform(index, "sine")}
                >
                  Sine
                </SelectedWaveButton>
                <SelectedWaveButton
                  isActive={waves[index].waveform === "square"}
                  onClick={() => handleSelectWaveform(index, "square")}
                >
                  Square
                </SelectedWaveButton>
                <SelectedWaveButton
                  isActive={waves[index].waveform === "sawtooth"}
                  onClick={() => handleSelectWaveform(index, "sawtooth")}
                >
                  Sawtooth
                </SelectedWaveButton>
                <SelectedWaveButton
                  isActive={waves[index].waveform === "triangle"}
                  onClick={() => handleSelectWaveform(index, "triangle")}
                >
                  Triangle
                </SelectedWaveButton>
              </div>
            </Heading>
          </HeadingWrapper>
          <BottomGroup>
            <Slider
              min={50}
              max={300}
              step={1}
              value={waves[index].frequency}
              onChange={(value) => handleWaveChange(index, "frequency", value)}
            />
            <ButtonGroup>
              <MuteButton
                style={{
                  background: waves[index].muted
                    ? "hsla(257, 68%, 50%, 1)"
                    : "hsla(257, 68%, 50%, 0.2)",
                  color:
                    waves[index].amplitude === 0
                      ? "var(--primaryColorLighter)"
                      : "var(--primaryColorLighter)",
                }}
                onClick={() => {
                  handleMuteWave(index);
                }}
              >
                M
              </MuteButton>
              <DeleteButton
                onClick={() => handleRemoveWave(index)}
                style={{
                  color:
                    waves[index].amplitude === 0
                      ? "var(--primaryColorLighter)"
                      : "var(--primaryColorLighter)",
                }}
              >
                <FaTrash size={"1.35rem"} />
              </DeleteButton>
            </ButtonGroup>
          </BottomGroup>
        </ListItem>
      ))}
      {waves?.length < 4 && (
        <AddWaveButton onClick={handleAddWave}>
          <FaPlus />
          Add wave
        </AddWaveButton>
      )}
    </List>
  );
};

export default observer(WavesDisplay);

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  background: hsla(257, 68%, 26%, 0.13);
  border: 1px solid hsla(257, 68%, 36%, 0.13);
  height: 100%;
  padding: 12px;
  border-radius: 2px;

  @media (min-width: 800px) {
    padding: 20px;
  }
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  padding: 20px 20px;
  border: 1px solid hsla(257, 68%, 36%, 0.13);
  background: linear-gradient(
    135deg,
    hsla(257, 68%, 8%, 0.3) 30%,
    hsla(257, 68%, 6%, 0.4) 100%
  );

  &:not(:last-child) {
    margin-bottom: 12px;
  }

  input {
    width: 100%;
  }

  @media (min-width: 800px) {
    padding: 20px 24px;
  }
`;

const Label = styled.label`
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--primaryColorLighter);
  display: block;
  margin-bottom: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Freq = styled.span`
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--primaryColorLighter);
  padding: 4px 8px;
  border-radius: 4px;
  font-variant-numeric: tabular-nums;
  width: 50px;
  display: flex;
  justify-content: center;
  user-select: none;
`;

const AddWaveButton = styled.button`
  background: hsla(257, 68%, 36%, 0.1);
  border: 2px dashed hsla(257, 68%, 36%, 0.13);
  border-radius: 4px;
  padding: 20px 24px;
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--primaryColorLighter);
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  user-select: none;
`;

const HeadingWrapper = styled.div`
  width: 100%;
`;

const Heading = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;

  div {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  @media (min-width: 1100px) {
    gap: 20px;
    margin-bottom: 10px;
  }
`;

const SelectedWaveButton = styled.button<{ isActive: boolean }>`
  background: hsla(257, 68%, 36%, 0.3);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 1.4rem;
  font-weight: ${(props) => (props.isActive ? 600 : 500)};
  color: var(--primaryColorLighter);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;

  ${(props) =>
    props.isActive && "background: hsla(167, 88%, 36%, 1); color: #333;"}
`;

const MuteButton = styled.button`
  border: none;
  border-radius: 2px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1.4rem;
  user-select: none;
`;

const DeleteButton = styled.button`
  background: var(--errorColor);
  border: none;
  border-radius: 2px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 6px;
`;

const BottomGroup = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 20px;
`;
