import React from 'react';
import Paginator from "../common/Paginator/Paginator";
import User from "./User";
import { UserType } from '../../types/types';

interface IUsers {
    totalUsersCount: number, 
    pageSize: number, 
    currentPage: number, 
    onPageChanged:(pageNumber: number) => void, 
    portionSize?: number,
    users: Array<UserType>,
    followingInProgress: Array<number>,
    unfollow: (userId: number) => void,
    follow: (userId: number) => void
}

let Users: React.FC<IUsers> = ({currentPage, totalUsersCount, pageSize, onPageChanged, users, ...props}) => {
    return <div>
        <Paginator currentPage={currentPage} onPageChanged={onPageChanged}
                   totalItemsCount={totalUsersCount} pageSize={pageSize}/>
        <div>
            {
                users.map(u => <User user={u}
                                     followingInProgress={props.followingInProgress}
                                     key={u.id}
                                     unfollow={props.unfollow}
                                     follow={props.follow}
                    />
                )
            }
        </div>
    </div>
}

export default Users;