import {call, put, takeEvery} from "redux-saga/effects";
import {authAPI} from "../api/todolists-api";
import {setIsLoggedInAC} from "../features/Login/auth-reducer";
import {setAppInitializedAC} from "./app-reducer";

export function* initializeAppWorkerSaga() {
    const res = yield call(authAPI.me)
    if (res.data.resultCode === 0) {
        yield put(setIsLoggedInAC(true));
    } else {

    }
    yield put(setAppInitializedAC(true));
}
export const initializeApp = () => ({type: 'APP/INITIALIZE-APP'})
export function* appWatcherSaga() {
    yield takeEvery("APP/INITIALIZE-APP", initializeAppWorkerSaga)
}