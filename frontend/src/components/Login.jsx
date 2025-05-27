import { useState, useContext } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { AuthContext } from '../context/AuthContext';

   function Login() {
     const { login } = useContext(AuthContext);
     const navigate = useNavigate();
     const [formData, setFormData] = useState({ username: '', password: '' });
     const [error, setError] = useState('');

     const handleChange = (e) => {
       setFormData({ ...formData, [e.target.name]: e.target.value });
     };

     const handleSubmit = async (e) => {
       e.preventDefault();
       setError('');
       const success = await login(formData.username, formData.password);
       if (success) {
         navigate('/');
       } else {
         setError('Invalid username or password');
       }
     };

     return (
       <div className="container mx-auto p-4">
         <h2 className="text-2xl font-bold mb-4">Login</h2>
         <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4">
           <div className="mb-4">
             <label className="block text-gray-700">Username:</label>
             <input
               type="text"
               name="username"
               value={formData.username}
               onChange={handleChange}
               className="w-full p-2 border rounded"
               required
             />
           </div>
           <div className="mb-4">
             <label className="block text-gray-700">Password:</label>
             <input
               type="password"
               name="password"
               value={formData.password}
               onChange={handleChange}
               className="w-full p-2 border rounded"
               required
             />
           </div>
           <button
             type="submit"
             className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
           >
             Login
           </button>
           {error && <p className="text-red-600 mt-2">{error}</p>}
         </form>
       </div>
     );
   }

   export default Login;