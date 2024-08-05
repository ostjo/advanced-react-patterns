// Control Props
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import warning from 'warning'
import {Switch} from '../switch'

const useControlledSwitchWarning = controlPropValue => {
  const isControlled = controlPropValue != null
  const isControlledRef = React.useRef(isControlled)

  React.useEffect(() => {
    const uncontrolledToControlled = !isControlledRef.current && isControlled
    const controlledToUncontrolled = isControlledRef.current && !isControlled
    warning(
      !uncontrolledToControlled,
      'Warning: A component is changing from uncontrolled to controlled. Components should not switch from uncontrolled to controlled (or vice versa).',
    )
    warning(
      !controlledToUncontrolled,
      'Warning: A component is changing from controlled to uncontrolled. Components should not switch from uncontrolled to controlled (or vice versa).',
    )
  }, [isControlled, isControlledRef])
}

const useOnChangeReadOnlyWarning = ({
  onChangePropValue,
  controlPropValue,
  readOnly,
}) => {
  const hasOnChange = Boolean(onChangePropValue)
  const isControlled = controlPropValue != null

  React.useEffect(() => {
    const isReadOnly = !hasOnChange && isControlled && !readOnly
    warning(
      !isReadOnly,
      'Warning: Failed prop type: You provided an `on` prop to a toggle without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.',
    )
  }, [hasOnChange, isControlled, readOnly])
}

const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach(fn => fn?.(...args))

const actionTypes = {
  toggle: 'toggle',
  reset: 'reset',
}

function toggleReducer(state, {type, initialState}) {
  switch (type) {
    case actionTypes.toggle: {
      return {on: !state.on}
    }
    case actionTypes.reset: {
      return initialState
    }
    default: {
      throw new Error(`Unsupported type: ${type}`)
    }
  }
}

function useToggle({
  initialOn = false,
  reducer = toggleReducer,
  onChange,
  on: controlledOn,
  readOnly = false,
} = {}) {
  const {current: initialState} = React.useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)
  // 🐨 determine whether on is controlled
  const onIsControlled = controlledOn != null
  const on = onIsControlled ? controlledOn : state.on

  // this is pretty much the only case where it's legitimate to
  // conditionally call a hook.
  // the NODE_ENV will never change for the entire lifetime of the application.
  // also, due to dead code elimination both functions will be excluded from
  // production build.
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useControlledSwitchWarning(controlledOn)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useOnChangeReadOnlyWarning({
      onChangePropValue: onChange,
      controlPropValue: controlledOn,
      readOnly,
    })
  }

  // 1. accept an action
  // 2. if onIsControlled is false, call dispatch with that action
  // 3. Then call `onChange` with our "suggested changes" and the action.

  // 🦉 "Suggested changes" refers to: the changes we would make if we were
  // managing the state ourselves. This is similar to how a controlled <input />
  // `onChange` callback works. When your handler is called, you get an event
  // which has information about the value input that _would_ be set to if that
  // state were managed internally.
  // So how do we determine our suggested changes? What code do we have to
  // calculate the changes based on the `action` we have here? That's right!
  // The reducer! So if we pass it the current state and the action, then it
  // should return these "suggested changes!"
  const dispatchWithOnChange = action => {
    if (!onIsControlled) dispatch(action)
    onChange?.(reducer({...state, on}, action), action)
  }

  const toggle = () => dispatchWithOnChange({type: actionTypes.toggle})
  const reset = () =>
    dispatchWithOnChange({type: actionTypes.reset, initialState})

  function getTogglerProps({onClick, ...props} = {}) {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }

  function getResetterProps({onClick, ...props} = {}) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    }
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

function Toggle({on: controlledOn, onChange, initialOn, reducer}) {
  const {on, getTogglerProps} = useToggle({
    on: controlledOn,
    onChange,
    initialOn,
    reducer,
  })
  const props = getTogglerProps({on})
  return <Switch {...props} />
}

function App() {
  const [bothOn, setBothOn] = React.useState()
  const [timesClicked, setTimesClicked] = React.useState(0)

  function handleToggleChange(state, action) {
    if (action.type === actionTypes.toggle && timesClicked > 4) {
      return
    }
    setBothOn(state.on)
    setTimesClicked(c => c + 1)
  }

  function handleResetClick() {
    setBothOn(false)
    setTimesClicked(0)
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={bothOn} onChange={handleToggleChange} />
      </div>
      {timesClicked > 4 ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}
      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
          onChange={(...args) =>
            console.info('Uncontrolled Toggle onChange', ...args)
          }
        />
      </div>
    </div>
  )
}

export default App
// we're adding the Toggle export for tests
export {Toggle}

/*
eslint
  no-unused-vars: "off",
*/
