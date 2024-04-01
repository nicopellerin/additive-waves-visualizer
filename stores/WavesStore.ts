import { makeAutoObservable } from "mobx";

export type Waveforms = "sine" | "square" | "sawtooth" | "triangle";

export class Wave {
  private _id: string = Math.random().toString(36);
  private _amplitude: number;
  private _frequency: number;
  private _phase: number;
  private _zoom: number = 10;
  private _isMuted: boolean = false;
  private _visualPhase: number;
  private _isPlaying: boolean = false;
  private _waveform: Waveforms = "sine";

  constructor(amp: number, frequency: number, phase: number) {
    this._amplitude = amp;
    this._frequency = frequency;
    this._phase = phase;
    this._visualPhase = phase;

    makeAutoObservable(this, {
      calcSample: false,
      calcAudioSample: false,
    });
  }

  get id() {
    return this._id;
  }

  get frequency() {
    return this._frequency;
  }

  setFrequency(frequency: number) {
    this._frequency = frequency;
  }

  get amplitude() {
    return this._amplitude;
  }

  setAmplitude(amplitude: number) {
    this._amplitude = amplitude;
  }

  get phase() {
    return this._phase;
  }

  setPhase(phase: number) {
    this._phase = phase;
  }

  get zoom() {
    return this._zoom;
  }

  get visualPhase() {
    return this._visualPhase;
  }

  set visualPhase(phase: number) {
    this._visualPhase = phase;
  }

  get isPlaying() {
    return this._isPlaying;
  }

  setIsPlaying(isPlaying: boolean) {
    this._isPlaying = isPlaying;
  }

  get muted() {
    return this._isMuted;
  }

  setMuted(isMuted: boolean) {
    this._isMuted = isMuted;
  }

  calcSample(x: number, width: number, sampleRate: number) {
    const scale = ((width * this.frequency) / sampleRate) * this.zoom;
    const sampleNumber = (x * this.frequency) / scale;
    const sampleAngle =
      (sampleNumber / sampleRate) * (this.frequency * 2 * Math.PI) +
      this.visualPhase;
    return Math.sin(sampleAngle) * this.amplitude;
  }

  // Canvas
  calcSampleSquareWave(x: number, width: number, sampleRate: number) {
    const scale = ((width * this.frequency) / sampleRate) * this.zoom;
    const sampleNumber = (x * this.frequency) / scale;
    const sampleAngle =
      (sampleNumber / sampleRate) * (this.frequency * 2 * Math.PI) +
      this.visualPhase;
    return Math.sign(Math.sin(sampleAngle)) * this.amplitude;
  }

  calcSampleSawtoothWave(x: number, width: number, sampleRate: number) {
    const scaleFactor = 300;
    const scale = ((width * this.frequency) / sampleRate) * scaleFactor;
    const sampleNumber = (x * scale) / sampleRate + this.visualPhase;

    const periodPosition = sampleNumber % 1;

    const sawtoothSample = 2 * periodPosition - 1;

    return sawtoothSample * this.amplitude;
  }

  calcSampleTriangleWave(x: number, width: number, sampleRate: number) {
    const scaleFactor = 300;
    const scale = ((width * this.frequency) / sampleRate) * scaleFactor;
    const sampleNumber = (x * scale) / sampleRate + this.visualPhase * 2;

    const periodPosition = sampleNumber % 1;

    const triangleSample =
      4 * Math.abs(periodPosition - Math.floor(periodPosition + 0.75) + 0.25) -
      1;

    return triangleSample * this.amplitude;
  }

  // Audio
  calcAudioSample(sampleTime: number) {
    const sampleAngle = sampleTime * this.frequency * 2 * Math.PI + this.phase;
    return Math.sin(sampleAngle) * this.amplitude;
  }

  calcAudioSampleSquareWave(sampleTime: number) {
    const sampleAngle = sampleTime * this.frequency * 2 * Math.PI + this.phase;
    return Math.sign(Math.sin(sampleAngle)) * this.amplitude;
  }

  calcAudioSampleSawtoothWave(sampleTime: number) {
    const periodPosition = (sampleTime * this.frequency) % 1;

    const sawtoothSample = 2 * periodPosition - 1;

    return sawtoothSample * this.amplitude;
  }

  calcAudioSampleTriangleWave(sampleTime: number) {
    const periodPosition = (sampleTime * this.frequency) % 1;

    const triangleSample =
      4 * Math.abs(periodPosition - Math.floor(periodPosition + 0.75) + 0.25) -
      1;

    return triangleSample * this.amplitude;
  }

  update() {
    if (!this.isPlaying) {
      this._visualPhase = this._visualPhase;
      return;
    }

    if (this.waveform === "sine" || this.waveform === "square") {
      this._visualPhase += 0.03;
    } else if (this.waveform === "sawtooth") {
      this.visualPhase += 0.005;
    } else {
      this.visualPhase += 0.002;
    }
  }

  get waveform() {
    return this._waveform;
  }

  setWaveform(value: Wave["waveform"]) {
    this._waveform = value;
  }
}

export type WaveNumericProperty = keyof Pick<
  Wave,
  "amplitude" | "phase" | "frequency"
>;

export class Waves {
  private _data: Wave[] = [
    new Wave(
      0.5,
      Math.random() * (300 - 50) + 50,
      Math.random() * (Math.PI * 2)
    ),
  ];
  private _globalVolume: number = 1;
  private _isGlobalBypassed: boolean = false;

  constructor() {
    this.updateWave = this.updateWave.bind(this);
    this.handleMuteWave = this.handleMuteWave.bind(this);
    this.updateAmplitudes = this.updateAmplitudes.bind(this);
    this.handleGlobalBypass = this.handleGlobalBypass.bind(this);
    this.setGlobalVolume = this.setGlobalVolume.bind(this);

    makeAutoObservable(this);
  }

  get data() {
    return this._data;
  }

  get globalVolume() {
    return this._globalVolume;
  }

  setGlobalVolume(value: number) {
    this._globalVolume = Number(value.toFixed(2));
  }

  addWave(wave: Wave) {
    this._data.push(wave);
    this.updateAmplitudes();
  }

  removeWave(index: number) {
    this._data.splice(index, 1);
    this.updateAmplitudes();
  }

  get isGlobalBypassed() {
    return this._isGlobalBypassed;
  }

  handleGlobalBypass() {
    this._isGlobalBypassed = !this._isGlobalBypassed;
  }

  handleMuteWave(index: number) {
    this._data[index].setMuted(!this._data[index].muted);

    if (this._data[index].muted) {
      this.updateWave(index, "amplitude", 0);
    } else {
      this.updateWave(
        index,
        "amplitude",
        this._data.length === 1 ? 0.5 : 1 / this._data.length
      );
    }

    this.updateAmplitudes();
  }

  updateAmplitudes() {
    const activeWaves = this._data.filter((wave) => !wave.muted);
    const newAmplitude = activeWaves.length > 0 ? 1 / activeWaves.length : 0;

    for (let wave of this._data) {
      if (wave.muted) {
        wave.setAmplitude(0);
      } else {
        wave.setAmplitude(activeWaves.length === 1 ? 0.5 : newAmplitude);
      }
    }
  }

  updateWave(index: number, key: WaveNumericProperty, value: number) {
    const keyToCapitalized = (key.charAt(0).toUpperCase() +
      key.slice(1)) as Capitalize<WaveNumericProperty>;

    this._data[index][`set${keyToCapitalized}`](value);
  }
}
