export interface LoginResponse {
  data: AppUser;
  // token is httpOnly cookie in your case, so no need here
}

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  phoneNumber: string;
}
