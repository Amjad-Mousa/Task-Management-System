export const CREATE_STUDENT_MUTATION = `
  mutation CreateStudent($input: CreateStudentInput!) {
    createStudent(input: $input) {
      id
      user_id
      universityId
      major
      year
    }
  }
`;
export const DELETE_STUDENT_MUTATION = `
  mutation DeleteStudent($id: ID!) {
    deleteStudent(id: $id) {
      id
    }
  }
`;
export const UPDATE_STUDENT_MUTATION = `
  mutation UpdateStudent($id: ID!, $input: UpdateStudentInput!) {
    updateStudent(id: $id, input: $input) {
      id
      user_id
      universityId
      major
      year
    }
  }
`;
export const GET_STUDENTS_QUERY = `
  query GetStudents {
    students {
      id
      user_id
      universityId
      major
      year
    }
  }
`;
export const GET_STUDENT_QUERY = `
  query GetStudent($id: ID!) {
    student(id: $id) {
      id
      user_id
      universityId
      major
      year
    }
  }
`;
export const GET_STUDENT_BY_USER_QUERY = `
  query GetStudentByUser($userId: ID!) {
    studentByUserId(userId: $userId) {
      id
      user_id
      universityId
      major
      year
    }
  }
`;
export const GET_STUDENT_USER_QUERY = `
  query GetStudentUser($id: ID!) {
    student(id: $id) {
      user {
        id
        name
        email
        role
      }
    }
  }
`;
