export const initialState = {
  user: null,
};

export const actionTypes = {
  SET_USER: "SET_USER",
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.user,
      };
    case actionTypes.SET_GUEST:
      return {
        ...state,
        guestView: action.guestView,
      };
    default:
      return state;
  }
};

export default reducer;
