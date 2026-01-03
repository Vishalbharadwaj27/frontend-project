'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filter !== 'all') params.append('completed', filter === 'completed')
      if (dateFilter) params.append('date', dateFilter)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [search, filter, dateFilter])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchTasks()
    }
  }, [user, authLoading, router, fetchTasks])

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    setAdding(true)
    try {
      let dueDateTime = undefined
      if (dueDate && dueTime) {
        dueDateTime = new Date(`${dueDate}T${dueTime}`)
      } else if (dueDate) {
        dueDateTime = new Date(dueDate)
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: newTask, dueDate: dueDateTime })
      })
      if (res.ok) {
        const task = await res.json()
        setTasks([task, ...tasks])
        setNewTask('')
        setDueDate('')
        setDueTime('')
      }
    } catch (error) {
      console.error('Failed to add task')
    } finally {
      setAdding(false)
    }
  }

  const toggleTask = async (id, completed) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ completed: !completed })
      })
      if (res.ok) {
        const updatedTask = await res.json()
        setTasks(tasks.map(task => task._id === id ? updatedTask : task))
      }
    } catch (error) {
      console.error('Failed to update task')
    }
  }

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        setTasks(tasks.filter(task => task._id !== id))
      }
    } catch (error) {
      console.error('Failed to delete task')
    }
  }

  const formatDueDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const isOverdue = date < now
    const formatted = date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    return { formatted, isOverdue }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-6">My Tasks</h2>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-64 p-2 border rounded"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="p-2 border rounded"
              />
            </div>
          </div>

          {/* Add Task Form */}
          <form onSubmit={addTask} className="mb-6">
            <div className="space-y-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task..."
                className="w-full p-2 border rounded"
                required
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="submit"
                  disabled={adding}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </div>
          </form>

          {/* Task List */}
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No tasks found. Add your first task above!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => {
                const dueInfo = formatDueDate(task.dueDate)
                return (
                  <div key={task._id} className={`flex items-center justify-between p-3 border rounded ${dueInfo.isOverdue ? 'bg-red-50 border-red-200' : ''}`}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task._id, task.completed)}
                        className="w-4 h-4"
                      />
                      <div>
                        <span className={task.completed ? 'line-through text-gray-500' : ''}>
                          {task.title}
                        </span>
                        {dueInfo.formatted && (
                          <div className={`text-sm ${dueInfo.isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                            Due: {dueInfo.formatted}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}