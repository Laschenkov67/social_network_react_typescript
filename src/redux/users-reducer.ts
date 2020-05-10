import { usersAPI } from "../api/api";
import { updateObjectInArray } from "../utils/object-helpers";
import { UserType } from "../types/types";
import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { AppStateType } from "./redux-store";

const FOLLOW = 'FOLLOW';
const UNFOLLOW = 'UNFOLLOW';
const SET_USERS = 'SET_USERS';
const SET_CURRENT_PAGE = 'SET_CURRENT_PAGE';
const SET_TOTAL_USERS_COUNT = 'SET_TOTAL_USERS_COUNT';
const TOGGLE_IS_FETCHING = 'TOGGLE_IS_FETCHING';
const TOGGLE_IS_FOLLOWING_PROGRESS = 'TOGGLE_IS_FOLLOWING_PROGRESS';

let initialState = {
    users: [] as Array<UserType>,
    pageSize: 10 as number,
    totalUsersCount: 0 as number,
    currentPage: 1 as number,
    isFetching: true as boolean,
    followingInProgress: [] as Array<number>,
    fake: 10 as number
};

export type initialStateType = typeof initialState;
type ActionTypes = followSuccessActionType | unfollowSuccessActionType |
    setUsersActionType | setCurrentPageActionType | toggleIsFetchingActionType |
    toggleFollowingProgressActionType | setTotalUsersCountActionType;


const usersReducer = (state = initialState, action: ActionTypes): initialStateType => {
    switch (action.type) {
        case FOLLOW:
            return {
                ...state,
                users: updateObjectInArray(state.users, action.userId, "id", { followed: true })
            }
        case UNFOLLOW:
            return {
                ...state,
                users: updateObjectInArray(state.users, action.userId, "id", { followed: false })
            }
        case SET_USERS: {
            return { ...state, users: action.users }
        }
        case SET_CURRENT_PAGE: {
            return { ...state, currentPage: action.currentPage }
        }
        case SET_TOTAL_USERS_COUNT: {
            return { ...state, totalUsersCount: action.count }
        }
        case TOGGLE_IS_FETCHING: {
            return { ...state, isFetching: action.isFetching }
        }
        case TOGGLE_IS_FOLLOWING_PROGRESS: {
            return {
                ...state,
                followingInProgress: action.isFetching
                    ? [...state.followingInProgress, action.userId]
                    : state.followingInProgress.filter(id => id != action.userId)
            }
        }
        default:
            return state;
    }
}

type followSuccessActionType = {
    type: typeof FOLLOW,
    userId: number
}

type unfollowSuccessActionType = {
    type: typeof UNFOLLOW,
    userId: number
}

type setUsersActionType = {
    type: typeof SET_USERS,
    users: Array<UserType>
}

type setCurrentPageActionType = {
    type: typeof SET_CURRENT_PAGE,
    currentPage: number
}

type setTotalUsersCountActionType = {
    type: typeof SET_TOTAL_USERS_COUNT,
    count: number
}

type toggleIsFetchingActionType = {
    type: typeof TOGGLE_IS_FETCHING,
    isFetching: boolean
}

type toggleFollowingProgressActionType = {
    type: typeof TOGGLE_IS_FOLLOWING_PROGRESS,
    isFetching: boolean,
    userId: number
}


//Action
export const followSuccess = (userId: number): followSuccessActionType => ({ type: FOLLOW, userId })
export const unfollowSuccess = (userId: number): unfollowSuccessActionType => ({ type: UNFOLLOW, userId })
export const setUsers = (users: Array<UserType>): setUsersActionType => ({ type: SET_USERS, users })

export const setCurrentPage = (currentPage: number): setCurrentPageActionType =>
    ({ type: SET_CURRENT_PAGE, currentPage })

export const setTotalUsersCount = (totalUsersCount: number): setTotalUsersCountActionType =>
    ({ type: SET_TOTAL_USERS_COUNT, count: totalUsersCount })

export const toggleIsFetching = (isFetching: boolean): toggleIsFetchingActionType =>
    ({ type: TOGGLE_IS_FETCHING, isFetching })

export const toggleFollowingProgress = (isFetching: boolean, userId: number): toggleFollowingProgressActionType => ({
    type: TOGGLE_IS_FOLLOWING_PROGRESS,
    isFetching,
    userId
})

//1-й способ типизации thunk
type DispatchType = Dispatch<ActionTypes>;
//2-й способ типизации thunk из официальной документации
type thunkType = ThunkAction<Promise<void>, AppStateType, unknown, ActionTypes>

export const requestUsers = (page: number, pageSize: number) => {
    return async (dispatch: DispatchType) => {
        dispatch(toggleIsFetching(true));
        dispatch(setCurrentPage(page));

        let data = await usersAPI.getUsers(page, pageSize);
        dispatch(toggleIsFetching(false));
        dispatch(setUsers(data.items));
        dispatch(setTotalUsersCount(data.totalCount));
    }
}

const followUnfollowFlow = async (dispatch: DispatchType, userId: number, apiMethod: any, actionCreator: (userId: number) => followSuccessActionType | unfollowSuccessActionType) => {
    dispatch(toggleFollowingProgress(true, userId));
    let response = await apiMethod(userId);

    if (response.data.resultCode == 0) {
        dispatch(actionCreator(userId));
    }
    dispatch(toggleFollowingProgress(false, userId));
}

export const follow = (userId: number): thunkType => {
    return async (dispatch) => {
        followUnfollowFlow(dispatch, userId, usersAPI.follow.bind(usersAPI), followSuccess);
    }
}
export const unfollow = (userId: number): thunkType => {
    return async (dispatch) => {
        followUnfollowFlow(dispatch, userId, usersAPI.unfollow.bind(usersAPI), unfollowSuccess);
    }
}

export default usersReducer;