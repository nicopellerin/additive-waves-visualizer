import * as SliderUI from '@radix-ui/react-slider'
import styled from 'styled-components'

interface Props {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const Slider = ({
  value,
  onChange,
  min = 0,
  max = 1.5,
  step = 0.01,
}: Props) => {
  return (
    <SliderUIRoot
      defaultValue={[value]}
      min={min}
      max={max}
      step={step}
      aria-label="Volume"
      onValueChange={(value) => {
        onChange(Number(value))
      }}
    >
      <SliderUITrack>
        <SliderUIRange />
      </SliderUITrack>
      <SliderUIThumb />
    </SliderUIRoot>
  )
}

export default Slider

const SliderUIRoot = styled(SliderUI.Root)`
  position: relative;
  display: flex;
  align-items: center;
  user-select: none;
  touch-action: none;
  width: 100%;
  height: 20px;
`

const SliderUITrack = styled(SliderUI.Track)`
  background-color: #112;
  position: relative;
  flex-grow: 1;
  border-radius: 9999px;
  height: 5px;
`

const SliderUIRange = styled(SliderUI.Range)`
  position: absolute;
  background-color: #4823c9;
  border-radius: 9999px;
  height: 100%;
`

const SliderUIThumb = styled(SliderUI.Thumb)`
  display: block;
  width: 20px;
  height: 20px;
  background: linear-gradient(
    -135deg,
    hsla(257, 68%, 36%, 1) 30%,
    hsla(257, 68%, 62%, 1) 100%
  );
  border-radius: 10px;
  cursor: grab;
  border: 1px solid hsla(257, 68%, 46%, 0.8);

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px hsla(257, 98%, 26%, 0.3);
  }
`
