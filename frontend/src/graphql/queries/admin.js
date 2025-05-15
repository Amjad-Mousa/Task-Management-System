export const CREATE_ADMIN_MUTATION = `
  mutation CreateAdmin($input: CreateAdminInput!) {
    createAdmin(input: $input) {
      id
      user_id
      permissions
    }
  }
`;
export const DELETE_ADMIN_MUTATION = `
  mutation DeleteAdmin($id: ID!) {
    deleteAdmin(id: $id) {
      id
    }
  }
`;
export const UPDATE_ADMIN_MUTATION = `
  mutation UpdateAdmin($id: ID!, $input: UpdateAdminInput!) {
    updateAdmin(id: $id, input: $input) {
      id
      user_id
      permissions
    }
  }
`;
export const GET_ADMINS_QUERY = `
  query GetAdmins {
    admins {
      id
      user_id
      permissions
      user {
        id
        name
        email
      }
    }
  }
`;
export const GET_ADMIN_QUERY = `
  query GetAdmin($id: ID!) {
    admin(id: $id) {
      id
      user_id
      permissions
    }
  }
`;
export const GET_ADMIN_BY_USER_QUERY = `
  query GetAdminByUser($userId: ID!) {
    adminByUserId(userId: $userId) {
      id
      user_id
      permissions
    }
  }
`;
export const GET_ADMIN_USER_QUERY = `
  query GetAdminUser($id: ID!) {
    admin(id: $id) {
      user {
        id
        name
        email
        role
      }
    }
  }
`;
