export interface IFormInput {
  email: string;
  password: string;
}

export interface UserLoginPageInterface {
  settogglePage: (text: string) => string | any;
}

export interface BreadCrumbInterface {
  onClick: any;
  textFirst: string;
  textSecond: string;
}
