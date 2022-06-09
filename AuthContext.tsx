import { Dispatch, useEffect, useReducer } from 'react'

import { useFetch } from '~/context/FetchContext'
import {
  AuthAction,
  AuthActionType,
  authReducer,
  AuthState,
  initialState,
} from '~/reducers/auth'
import { IUser } from '~/types'
import { createCtx } from '~/utils/utils'

type AuthContextProps = {
  state: AuthState
  dispatch: Dispatch<AuthAction>
  getUser: () => Promise<IUser>
  signIn: (username: string, password: string) => Promise<IUser>
  signUp: (
    username: string,
    email: string,
    password: string,
    password_confirm: string
  ) => Promise<IUser>
  signOut: () => any
}
export const [useAuth, CtxProvider] = createCtx<AuthContextProps>()
// AuthProvider wrappes AuthContext.Provider
export function AuthProvider(props: React.PropsWithChildren<any>): JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const { authAxios } = useFetch()

  async function getUser(): Promise<IUser> {
    return authAxios.get<IUser>('me').then((response) => response.data)
  }
  function signIn(username: string, password: string): Promise<IUser> {
    return authAxios
      .post<IUser>('signin', { username, password })
      .then((response) => response.data)
  }

  function signUp(
    username: string,
    email: string,
    password: string,
    password_confirm: string
  ): Promise<IUser> {
    return authAxios
      .post<IUser>('signup', {
        username,
        email,
        password,
        password_confirm,
      })
      .then((response) => response.data)
  }
  function signOut() {
    dispatch({ type: AuthActionType.SIGNOUT })
    return authAxios.get('signout')
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getUser()
        dispatch({ type: AuthActionType.LOAD_USER, user })
      } catch (err) {
        dispatch({ type: AuthActionType.SIGNOUT })
        // console.log('object')
        console.log('cannot auto signin', err)
      }
    }
    fetchUser()
  }, [])

  return (
    <CtxProvider
      value={{ state, dispatch, getUser, signIn, signUp, signOut }}
      {...props}
    />
  )
}
