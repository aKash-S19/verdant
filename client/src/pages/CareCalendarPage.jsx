import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Droplets, 
  Scissors, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';
import { useNotifications } from '../context/NotificationContext';

export function CareCalendarPage() {
  const { tasks, plants, toggleTaskCompletion, skipTask, addCustomTask } = useGarden();
  const { addToast } = useNotifications();

  const [viewMode, setViewMode] = useState('calendar'); // 'daily' | 'weekly' | 'calendar'
  const [filterType, setFilterType] = useState('All');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Custom Task Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    garden_plant_id: plants[0]?.id || '',
    plant_name: plants[0]?.custom_name || '',
    task_type: 'Watering',
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    recurrence_interval_days: 0
  });

  const taskTypes = ['All', 'Watering', 'Fertilizing', 'Pruning', 'Repotting', 'Planting', 'Harvesting', 'Custom'];

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Selected date on calendar to view day tasks
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().toISOString().split('T')[0]);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function handleCreateTask(e) {
    e.preventDefault();
    if (!newTaskData.title) return;

    const selectedPlant = plants.find(p => p.id === newTaskData.garden_plant_id);
    addCustomTask({
      ...newTaskData,
      plant_name: selectedPlant ? selectedPlant.custom_name : 'General Garden'
    });

    addToast(`Care task "${newTaskData.title}" created.`, 'success');
    setShowTaskModal(false);
    setNewTaskData({
      garden_plant_id: plants[0]?.id || '',
      plant_name: plants[0]?.custom_name || '',
      task_type: 'Watering',
      title: '',
      description: '',
      due_date: new Date().toISOString().split('T')[0],
      recurrence_interval_days: 0
    });
  }

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (filterType !== 'All' && t.task_type !== filterType) return false;
    return true;
  });

  // Selected calendar date tasks
  const selectedDateTasks = filteredTasks.filter(t => t.due_date === selectedCalendarDate);

  return (
    <div className="section-padding" style={{ paddingTop: '2rem' }}>
      <div className="container">
        
        {/* HEADER BAR */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div>
            <span className="badge badge-forest" style={{ marginBottom: '0.4rem' }}>
              Smart Care Routine
            </span>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--color-forest-dark)' }}>
              Care Scheduler & Calendar
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              Synchronized schedules for watering, fertilizing, pruning, and harvesting.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.2rem' }}>
              {['daily', 'weekly', 'calendar'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: viewMode === mode ? 700 : 500,
                    backgroundColor: viewMode === mode ? 'var(--color-forest)' : 'transparent',
                    color: viewMode === mode ? '#ffffff' : 'var(--color-text-secondary)',
                    textTransform: 'capitalize'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowTaskModal(true)}
              className="btn btn-primary"
              style={{ gap: '0.4rem' }}
            >
              <Plus size={16} />
              New Task
            </button>
          </div>
        </div>

        {/* TASK TYPE FILTER CHIPS */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '2rem' }}>
          {taskTypes.map(t => {
            const active = filterType === t;
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8125rem',
                  fontWeight: active ? 700 : 500,
                  backgroundColor: active ? 'var(--color-forest)' : '#ffffff',
                  color: active ? '#ffffff' : 'var(--color-text-secondary)',
                  border: `1px solid ${active ? 'var(--color-forest)' : 'var(--color-border)'}`,
                  whiteSpace: 'nowrap'
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {tasks.length === 0 && (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--color-border)', marginBottom: '2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-mint-subtle)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <CalendarIcon size={32} />
            </div>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--color-forest-dark)', marginBottom: '0.5rem' }}>
              No Care Tasks Scheduled
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto 1.75rem auto', fontSize: '0.875rem', lineHeight: 1.6 }}>
              You haven't added any plants to your garden yet. When you add plants from Discover or My Garden, Verdant AI automatically schedules smart watering, fertilizing, and pruning routines!
            </p>
            <button onClick={() => setShowTaskModal(true)} className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <Plus size={16} /> Create Custom Task
            </button>
          </div>
        )}

        {/* 1. CALENDAR VIEW */}
        {tasks.length > 0 && viewMode === 'calendar' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {/* Calendar Grid Container */}
            <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
              {/* Month Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)' }}>
                  {monthNames[month]} {year}
                </h2>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={prevMonth} className="btn btn-outline btn-sm">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={nextMonth} className="btn btn-outline btn-sm">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day Labels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Calendar Days */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem' }}>
                {/* Blank cells for offset */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={'empty-' + i} style={{ height: '64px' }} />
                ))}

                {/* Day cells */}
                {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayTasks = filteredTasks.filter(t => t.due_date === dayStr);
                  const isSelected = selectedCalendarDate === dayStr;
                  const isToday = new Date().toISOString().split('T')[0] === dayStr;

                  return (
                    <div
                      key={dayStr}
                      onClick={() => setSelectedCalendarDate(dayStr)}
                      style={{
                        height: '68px',
                        padding: '0.35rem',
                        borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${isSelected ? 'var(--color-forest)' : isToday ? 'var(--color-sage)' : 'var(--color-border)'}`,
                        backgroundColor: isSelected ? 'var(--color-mint-subtle)' : isToday ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.1s ease'
                      }}
                    >
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: isToday || isSelected ? 800 : 500,
                        color: isToday ? 'var(--color-forest)' : 'var(--color-text-primary)'
                      }}>
                        {dayNum}
                      </span>

                      {/* Task dots */}
                      <div style={{ marginTop: 'auto', display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                        {dayTasks.slice(0, 3).map((task, tidx) => (
                          <span
                            key={tidx}
                            title={task.title}
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: task.is_completed ? '#94a3b8' : task.task_type === 'Watering' ? '#0284c7' : '#2d6a4f'
                            }}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span style={{ fontSize: '0.5625rem', color: 'var(--color-text-muted)', lineHeight: 1 }}>+</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Tasks Pane */}
            <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', color: 'var(--color-forest-dark)' }}>
                    Tasks for {selectedCalendarDate}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {selectedDateTasks.length} task(s) scheduled
                  </span>
                </div>

                <button
                  onClick={() => {
                    setNewTaskData({ ...newTaskData, due_date: selectedCalendarDate });
                    setShowTaskModal(true);
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.25rem' }}
                >
                  <Plus size={14} /> Add for Day
                </button>
              </div>

              {selectedDateTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  <CalendarIcon size={32} color="var(--color-sage)" style={{ margin: '0 auto 0.75rem auto' }} />
                  No tasks scheduled on this day.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedDateTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskCompletion(task.id)}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: task.is_completed ? 'var(--color-bg-subtle)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem'
                      }}
                    >
                      <button
                        style={{
                          marginTop: '2px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: `2px solid ${task.is_completed ? 'var(--color-forest)' : '#cbd5e1'}`,
                          backgroundColor: task.is_completed ? 'var(--color-forest)' : 'transparent',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {task.is_completed && <Check size={12} />}
                      </button>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: task.is_completed ? 'var(--color-text-muted)' : 'var(--color-forest-dark)',
                            textDecoration: task.is_completed ? 'line-through' : 'none'
                          }}>
                            {task.title}
                          </span>
                          <span className="badge badge-outline" style={{ fontSize: '0.625rem' }}>{task.task_type}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                          {task.description}
                        </p>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-forest)', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>
                          {task.plant_name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. DAILY & WEEKLY VIEWS */}
        {tasks.length > 0 && viewMode !== 'calendar' && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', marginBottom: '1.25rem' }}>
              {viewMode === 'daily' ? "Today's Agenda" : 'Weekly Care Horizon'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskCompletion(task.id)}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: task.is_completed ? 'var(--color-bg-subtle)' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <button
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: `2px solid ${task.is_completed ? 'var(--color-forest)' : '#cbd5e1'}`,
                      backgroundColor: task.is_completed ? 'var(--color-forest)' : 'transparent',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {task.is_completed && <Check size={14} />}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        color: task.is_completed ? 'var(--color-text-muted)' : 'var(--color-forest-dark)',
                        textDecoration: task.is_completed ? 'line-through' : 'none'
                      }}>
                        {task.title}
                      </span>
                      <span className="badge badge-forest" style={{ fontSize: '0.6875rem' }}>{task.task_type}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {task.plant_name} • Due on {task.due_date}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      skipTask(task.id);
                    }}
                    style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                  >
                    Skip
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CREATE TASK MODAL */}
        {showTaskModal && (
          <div className="modal-backdrop" onClick={() => setShowTaskModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', marginBottom: '1.25rem' }}>
                Schedule Care Task
              </h3>

              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label className="form-label">Associated Plant</label>
                  <select
                    className="form-select"
                    value={newTaskData.garden_plant_id}
                    onChange={e => setNewTaskData({ ...newTaskData, garden_plant_id: e.target.value })}
                  >
                    <option value="">General Garden</option>
                    {plants.map(p => (
                      <option key={p.id} value={p.id}>{p.custom_name} ({p.species})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Task Type</label>
                    <select
                      className="form-select"
                      value={newTaskData.task_type}
                      onChange={e => setNewTaskData({ ...newTaskData, task_type: e.target.value })}
                    >
                      <option value="Watering">Watering</option>
                      <option value="Fertilizing">Fertilizing</option>
                      <option value="Pruning">Pruning</option>
                      <option value="Repotting">Repotting</option>
                      <option value="Harvesting">Harvesting</option>
                      <option value="Custom">Custom Task</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={newTaskData.due_date}
                      onChange={e => setNewTaskData({ ...newTaskData, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Deep soak or Prune top stems"
                    value={newTaskData.title}
                    onChange={e => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Instructions</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="e.g. Check soil moisture first..."
                    value={newTaskData.description}
                    onChange={e => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const var_border_token = 'var(--color-border)';
