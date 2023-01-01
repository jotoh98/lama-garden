type Transition<T extends string> = T | {
  to: T,
  action: () => void;
};
type FSMDefinition<T extends string> = {
  initial: T
  states: T[]
  transitions: Partial<{
    [key in T]: (Transition<T>)[]
  }>
}

const stateFromTransition = <T extends string>(transition: Transition<T>) => typeof transition === "string" ? transition : transition.to

export const create = <T extends string>(
  opts: FSMDefinition<T>
) => {
  let state = opts.initial

  return {
    state,
    transition: (next?: T) => {
      if (!next) {
        const c = Object.values(opts.transitions[state] ?? {})
        if (c.length === 1) {
          state = stateFromTransition(c[0])
        }
        throw new Error(`No transition defined for state ${state}`)
      }
      const transition = opts.transitions[state]?.find(t => stateFromTransition(t) === next)

      if (typeof transition === "undefined") {
        return false
      }
      state = stateFromTransition(transition)
      if (typeof transition === "object") {
        transition.action()
      }
      return true
    }
  }
}

