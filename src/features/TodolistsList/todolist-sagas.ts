import {setAppStatusAC} from "../../app/app-reducer";
import {todolistsAPI} from "../../api/todolists-api";
import {handleServerNetworkErrorSaga} from "../../utils/error-utils";
import {
    addTodolistAC,
    changeTodolistEntityStatusAC, changeTodolistTitleAC,
    removeTodolistAC,
    setTodolistsAC
} from "./todolists-reducer";
import {call, put, takeEvery} from "redux-saga/effects";


export function* fetchTodolistsWorkerSaga() {
    yield put(setAppStatusAC('loading'))
    try {
        const res = yield call(todolistsAPI.getTodolists)
        yield put(setTodolistsAC(res.data))
        yield put(setAppStatusAC('succeeded'))
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}

export const fetchTodolists = () => {
    return {type: 'TODOLISTS/FETCH-TODOLISTS'}
}

export function* removeTodolistWorkerSaga(action: ReturnType<typeof removeTodolistAction>) {
    yield put(setAppStatusAC('loading'))
    yield put(changeTodolistEntityStatusAC(action.todolistId, 'loading'))
    const res = yield call(todolistsAPI.deleteTodolist, action.todolistId)
    yield put(removeTodolistAC(action.todolistId))
    //скажем глобально приложению, что асинхронная операция завершена
    yield put(setAppStatusAC('succeeded'))
}

export const removeTodolistAction = (todolistId: string) => {
    return {type: 'TODOLISTS/REMOVE-TODOLIST', todolistId}
}

export function* addTodolistWorkerSaga(action: ReturnType<typeof addTodolistAction>) {
    yield put(setAppStatusAC('loading'))

    const res = yield call(todolistsAPI.createTodolist, action.title)
    yield put(addTodolistAC(res.data.data.item))
    yield put(setAppStatusAC('succeeded'))
}

export const addTodolistAction = (title: string) => {
    return {type: 'TODOLISTS/ADD-TODOLIST', title}
}

export function* changeTodolistTitleWorkerSaga(action: ReturnType<typeof changeTodolistTitleAction>) {
    const res = yield call(todolistsAPI.updateTodolist, action.id, action.title)
    yield put(changeTodolistTitleAC(action.id, action.title))
}

export const changeTodolistTitleAction = (id: string, title: string) => {
    return {type: 'TODOLISTS/CHANGE-TODOLIST', id, title}
}
export function* todolistsWatcherSaga() {
    yield takeEvery("TODOLISTS/FETCH-TODOLISTS", fetchTodolistsWorkerSaga)
    yield takeEvery("TODOLISTS/REMOVE-TODOLIST", removeTodolistWorkerSaga)
    yield takeEvery("TODOLISTS/ADD-TODOLIST", addTodolistWorkerSaga)
    yield takeEvery("TODOLISTS/CHANGE-TODOLIST", changeTodolistTitleWorkerSaga)

}
