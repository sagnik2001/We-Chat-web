import React, { useCallback, useEffect, useRef, useState } from "react";

export const useStateWithCallback = (intialState) => {


  const [state, setState] = useState(intialState);
  const cbRef = useRef();
  const updateState = useCallback((newState, cb) => {
    console.log(newState,'cb')
    cbRef.current = cb;
    setState((prevState) => {
      return typeof newState === "function" ? newState(prevState) : prevState;
    });
  }, []);

  useEffect(() => {
    if (cbRef.current) {
      cbRef.current(state);
      cbRef.current = null;
    }
   
  }, [state]);

  return [state, updateState];
};
