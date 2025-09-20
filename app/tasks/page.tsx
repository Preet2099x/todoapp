"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useTaskStore } from "@/lib/taskStore";
import { Pencil, Trash2, CheckSquare, Square } from "lucide-react";

type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string | null;
};

export default function TasksPage() {
  const {
    tasks,
    loading,
    filter,
    setFilter,
    fetchTasks,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    adding,
    busyById,
  } = useTaskStore();

  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  if (loading) return <p className="text-center mt-10">Loading tasks...</p>;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await addTask(title.trim());
    setTitle("");
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    await updateTask(editingId, {
      title: editTitle,
      description: editDescription,
    });
    setEditingId(null);
  }

  // Filter button colors
  const filterColors: Record<typeof filter, string> = {
    all: "bg-gray-200 text-gray-800",
    pending: "bg-yellow-200 text-yellow-800",
    completed: "bg-green-200 text-green-800",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6">
        <Header title="My Tasks" />

        {/* Add task form */}
        <form onSubmit={handleAdd} className="flex mb-4">
          <input
            type="text"
            placeholder="New task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-grow border px-3 py-2 rounded-l focus:outline-none"
          />
          <button
            type="submit"
            disabled={adding}
            className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600 disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </form>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(["all", "pending", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded ${filter === f ? filterColors[f] : "bg-gray-100"}`}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task list */}
        <ul>
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center border-b py-2"
            >
              {editingId === task.id ? (
                <form
                  onSubmit={handleSaveEdit}
                  className="flex-grow flex flex-col gap-2"
                >
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border px-2 py-1 rounded"
                    required
                  />
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="border px-2 py-1 rounded"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Checkbox + title */}
                  <div
                    className="flex-grow flex items-center gap-2 cursor-pointer"
                    onClick={() => toggleTask(task.id, !task.completed)}
                  >
                    {task.completed ? (
                      <CheckSquare className="text-green-600" size={20} />
                    ) : (
                      <Square className="text-gray-500" size={20} />
                    )}
                    <div>
                      <div
                        className={`${
                          task.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-sm text-gray-600">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action icons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(task)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      disabled={!!busyById[task.id]}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {filteredTasks.length === 0 && (
          <p className="text-gray-500 text-center mt-4">No tasks found</p>
        )}
      </div>
    </div>
  );
}
