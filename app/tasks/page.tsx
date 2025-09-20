"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useTaskStore } from "@/lib/taskStore";

export default function TasksPage() {
  const router = useRouter();
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
  } = useTaskStore();

  const [title, setTitle] = useState("");
  const [editingTask, setEditingTask] = useState<string | null>(null);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6">
        <Header title="My Tasks" />

        {/* Add task form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            addTask(title);
            setTitle("");
          }}
          className="flex mb-4"
        >
          <input
            type="text"
            placeholder="New task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-grow border px-3 py-2 rounded-l"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
          >
            Add
          </button>
        </form>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-4">
          {["all", "pending", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 rounded ${
                filter === f ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
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
              {editingTask === task.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateTask(task.id, {
                      title: editTitle,
                      description: editDescription,
                    });
                    setEditingTask(null);
                  }}
                  className="flex flex-col w-full gap-2"
                >
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTask(null)}
                      className="bg-gray-300 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <span
                    onClick={() => toggleTask(task.id, !task.completed)}
                    className={`flex-grow cursor-pointer ${
                      task.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingTask(task.id);
                        setEditTitle(task.title);
                        setEditDescription(task.description || "");
                      }}
                      className="text-blue-500 text-sm hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
