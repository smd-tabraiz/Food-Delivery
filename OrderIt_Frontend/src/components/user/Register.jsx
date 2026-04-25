import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register} from "../../redux/actions/userActions";
import { clearErrors } from "../../redux/slices/userSlice";

const Register = () => {
 
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phoneNumber: "",
  });

  const { name, email, password, passwordConfirm, phoneNumber } = user;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, error, loading } = useSelector(
    (state) => state.user
  );

  //useEffect to handle redirection and error alerts
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
    if (error) {
      window.alert(error);
      dispatch(clearErrors());
    }
  }, [dispatch, isAuthenticated, error, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    console.log("Register form submitted", user);

    if (password !== passwordConfirm) {
      alert("Passwords do not match");
      return;
    }

    const userData = {
      name,
      email,
      password,
      passwordConfirm,
      phoneNumber,
      avatar: "/images/images.png",
    };

    console.log("Dispatching register action with data:", userData);
    dispatch(register(userData));
  };

  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="row wrapper">
        <div className="col-10 col-lg-5 registration-form">
          <form
            className="shadow-lg"
            onSubmit={submitHandler}
            encType="multipart/form-data"
          >
            <h1 className="mb-3">Register</h1>
            <div className="form-group">
              <label htmlFor="name_field">Name</label>
              <input
                type="text"
                id="name_field"
                className="form-control"
                name="name"
                value={name}
                onChange={onChange}
                required
              ></input>
            </div>
            <div className="form-group">
              <label htmlFor="email_field">Email</label>
              <input
                type="email"
                id="email_field"
                className="form-control"
                name="email"
                value={email}
                onChange={onChange}
                required
              ></input>
            </div>
            <div className="form-group">
              <label htmlFor="password_field">Password</label>
              <input
                type="password"
                id="password_field"
                className="form-control"
                name="password"
                value={password}
                onChange={onChange}
                required
                minLength="6"
              ></input>
            </div>
            <div className="form-group">
              <label htmlFor="passwordConfirm_field">Password Confirm</label>
              <input
                type="password"
                id="passwordConfirm_field"
                className="form-control"
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={onChange}
                required
                minLength="6"
              ></input>
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber_field">Phone Number</label>
              <input
                type="text"
                id="phoneNumber_field"
                className="form-control"
                name="phoneNumber"
                value={phoneNumber}
                onChange={onChange}
                required
              ></input>
            </div>

            <button
              id="register_button"
              type="submit"
              className="btn btn-block py-3"
              disabled={loading ? true : false}
            >
              {loading ? "REGISTERING..." : "REGISTER"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
