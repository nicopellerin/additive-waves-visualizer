import styled from 'styled-components'
import { MotionProps, motion } from 'framer-motion'

interface StyleProps {
  variant: 'primary' | 'secondary' | 'gradient'
}

const variants: Record<
  'primary' | 'secondary' | 'gradient',
  Record<string, string>
> = {
  primary: {
    backgroundColor: 'var(--primaryButtonColor)',
    filter: 'drop-shadow(0 0 0.75rem hsla(305, 56%, 55%, 0.5))',
    filterHover: 'drop-shadow(0 0 0.75rem hsla(305, 56%, 55%, 0.8))',
    gradient: `hsla(305, 56%, 52%, 0.95), hsla(305, 56%, 32%, 0.95) 50%, hsla(305, 56%, 42%, 0.95) 100%`,
  },
  secondary: {
    backgroundColor: 'var(--secondaryColor)',
    filter: 'drop-shadow(0 0 0.75rem hsla(333, 65%, 52%, 0.5))',
    filterHover: 'drop-shadow(0 0 0.75rem hsla(333, 65%, 52%, 0.8))',
    gradient: ` hsla(333, 65%, 52%, 0.95), hsla(333, 65%, 35%, 0.95) 50%, hsla(333, 65%, 42%, 0.95) 100%`,
  },
  gradient: {
    backgroundColor: `linear-gradient(
      -145deg,
      var(--primaryColor),
      var(--secondaryColor)
    )`,
    filter: 'drop-shadow(0 0 0.75rem rgba(221, 94, 152, 0.5))',
    filterHover: 'drop-shadow(0 0 0.75rem rgba(221, 94, 152, 0.8))',
  },
}

type ButtonProps = React.HTMLAttributes<HTMLButtonElement> & MotionProps

interface Props extends ButtonProps {
  children: React.ReactNode
  variant: StyleProps['variant']
}

const Button = ({ children, variant, ...props }: Props) => {
  return (
    <ButtonWrapper variant={variant} {...props}>
      {children}
    </ButtonWrapper>
  )
}

const ButtonWrapper = styled(motion.button)<StyleProps>`
  border: none;
  padding: 18px 20px;
  font-size: 1.8rem;
  border-radius: var(--border-radius-4);
  background: ${({
    variant = 'primary',
  }: StyleProps) => `linear-gradient(${variants[variant].backgroundColor}, ${variants[variant].backgroundColor}),
        linear-gradient(270deg, ${variants[variant].gradient})`};
  background-repeat: no-repeat;
  background-origin: padding-box, border-box;
  background-size:
    100% 100%,
    100% 200%;
  background-position:
    0 0,
    0 100%;
  border: 3px solid transparent;
  color: #f4f4f4;
  font-weight: 600;
  display: flex;
  align-items: center;
  cursor: pointer;
  will-change: transform;
  filter: ${({ variant = 'primary' }: StyleProps) =>
    variant && variants[variant].filter};
  line-height: 1;
  transition: filter 0.2s ease;
  justify-content: center;
  font-family: var(--headingFont);

  @media (max-width: 500px) {
    width: 100%;
  }

  &:disabled {
    opacity: 0.75;
    cursor: not-allowed;
  }

  &:hover {
    filter: ${({ variant = 'primary' }: StyleProps) =>
      variant && variants[variant].filterHover};
  }
`

export default Button
