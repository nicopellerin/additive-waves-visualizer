import WavesCanvas from "./WavesCanvas";

import { AdditiveWavesProvider } from "../context/AdditiveWavesContext";

const AdditiveWavesViz = () => {
  return (
    <AdditiveWavesProvider>
      <WavesCanvas />
    </AdditiveWavesProvider>
  );
};

export default AdditiveWavesViz;
