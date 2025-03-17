// src/constants.js
export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    USER: "USER",
  };
  
  export const INITIAL_USERS = [
    {
      email: "superadmin@example.com",
      password: "superadmin123",
      role: ROLES.SUPER_ADMIN,
    },
    {
      email: "admin@example.com",
      password: "admin123",
      role: ROLES.ADMIN,
    },
  ];