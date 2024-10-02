import React from "react";
import api from "./api";
import Car from './Car';

const baseURL = "http://localhost:8000/users";

function App() {
  const [post, setPost] = React.useState(null);
  const [formData, setFormData] = React.useState({
    first_name:"",
    last_name:"",
    email:"",
    password:""
  });

  const [error, setError] = React.useState(null);
  const handleInputChange=(event)=>{
    const value= event.target.value
    console.log(value)

    setFormData({
      ...formData,
      [event.target.name]:value
    });
  };

  const handleFormSubmit=(event) =>{
    event.preventDefault();
    console.log(formData)
    api
      .post(`users`, formData,
      { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        setPost(response.data);
        console.log(response);
      }).catch(error => {
        setError(error);
      });
  };
  /*React.useEffect(() => {
    api.get(`/`).then((response) => {
      setPost(response.data);
      console.log(response.data);
    });
  }, []);*/

  function createPost() {
    api
      .post(`users`, {
        "first_name": "Moududur!",
        "last_name": "Shamim",
        "email": "sfgrahman3512fdgdfg3@gmail.com",
        "password": "Test123#"
      },
      { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        setPost(response.data);
        console.log(response);
      }).catch(error => {
        setError(error);
      });
  };

  //if (!post) return (<p><button onClick={createPost}>Create User</button></p>)
  if (error) return `Error: ${error.message}`;

  return (
    <div>
      <Car/>
                <form onSubmit={handleFormSubmit}>
                    <label>
                        Post Name:
                        <input
                            type="text"
                            name="first_name"
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="last_name"
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="email"
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="password"
                            onChange={handleInputChange}
                        />
                    </label>
                    <button type="submit">Add</button>
                </form>
            </div>
  );
}

export default App;
