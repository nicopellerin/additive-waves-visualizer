import Head from "next/head";
import styled from "styled-components";

import AdditiveWavesViz from "@/components";

export default function Index() {
  return (
    <>
      <Head>
        <title>Additive Waves</title>
      </Head>
      <Wrapper>
        <AdditiveWavesViz />
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  height: 100vh;
  display: grid;
  place-content: center;
`;
