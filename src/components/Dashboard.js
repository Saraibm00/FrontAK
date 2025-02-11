import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4F46E5', '#E5E7EB']; // Colores para el gráfico de tarta

const Dashboard = () => {

  const [tasks, setTasks] = useState([]);
  const [weeklyRanking, setWeeklyRanking] = useState(0);
  const [totalRanking, setTotalRanking] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:5000/api/tasks')
      .then(response => {
        const tasks = response.data;
        setTasks(tasks.filter(task => !task.usedOnce.includes(localStorage.getItem('id'))));
      })
      .catch(error => console.error('Error al obtener las tareas:', error));

      reloadRanking();
  }, []);

  const reloadRanking = async () => {
    try {
      const id = localStorage.getItem('id');
      const response = await axios.get(`http://localhost:5000/api/rankings/${id}`);
      const { weeklyTasksCompleted, weeklyRankings } = response.data;

      // Calcular el ranking semanal
      setWeeklyRanking(Math.round(weeklyTasksCompleted));

      // Calcular el ranking total
      setTotalRanking(Math.round(weeklyRankings));

    } catch (error) {
      console.error('Error al obtener los rankings:', error);
    }
  };

  const toggleTaskCompletion = async (taskId, isCompleted) => {
    if(isCompleted){
      await axios.post(`http://localhost:5000/api/tasks/${taskId}/unComplete`, { userId: localStorage.getItem('id') })
      .then((response) => {
        const tasks = response.data;
        setTasks(tasks.filter(task => !task.usedOnce.includes(localStorage.getItem('id'))))
       })
      .catch(error => console.error('Error al completar la tarea:', error));
    }
    else{
      await axios.post(`http://localhost:5000/api/tasks/${taskId}/complete`, { userId: localStorage.getItem('id') })
      .then((response) => {
        const tasks = response.data;
        setTasks(tasks.filter(task => !task.usedOnce.includes(localStorage.getItem('id'))))
       })
      .catch(error => console.error('Error al completar la tarea:', error));
    }
    reloadRanking();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Ranking Akademic@ Top
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rankings en modo tarta */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">Tus Rankings</h2>
            <div className="flex justify-center">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completado', value: weeklyRanking },
                      { name: 'Restante', value: 100 - weeklyRanking },
                    ]}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={500}
                  >
                    <Cell key="weekly" fill={COLORS[0]} />
                    <Cell key="rest" fill={COLORS[1]} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-lg font-medium text-gray-700">
              Ranking Semanal: <span className="font-bold">{weeklyRanking}%</span>
            </p>

            <div className="flex justify-center">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completado', value: totalRanking },
                      { name: 'Restante', value: 100 - totalRanking },
                    ]}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={500}
                  >
                    <Cell key="total" fill={COLORS[0]} />
                    <Cell key="rest" fill={COLORS[1]} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-lg font-medium text-gray-700">
              Ranking Total: <span className="font-bold">{totalRanking}%</span>
            </p>
          </div>

          {/* Lista de Tareas estilo iPhone Notes */}
          <div>
            <h2 className="text-xl font-bold mb-4">Lista de Tareas</h2>
            <ul>
              {tasks.map(task => (
                <li 
                  key={task._id} 
                  className={`flex items-center justify-between p-4 mb-2 rounded-xl shadow-sm ${task.isActive ? '' : 'opacity-50'} ${task.completedBy.includes(localStorage.getItem('id')) ? 'bg-green-100' : 'bg-gray-100'}`}
                >
                  <label className="flex items-center space-x-3 w-full">
                    <input
                      type="checkbox"
                      checked={task.completedBy.includes(localStorage.getItem('id'))}
                      onChange={() => toggleTaskCompletion(task._id, task.completedBy.includes(localStorage.getItem('id')))}
                      disabled={!task.isActive}
                      className="h-6 w-6 text-teal-500 rounded-full focus:ring-0 focus:outline-none"
                    />
                    <span className={`flex-1 ${task.completedBy.includes(localStorage.getItem('id')) ? 'line-through text-gray-500' : ''}`}>{task.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>

  );

};

export default Dashboard;
