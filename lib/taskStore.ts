import { create } from "zustand";

type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string | null;
};

type TaskStore = {
  tasks: Task[];
  loading: boolean;
  filter: "all" | "pending" | "completed";
  setFilter: (filter: "all" | "pending" | "completed") => void;
  fetchTasks: () => Promise<void>;
  addTask: (title: string) => Promise<void>;
  toggleTask: (id: string, completed: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTask: (
    id: string,
    updates: Partial<Pick<Task, "title" | "description" | "dueDate">>
  ) => Promise<void>;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  filter: "all",
  setFilter: (filter) => set({ filter }),

  fetchTasks: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) return;
      const data = await res.json();
      set({ tasks: data });
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      set({ loading: false });
    }
  },

  addTask: async (title) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) get().fetchTasks();
    } catch (err) {
      console.error("Failed to add task", err);
    }
  },

  toggleTask: async (id, completed) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (res.ok) get().fetchTasks();
    } catch (err) {
      console.error("Failed to toggle task", err);
    }
  },

  deleteTask: async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) get().fetchTasks();
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  },

  updateTask: async (id, updates) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) get().fetchTasks();
    } catch (err) {
      console.error("Failed to update task", err);
    }
  },
}));
