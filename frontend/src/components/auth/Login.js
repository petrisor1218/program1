import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Login = () => {
   const navigate = useNavigate();
   const { login } = useAuth();
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [credentials, setCredentials] = useState({
       email: '',
       parola: ''
   });

   useEffect(() => {
       const token = localStorage.getItem('token');
       if (token) {
           navigate('/');
       }
   }, [navigate]);

   const handleSubmit = async (e) => {
       e.preventDefault();
       setError('');
       setLoading(true);
       
       try {
           await login(credentials);
           navigate('/');
       } catch (error) {
           setError(
               error.response?.data?.message || 
               'A apărut o eroare la autentificare. Vă rugăm să încercați din nou.'
           );
       } finally {
           setLoading(false);
       }
   };

   return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
           <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
               <h2 className="text-2xl font-bold text-center mb-6">Autentificare</h2>
               
               {error && (
                   <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                       {error}
                   </div>
               )}

               <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                           Email
                       </label>
                       <input
                           type="email"
                           value={credentials.email}
                           onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           required
                           disabled={loading}
                       />
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                           Parola
                       </label>
                       <input
                           type="password"
                           value={credentials.parola}
                           onChange={(e) => setCredentials({...credentials, parola: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           required
                           disabled={loading}
                       />
                   </div>

                   <button
                       type="submit"
                       className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                           ${loading 
                               ? 'bg-blue-400 cursor-not-allowed' 
                               : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                           }`}
                       disabled={loading}
                   >
                       {loading ? (
                           <div className="flex items-center justify-center">
                               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                               </svg>
                               Se încarcă...
                           </div>
                       ) : 'Conectare'}
                   </button>
               </form>
           </div>
       </div>
   );
};

export default Login;