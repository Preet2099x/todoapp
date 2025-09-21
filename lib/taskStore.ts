import { create } from "zustand";

type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string | null;
};

type ActionResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

type TaskStore = {
  tasks: Task[];
  loading: boolean;
  adding: boolean;
  busyById: Record<string, boolean>;
  filter: "all" | "pending" | "completed";

  // actions
  setFilter: (f: "all" | "pending" | "completed") => void;
  fetchTasks: () => Promise<ActionResult<Task[]>>;
  addTask: (title: string, description?: string, dueDate?: string) => Promise<ActionResult<Task>>;
  toggleTask: (id: string, completed: boolean) => Promise<ActionResult<Task>>;
  deleteTask: (id: string) => Promise<ActionResult<null>>;
  updateTask: (
    id: string,
    updates: Partial<Pick<Task, "title" | "description" | "dueDate">>
  ) => Promise<ActionResult<Task>>;
};

function handle401() {
  // Wipe state and force relogin
  window.location.href = "/login";
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  adding: false,
  busyById: {},
  filter: "all",

  setFilter: (f) => set({ filter: f }),

  fetchTasks: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/tasks");
      if (res.status === 401) {
        handle401();
        return { ok: false, error: "Unauthorized" };
      }
      if (!res.ok) return { ok: false, error: "Failed to fetch tasks" };

      const data = await res.json();
      set({ tasks: data });
      return { ok: true, data };
    } catch {
      return { ok: false, error: "Network error" };
    } finally {
      set({ loading: false });
    }
  },

  addTask: async (title, description, dueDate) => {
    set({ adding: true });
    // optimistic insert
    const temp: Task = {
      id: "tmp-" + Date.now(),
      title,
      description,
      completed: false,
      dueDate: dueDate || null,
    };
    set((s) => ({ tasks: [temp, ...s.tasks] }));

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, dueDate }),
      });
      if (res.status === 401) {
        handle401();
        return { ok: false, error: "Unauthorized" };
      }
      if (!res.ok) {
        // rollback
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== temp.id) }));
        return { ok: false, error: "Failed to add task" };
      }

      const newTask = await res.json();
      // replace temp with real
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === temp.id ? newTask : t)),
      }));
      return { ok: true, data: newTask };
    } catch {
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== temp.id) }));
      return { ok: false, error: "Network error" };
    } finally {
      set({ adding: false });
    }
  },

  toggleTask: async (id, completed) => {
    // optimistic update
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, completed } : t
      ),
      busyById: { ...s.busyById, [id]: true },
    }));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (res.status === 401) {
        handle401();
        return { ok: false, error: "Unauthorized" };
      }
      if (!res.ok) {
        get().fetchTasks(); // rollback with server truth
        return { ok: false, error: "Failed to toggle task" };
      }
      const updated = await res.json();
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? updated : t)),
      }));
      return { ok: true, data: updated };
    } catch {
      get().fetchTasks();
      return { ok: false, error: "Network error" };
    } finally {
      set((s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...rest } = s.busyById;
        return { busyById: rest };
      });
    }
  },

  deleteTask: async (id) => {
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== id),
      busyById: { ...s.busyById, [id]: true },
    }));

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.status === 401) {
        handle401();
        return { ok: false, error: "Unauthorized" };
      }
      if (!res.ok) {
        get().fetchTasks(); // rollback
        return { ok: false, error: "Failed to delete task" };
      }
      return { ok: true, data: null };
    } catch {
      get().fetchTasks();
      return { ok: false, error: "Network error" };
    } finally {
      set((s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...rest } = s.busyById;
        return { busyById: rest };
      });
    }
  },

  updateTask: async (id, updates) => {
    set((s) => ({
      busyById: { ...s.busyById, [id]: true },
    }));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.status === 401) {
        handle401();
        return { ok: false, error: "Unauthorized" };
      }
      if (!res.ok) return { ok: false, error: "Failed to update task" };

      const updated = await res.json();
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? updated : t)),
      }));
      return { ok: true, data: updated };
    } catch {
      return { ok: false, error: "Network error" };
    } finally {
      set((s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...rest } = s.busyById;
        return { busyById: rest };
      });
    }
  },
}));
