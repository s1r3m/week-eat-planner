export type AuthState = 'authenticated' | 'error' | 'guest' | 'pending'
export type LoginPayload = BackendSchema['UserLogin']
export type SignupPayload = BackendSchema['UserCreate']
export type SuccessResponse = BackendSchema['SuccessResponse']
export type UserData = BackendSchema['UserRead']
export type ValidationError = BackendSchema['ValidationError']
