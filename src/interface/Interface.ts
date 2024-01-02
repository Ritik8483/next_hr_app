export interface IFormInput {
  email: string;
  password: string;
}


export interface UserLoginPageInterface {
  settogglePage: (text: string) => string | any;
}