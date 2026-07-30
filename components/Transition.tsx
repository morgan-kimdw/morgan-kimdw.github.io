import { PageVariants } from '@/animations/page-var'
import type { FC, PropsWithChildren, ReactNode } from 'react'
import * as motion from 'motion/react-client'

const Transition: FC<PropsWithChildren> = ({ children }) => {
  return (
    <motion.div
      variants={PageVariants}
      initial="hidden"
      animate="enter"
      exit="exit"
      transition={{ type: 'tween', ease: 'linear' }}
    >
      {children}
    </motion.div>
  )
}

export default Transition
