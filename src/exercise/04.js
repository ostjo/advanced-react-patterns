// Prop Collections and Getters
// http://localhost:3000/isolated/exercise/04.js

import * as React from 'react'
import {Switch} from '../switch'

//------------- PROP COLLECTIONS -------------

// function useToggle() {
//   const [on, setOn] = React.useState(false)
//   const toggle = () => setOn(!on)

//   return {
//     on,
//     toggle,
//     togglerProps: {
//       'aria-pressed': on,
//       onClick: toggle,
//     },
//   }
// }

// function App() {
//   const {on, togglerProps} = useToggle()
//   return (
//     <div>
//       <Switch on={on} {...togglerProps} />
//       <hr />
//       <button aria-label="custom-button" {...togglerProps}>
//         {on ? 'on' : 'off'}
//       </button>
//     </div>
//   )
// }

//------------- PROP GETTERS -------------

function useToggle() {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)
  const getTogglerProps = ({onClick, ...props} = {}) => ({
    'aria-pressed': on,
    onClick: () => {
      onClick?.()
      toggle()
    },
    ...props,
  })

  return {
    on,
    toggle,
    getTogglerProps,
  }
}

function App() {
  const {on, getTogglerProps} = useToggle()
  return (
    <div>
      <Switch {...getTogglerProps({on})} />
      <hr />
      <button
        {...getTogglerProps({
          'aria-label': 'custom-button',
          onClick: () => console.info('onButtonClick'),
        })}
      >
        {on ? 'on' : 'off'}
      </button>
    </div>
  )
}

export default App
