import AdditiveWavesViz from "@/components";
import styled from "styled-components";

export default function Index() {
  return (
    <Wrapper>
      <AdditiveWavesViz />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 100vh;
  display: grid;
  place-content: center;
`;
