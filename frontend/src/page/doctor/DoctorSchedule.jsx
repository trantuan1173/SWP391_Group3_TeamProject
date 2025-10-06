import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const DoctorSchedule = () => {
  const { doctorId } = useParams();
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(`/api/doctors/${doctorId}/schedules`);
        setSchedules(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSchedules();
  }, [doctorId]);

  return (
    <div>
      <h2>Lịch khám của bác sĩ</h2>
      <table>
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Giờ bắt đầu</th>
            <th>Giờ kết thúc</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.date}</td>
              <td>{schedule.startTime}</td>
              <td>{schedule.endTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorSchedule;
