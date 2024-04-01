import { MotionValue } from 'framer-motion'
import { makeAutoObservable } from 'mobx'
import { disablePageScroll, enablePageScroll } from 'scroll-lock'

import remapValues from '../utils/remapValues'

class _Knob {
  rotation: MotionValue<number>
  isRotating = false
  value = 100
  min = 0
  max = 100
  defaultValue = 100
  onChange: (value: number) => void

  constructor(
    rotation: MotionValue<number>,
    min: number,
    max: number,
    defaultValue: number,
    onChange: (value: number) => void,
  ) {
    this.rotation = rotation
    this.rotation.set(remapValues(this.rotation.get(), min, max, -135, 135))

    this.min = min
    this.max = max
    this.defaultValue = defaultValue

    this.onChange = onChange

    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)

    this.addEventListeners()

    makeAutoObservable(this)
  }

  private addEventListeners() {
    if (typeof window !== 'undefined') {
      document.addEventListener('pointermove', this.handleMouseMove)
      document.addEventListener('pointerup', this.handleMouseUp)
    }
  }

  addMouseDownEvent(el: HTMLDivElement) {
    el.addEventListener('pointerdown', this.handleMouseDown)

    return () => {
      el.removeEventListener('pointerdown', this.handleMouseDown)
    }
  }

  removeEventListeners() {
    if (typeof window !== 'undefined') {
      document.removeEventListener('pointermove', this.handleMouseMove)
      document.removeEventListener('pointerup', this.handleMouseUp)
    }
  }

  private handleMouseDown = () => {
    this.isRotating = true
    disablePageScroll()
  }

  private handleMouseMove = (e: PointerEvent) => {
    if (this.isRotating) {
      document.documentElement.style.cursor = 'none'

      let deltaY

      if (e.pointerType === 'touch') {
        e.preventDefault()
        deltaY = e.offsetY * 0.1
      } else {
        deltaY = e.movementY * 2
      }

      const newRotation = this.rotation.get() - deltaY * 2

      const clampedRotation = Math.max(-135, Math.min(135, newRotation))

      this.rotation.set(clampedRotation)

      const mappedValue = remapValues(
        clampedRotation,
        -135,
        135,
        this.min,
        this.max,
      )

      this.value = mappedValue

      this.onChange(remapValues(mappedValue, this.min, this.max, 0, 1))
    }
  }

  private handleMouseUp = () => {
    this.isRotating = false
    document.documentElement.style.cursor = 'initial'

    enablePageScroll()
    this.removeEventListeners()
  }
}

export class Knob {
  static create(
    rotation: MotionValue<number>,
    min: number,
    max: number,
    defaultValue: number,
    onChange: (value: number) => void,
  ) {
    return new _Knob(rotation, min, max, defaultValue, onChange)
  }
}

export default Knob
