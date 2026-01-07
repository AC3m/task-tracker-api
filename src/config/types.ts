export interface Task {
  id?: string;
  task: string;
  done?: boolean;
  createdAt?: Date;
}

export interface GetTaskDto {
  id: string;
}

export interface CreateTaskDto {
  task: string;
}

export interface UpdateTaskDto {
  id: string;
}

export interface TaskResponse {
  id: string;
  task: string;
  done: boolean;
  createdAt: string | undefined;
}

export interface CustomError extends Error {
  status?: number;
}
