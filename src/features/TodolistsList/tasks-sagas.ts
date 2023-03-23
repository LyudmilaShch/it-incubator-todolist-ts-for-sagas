import {call, put, takeEvery, select} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {AxiosResponse} from "axios";
import {GetTasksResponse, ResponseType, TaskType, todolistsAPI, UpdateTaskModelType} from "../../api/todolists-api";
import {addTaskAC, removeTaskAC, setTasksAC, UpdateDomainTaskModelType, updateTaskAC} from "./tasks-reducer";
import {handleServerAppErrorSaga, handleServerNetworkErrorSaga} from "../../utils/error-utils";

export function* tasksSagas(action: ReturnType<typeof fetchTasks>) {
    yield put(setAppStatusAC('loading'))
    const data: GetTasksResponse = yield call(todolistsAPI.getTasks, action.todolistId)
    const tasks = data.items
    yield put(setTasksAC(tasks, action.todolistId))
    yield put(setAppStatusAC('succeeded'))
}

export const fetchTasks = (todolistId: string) => {
    return {type: 'TASKS/FETCH-TASKS', todolistId}
}

export function* removeTaskWorkerSaga(action: ReturnType<typeof removeTaskAction>) {
    const res: AxiosResponse<ResponseType> = yield call(todolistsAPI.deleteTask, action.todolistId, action.taskId)
    yield put(removeTaskAC(action.taskId, action.todolistId))
}

export const removeTaskAction = (taskId: string, todolistId: string) => ({
    type: 'TASKS/REMOVE-TASK',
    taskId,
    todolistId
})

export function* addTaskWatcherSaga(action: ReturnType<typeof addTaskAction>) {
    yield put(setAppStatusAC('loading'))
    try {
        const res = yield call(todolistsAPI.createTask, action.todolistId, action.title)
        if (res.data.resultCode === 0) {
            const task = res.data.data.item
            yield put(addTaskAC(task))
            yield put(setAppStatusAC('succeeded'))
        } else {
            yield* handleServerAppErrorSaga(res.data);
        }
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}

export const addTaskAction = (title: string, todolistId: string) => ({
    type: 'TASKS/ADD-TASK',
    title,
    todolistId
})

export function* updateTaskWatcherSaga(action: ReturnType<typeof updateTaskAction>) {
    const state = yield select()
    const task = state.tasks[action.todolistId].find((t: TaskType) => t.id === action.taskId)
    if (!task) {
        //throw new Error("task not found in the state");
        console.warn('task not found in the state')
        return
    }

    const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...action.domainModel
    }
    try {
        const res = yield call(todolistsAPI.updateTask, action.todolistId, action.taskId, apiModel)
        if (res.data.resultCode === 0) {
            yield put(updateTaskAC(action.taskId, action.domainModel, action.todolistId))
        } else {
            yield* handleServerAppErrorSaga(res.data);
        }
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}

export const updateTaskAction = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) => ({
    type: 'TASKS/UPDATE-TASK',
    taskId,
    domainModel,
    todolistId
})

export function* tasksWatcherSaga() {
    yield takeEvery("TASKS/FETCH-TASKS", tasksSagas)
    yield takeEvery("TASKS/REMOVE-TASK", removeTaskWorkerSaga)
    yield takeEvery("TASKS/ADD-TASK", addTaskWatcherSaga)
    yield takeEvery("TASKS/UPDATE-TASK", updateTaskWatcherSaga)
}

