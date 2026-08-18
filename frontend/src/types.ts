export interface RegisteredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accessToken: string;
}

export interface LoginReponse {
  id: string;
  accessToken: string;
}
