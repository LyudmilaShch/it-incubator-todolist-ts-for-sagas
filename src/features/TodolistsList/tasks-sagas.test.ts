import {call, put} from "redux-saga/effects";
import {GetTasksResponse, TaskPriorities, TaskStatuses, todolistsAPI} from "../../api/todolists-api";
import {setAppErrorAC, setAppStatusAC} from "../../app/app-reducer";
import {addTaskWatcherSaga, tasksSagas} from "./tasks-sagas";
import {setTasksAC} from "./tasks-reducer";


test('tasksSagas success flow', () => {
    let todolistId = "todolistId";
    const gen = tasksSagas({type: ' ', todolistId: todolistId})

    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))
    expect(gen.next().value).toEqual(call(todolistsAPI.getTasks, todolistId))

    const fakeApiResponse: GetTasksResponse = {
        error: '',

        totalCount: 1,
        items: [
            {
                id: "1", title: "CSS", status: TaskStatuses.New, todoListId: todolistId, description: '',
                startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
            },
        ]
    }
    expect(gen.next(fakeApiResponse).value).toEqual(put(setTasksAC(fakeApiResponse.items, todolistId)))
    let next = gen.next()
    expect(next.value).toEqual(put(setAppStatusAC('succeeded')))
    expect(next.done).toBeTruthy()
})

test('addTaskWatcherSaga error flow', () => {
    let todolistId = "todolistId";
    let title = 'task title';
    const gen = addTaskWatcherSaga({type: 'TASKS/ADD-TASK', title: title, todolistId: todolistId})

    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))
    expect(gen.next().value).toEqual(call(todolistsAPI.createTask, todolistId, title))
    expect(gen.throw({message: 'Some error'}).value).toEqual(put(setAppErrorAC('Some error')))
    expect(gen.next().value).toEqual(put(setAppStatusAC('failed')))
})