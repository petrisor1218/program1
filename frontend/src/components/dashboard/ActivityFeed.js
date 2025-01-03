// frontend/src/components/dashboard/ActivityFeed.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
      loadActivities();
  }, []);

  const loadActivities = async () => {
      try {
          const response = await api.get('/dashboard/activity');
          setActivities(response.data);
      } catch (error) {
          console.error('Error loading activities:', error);
      }
  };

  return (
      <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Activitate Recentă</h2>
          <div className="space-y-4">
              {activities.map(activity => (
                  <div
                      key={activity.id}
                      className={`flex items-start space-x-3 pb-4 border-b ${
                          activity.importanta === 'High' ? 'bg-red-50' :
                          activity.importanta === 'Medium' ? 'bg-yellow-50' : ''
                      }`}
                  >
                      <div className="flex-1">
                          <p className="text-sm">{activity.detalii}</p>
                          <div className="flex justify-between mt-1">
                              <p className="text-xs text-gray-500">
                                  {formatDate(activity.data)}
                              </p>
                              <p className="text-xs text-gray-500">
                                  {activity.utilizator}
                              </p>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );
};

export default ActivityFeed;