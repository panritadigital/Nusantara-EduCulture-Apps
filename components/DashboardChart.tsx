
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartProps {
  data: any[];
  type: 'bar' | 'pie';
  title: string;
}

const COLORS = ['#4A2E2A', '#C68B59', '#E8A87C', '#d9534f', '#5cb85c', '#5bc0de', '#f0ad4e'];

export default function DashboardChart({ data, type, title }: ChartProps) {
  // Special check for the teacher attendance chart to add a center label
  const isTeacherAttendance = type === 'pie' && title.includes('Kehadiran Guru');

  return (
    <div className="bg-white p-3 rounded-lg shadow-md flex flex-col">
      <h3 className="text-sm font-semibold text-brand-primary mb-2 text-center">{title}</h3>
      <div className="relative flex-grow" style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} interval={0} angle={-45} textAnchor="end" />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 5px', border: '1px solid #ccc', background: '#fff' }} />
              <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}} iconSize={8} />
              <Bar dataKey="value" fill="#4A2E2A" radius={[4, 4, 0, 0]} />
              {data[0]?.value2 && <Bar dataKey="value2" fill="#C68B59" radius={[4, 4, 0, 0]} />}
            </BarChart>
          ) : (
            <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <Pie 
                data={data} 
                cx="50%" 
                cy="50%" 
                labelLine={false} 
                innerRadius={35} 
                outerRadius={55} 
                fill="#8884d8" 
                dataKey="value" 
                paddingAngle={5}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 5px', border: '1px solid #ccc', background: '#fff' }} />
              <Legend 
                iconSize={8} 
                wrapperStyle={{
                  fontSize: "10px", 
                  display: isTeacherAttendance ? 'none' : 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0 8px',
                  paddingTop: '10px',
                  lineHeight: '1.2'
                }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
        {isTeacherAttendance && data[0] && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/70 backdrop-blur-sm px-2 py-1 rounded shadow-inner text-center">
              <p className="text-sm font-semibold text-brand-primary">{data[0].name}: {data[0].value}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}