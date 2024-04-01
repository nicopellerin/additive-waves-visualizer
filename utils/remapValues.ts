const remapValues = (
  inputValue: number,
  inputStart: number,
  inputEnd: number,
  outputStart: number,
  outputEnd: number
) => {
  return (
    outputStart +
    ((outputEnd - outputStart) / (inputEnd - inputStart)) *
      (inputValue - inputStart)
  )
}

export default remapValues
