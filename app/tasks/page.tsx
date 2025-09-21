"use client";

import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
import SkeletonTask from "@/components/SkeletonTask";
import { useTaskStore } from "@/lib/taskStore";
import { useToast } from "@/lib/contexts/ToastContext";
import { Plus, Trash2, CheckSquare, Square, Edit3, Check, Calendar } from "lucide-react";

type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string | null;
};

type FilterType = "all" | "active" | "completed";

export default function TasksPage() {
  const { success, error: showError, warning, info, showToast } = useToast();
  const {
    tasks,
    loading,
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
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverTask, setDragOverTask] = useState<string | null>(null);
  const [swipedTask, setSwipedTask] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadTasks = async () => {
      const result = await fetchTasks();
      if (!result.ok) {
        showError("Failed to load tasks", result.error);
      }
    };
    loadTasks();
  }, [fetchTasks, showError]);

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === "active") return !t.completed;
    if (activeFilter === "completed") return t.completed;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Tasks</h1>
            <p className="text-gray-600">Manage your daily tasks efficiently</p>
          </div>
          
          {/* Skeleton for Add Task Form */}
          <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 h-10 bg-slate-200 rounded-md animate-pulse"></div>
              <div className="w-full sm:w-32 h-10 bg-slate-200 rounded-md animate-pulse"></div>
              <div className="w-full sm:w-28 h-10 bg-slate-200 rounded-md animate-pulse"></div>
            </div>
          </div>

          {/* Skeleton for Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-8 bg-slate-200 rounded-full animate-pulse"></div>
            ))}
          </div>

          {/* Skeleton Tasks */}
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <SkeletonTask key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    
    const result = await addTask(title.trim(), description.trim() || undefined, dueDate || undefined);
    if (result.ok) {
      info("Task created!", `"${title.trim()}" has been added to your list`);
      setTitle("");
      setDescription("");
      setDueDate("");
      inputRef.current?.focus();
    } else {
      showError("Failed to create task", result.error);
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : ""); // Format for date input
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    
    const originalTask = tasks.find(t => t.id === editingId);
    const hadNoDescription = !originalTask?.description || originalTask.description.trim() === '';
    const nowHasDescription = editDescription && editDescription.trim() !== '';
    
    const result = await updateTask(editingId, {
      title: editTitle,
      description: editDescription,
      dueDate: editDueDate || undefined,
    });
    
    if (result.ok) {
      // Check if description was added
      if (hadNoDescription && nowHasDescription) {
        showToast({
          type: 'warning',
          title: "Task updated!",
          message: "Description added successfully",
          customIcon: <Check className="w-5 h-5 flex-shrink-0 text-amber-500" />
        });
      } else {
        warning("Task updated!", "Your changes have been saved");
      }
      setEditingId(null);
    } else {
      showError("Failed to update task", result.error);
    }
  }

  async function handleToggleTask(taskId: string, completed: boolean) {
    const task = tasks.find(t => t.id === taskId);
    const result = await toggleTask(taskId, completed);
    
    if (result.ok) {
      const action = completed ? "completed" : "reopened";
      const taskTitle = task?.title || "Task";
      success(`Task ${action}!`, `"${taskTitle}" has been ${action}`);
    } else {
      showError("Failed to update task", result.error);
    }
  }

  async function handleDeleteTask(taskId: string) {
    const task = tasks.find(t => t.id === taskId);
    const result = await deleteTask(taskId);
    
    if (result.ok) {
      const taskTitle = task?.title || "Task";
      showToast({
        type: 'error',
        title: "Task deleted!",
        message: `"${taskTitle}" has been removed`
      });
    } else {
      showError("Failed to delete task", result.error);
    }
  }

  const handleFilterChange = (newFilter: FilterType) => {
    setActiveFilter(newFilter);
    // Update the store filter as well
    const storeFilter = newFilter === "active" ? "pending" : newFilter;
    setFilter(storeFilter as "all" | "completed" | "pending");
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', taskId);
    // Add a slight delay to ensure the drag state is set
    setTimeout(() => {
      const dragImage = e.target as HTMLElement;
      dragImage.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTask(null);
    setDragOverTask(null);
    (e.target as HTMLElement).style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedTask && draggedTask !== taskId) {
      setDragOverTask(taskId);
    }
  };

  const handleDragLeave = () => {
    setDragOverTask(null);
  };

  const handleDrop = (e: React.DragEvent, dropTaskId: string) => {
    e.preventDefault();
    const dragTaskId = e.dataTransfer.getData('text/html');
    
    if (dragTaskId && dragTaskId !== dropTaskId) {
      // Reorder tasks logic would go here
      // For now, we'll just reset the drag states
      console.log(`Moving task ${dragTaskId} to position of ${dropTaskId}`);
    }
    
    setDraggedTask(null);
    setDragOverTask(null);
  };

  // Touch/Swipe handlers for mobile
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTouchStart = (e: React.TouchEvent, _taskId: string) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent, taskId: string) => {
    if (!touchStart) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // If horizontal swipe is more significant than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      setSwipedTask(taskId);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    // Reset swipe state after a delay
    setTimeout(() => setSwipedTask(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sticky Header with Input */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Tasks
              </h1>
              <p className="text-slate-600 mt-1">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            <Header showUserInfo={true} />
          </div>

          {/* Add Task Input */}
          <form onSubmit={handleAdd} className="relative mb-6">
            <div className="space-y-3">
              {/* Title Input */}
              <div className="relative group">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Add new tasks"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 pr-16 text-lg placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-slate-300"
                />
                <button
                  type="submit"
                  disabled={adding || !title.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl group"
                >
                  {adding ? (
                    <Spinner size={20} />
                  ) : (
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  )}
                </button>
              </div>
              
              {/* Description and Date Row */}
              <div className="flex gap-3">
                {/* Description Input */}
                <div className="flex-1">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add description"
                    className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-3 text-base placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 resize-none"
                    rows={2}
                  />
                </div>
                
                {/* Date Button */}
                <div className="flex-shrink-0 relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-20 h-19 bg-white border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 shadow-sm hover:shadow-md"
                    style={{ 
                      color: 'transparent',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield'
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 pointer-events-none">
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs mt-1 font-medium">
                      {dueDate 
                        ? new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'date'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Filter Bar */}
          <div className="flex items-center justify-center gap-12 relative">
            {(['all', 'active', 'completed'] as FilterType[]).map((filterType) => (
              <button
                key={filterType}
                onClick={() => handleFilterChange(filterType)}
                className={`relative py-3 px-4 text-sm font-medium capitalize transition-colors duration-300 ${
                  activeFilter === filterType
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filterType}
                {activeFilter === filterType && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-in slide-in-from-left-full duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <CheckSquare className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">
              {activeFilter === 'completed' 
                ? 'No completed tasks yet'
                : activeFilter === 'active'
                ? 'No active tasks'
                : 'No tasks yet'
              }
            </h3>
            <p className="text-slate-600">
              {activeFilter === 'active' 
                ? 'All your tasks are completed! 🎉'
                : 'Create your first task to get started'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                draggable={!editingId}
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, task.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, task.id)}
                onTouchStart={(e) => handleTouchStart(e, task.id)}
                onTouchMove={(e) => handleTouchMove(e, task.id)}
                onTouchEnd={handleTouchEnd}
                className={`group relative rounded-2xl p-6 shadow-sm border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
                  task.completed 
                    ? 'bg-green-50 border-green-200 opacity-90' 
                    : 'bg-blue-50 border-blue-200'
                } ${
                  draggedTask === task.id ? 'opacity-50 scale-105 shadow-xl z-50' : 'opacity-100'
                } ${
                  dragOverTask === task.id ? 'border-blue-500 shadow-lg scale-[1.02]' : task.completed ? 'hover:border-green-300' : 'hover:border-blue-300'
                } ${
                  editingId === task.id ? 'cursor-default' : 'cursor-move hover:shadow-lg md:cursor-default'
                } ${
                  swipedTask === task.id ? 'transform -translate-x-4' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {editingId === task.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-lg font-medium bg-transparent border-b-2 border-slate-200 focus:border-blue-500 focus:outline-none pb-2 transition-colors"
                      autoFocus
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Add a description..."
                      className="w-full bg-slate-50 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                      rows={2}
                    />
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="w-full bg-slate-50 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-700"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 active:scale-95 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleTask(task.id, !task.completed)}
                      className="flex-shrink-0 mt-1 group/checkbox"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-6 h-6 text-green-500 group-hover/checkbox:scale-110 transition-transform duration-200" />
                      ) : (
                        <Square className="w-6 h-6 text-slate-400 group-hover/checkbox:text-slate-600 group-hover/checkbox:scale-110 transition-all duration-200" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg font-medium transition-all duration-500 ${
                          task.completed
                            ? 'line-through text-slate-500 opacity-60'
                            : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p
                          className={`mt-2 text-slate-600 transition-all duration-500 ${
                            task.completed ? 'line-through opacity-50' : ''
                          }`}
                        >
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Date and Actions */}
                    <div className="flex flex-col items-end gap-2">
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(task)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Edit task"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={!!busyById[task.id]}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete task"
                        >
                          {busyById[task.id] ? (
                            <Spinner size={16} />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      {/* Date below buttons */}
                      {task.dueDate && (
                        <div className={`text-sm text-slate-500 transition-all duration-500 ${
                          task.completed ? 'line-through opacity-50' : ''
                        }`}>
                          {new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
