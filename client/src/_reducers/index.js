import { combineReducers } from "redux"; // reducer 하나로 묶어줌
import user from "./user_reducer";

const rootReducer = combineReducers({
  user,
});

export default rootReducer;
