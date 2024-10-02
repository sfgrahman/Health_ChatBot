import React,{useState} from "react";
import api from "./api";
import Chat from "./Chat";

function App(){
  const [post, setPost] = useState(null);
  const [loginData, setLoginData] = useState({
    username:"",
    password:""
  });
  const [error, setError] = useState(null);

  const [token, setToken] = useState("");

  const handleInputChange=(event)=>{
    const { name, value } = event.target;
    console.log(value);

    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleFormSubmit=async(event) =>{
    event.preventDefault();
    console.log(loginData);
    await api
    .post(`auth/login`, loginData,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } })
    .then((response) => {
      setPost(response.data);
      console.log(response.statusText);
      if(response.status===200){
       console.log(response.data. token);
       setToken(response.data.access_token);
       localStorage.setItem("site", response.data.access_token);
        
      }
    }).catch(er => {
      setError(er);
    });
   
  };
  const tokenString = localStorage.getItem('site');
  if(tokenString) return (<Chat/>)
  return(
    
    <div className="limiter">
		<div className="container-login100">
			<div className="wrap-login100">
				<form className="login100-form validate-form" onSubmit={handleFormSubmit}>
					<span className="login100-form-title p-b-43">
						Login to continue
					</span>
					
					
					<div className="wrap-input100 validate-input" data-validate = "Valid email is required: ex@abc.xyz">
						<input className="input100" type="text" name="username" onChange={handleInputChange}/>
						<span className="focus-input100"></span>
						<span className="label-input100">Email</span>
					</div>
					
					
					<div className="wrap-input100 validate-input" data-validate="Password is required">
						<input className="input100" type="password" name="password" onChange={handleInputChange}/>
						<span className="focus-input100"></span>
						<span className="label-input100">Password</span>
					</div>

					<div className="flex-sb-m w-full p-t-3 p-b-32">
						<div className="contact100-form-checkbox">
							<input className="input-checkbox100" id="ckb1" type="checkbox" name="remember-me"/>
							<label className="label-checkbox100" htmlFor="ckb1">
								Remember me
							</label>
						</div>

						<div>
							<a href={{}} className="txt1">
								Forgot Password?
							</a>
						</div>
					</div>
			

					<div className="container-login100-form-btn">
						<button className="login100-form-btn" type="submit">
							Login
						</button>
					</div>
					
					<div className="text-center p-t-46 p-b-20">
						<span className="txt2">
							or sign up using
						</span>
					</div>

					<div className="login100-form-social flex-c-m">
						<a href={{}} className="login100-form-social-item flex-c-m bg1 m-r-5">
							<i className="fa fa-facebook-f" aria-hidden="true"></i>
						</a>

						<a href={{}} className="login100-form-social-item flex-c-m bg2 m-r-5">
							<i className="fa fa-twitter" aria-hidden="true"></i>
						</a>
					</div>
				</form>

				<div className="login100-more" style={{backgroundImage: `url('./theme/images/bg-01.jpg')`}}>
				</div>
			</div>
		</div>
	</div>
	

  )
}

export default App;
