import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4F46E5', '#E5E7EB']; // Colores para el gráfico de tarta y del checkbox

const Dashboard = () => {

  const [tasks, setTasks] = useState([]);
  const [weeklyRanking, setWeeklyRanking] = useState(0);
  const [totalRanking, setTotalRanking] = useState(0);
  const [userGo, setUserGo] = useState([]);
  const [userNoGo, setUserNoGo] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const allowedId = ['67aa21e44df5374200071041', '67ab6bc9d3f1331bfa79f725', '67ab6f04d3f1331bfa79f75a', '67ad0b2b79b60513d805d1ef'];

  useEffect(() => {
    axios.get(`${apiUrl}/api/tasks`)
      .then(response => {
        const tasks = response.data;
        setTasks(tasks.filter(task => !task.usedOnce.includes(localStorage.getItem('id'))));
      })
      .catch(error => console.error('Error al obtener las tareas:', error));

      reloadRanking();
      fetchUsers();
  }, []);

  // Función para obtener la lista de personas
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/users`);
      setUserGo(response.data.userGo); // Guardamos la lista de personas que van
      setUserNoGo(response.data.userNoGo); //Aqui las personas que no van
    } catch (error) {
      console.error('Error al obtener la lista de personas:', error);
    }
  };

  const reloadRanking = async () => {
    try {
      const id = localStorage.getItem('id');
      const response = await axios.get(`${apiUrl}/api/rankings/${id}`);
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
      await axios.post(`${apiUrl}/api/tasks/${taskId}/unComplete`, { userId: localStorage.getItem('id') })
      .then((response) => {
        const tasks = response.data;
        setTasks(tasks.filter(task => !task.usedOnce.includes(localStorage.getItem('id'))))
       })
      .catch(error => console.error('Error al completar la tarea:', error));
    }
    else{
      await axios.post(`${apiUrl}/api/tasks/${taskId}/complete`, { userId: localStorage.getItem('id') })
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
          Ranking Akadémic@ Top
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
                      className="h-6 w-6 text-indigo-600 rounded-full focus:ring-0 focus:outline-none"
                      style={{ accentColor: COLORS[0] }}
                    />
                    <span className={`flex-1 ${task.completedBy.includes(localStorage.getItem('id')) ? 'line-through text-gray-500' : ''}`}>{task.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Tabla de Personas (Visible solo si ID está permitido) */}
          {allowedId.includes(localStorage.getItem('id')) && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4 text-center text-indigo-600">Lista de Personas</h2>

              {/* Contenedor para hacerlo responsivo */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
                  <thead style={{ backgroundColor: COLORS[0] }} className="text-white">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm md:text-base">Van a ir</th>
                      <th className="py-3 px-4 text-left text-sm md:text-base">Nombre</th>
                      <th className="py-3 px-4 text-left text-sm md:text-base">Total de Personas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-4 text-sm md:text-base">SÍ</td>
                      <td className="py-2 px-4 text-sm md:text-base">{userGo}</td>
                      <td className="py-2 px-4 text-sm md:text-base">{userGo.length}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4 text-sm md:text-base">NO</td>
                      <td className="py-2 px-4 text-sm md:text-base">{userNoGo}</td>
                      <td className="py-2 px-4 text-sm md:text-base">{userNoGo.length}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>

  );

};

export default Dashboard;
