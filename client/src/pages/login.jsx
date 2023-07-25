import React from "react";
import Button from "../components/Buttons/buttons";
import Input from "../components/input/input";
import { useFormik } from 'formik';
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { path_url } from "../config/config";

const Login = () => {
    const navigate = useNavigate();
  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required").email("Email is invalid"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(40, "Password must not exceed 40 characters"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await axios.post(
          `${path_url}login`,
          values
        );
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('user:detail', JSON.stringify(response.data.user))
// Store the JSON string in localStorage
        if(response.status == 200)
        {
          navigate('/');
        }
      } catch (error) {
        console.log(error);
        toast.error(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <div className="bg-light h-screen flex items-center justify-center">
        <div className=" bg-white w-[600px] h-[600px] shadow-lg rounded-lg flex flex-col justify-center items-center">
          <div className=" text-4xl font-extrabold">Welcome Back</div>
          <div className=" text-xl font-light mb-14">Sign in to get started</div>
          <form className="flex flex-col items-center w-full" onSubmit={formik.handleSubmit}>
            <Input
              label="Email address"
              type="email"
              name="email"
              placeholder="Enter your email"
              className={"mb-6 w-[75%]" + (formik.errors.email && formik.touched.email ? " is-invalid" : "")}
              onChange={formik.handleChange}
              value={formik.values.email}
            />
            <div className="invalid-feedback">
              {formik.errors.email && formik.touched.email ? formik.errors.email : null}
            </div>
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your Password"
              className={"mb-14 w-[75%]" + (formik.errors.password && formik.touched.password ? " is-invalid" : "")}
              onChange={formik.handleChange}
              value={formik.values.password}
            />
            <div className="invalid-feedback">
              {formik.errors.password && formik.touched.password ? formik.errors.password : null}
            </div>
            <Button label='Sign in' type='submit' className="w-[75%] mb-2" />
          </form>
          <div>
            Didn't have an account?{" "}
            <span className="text-primary cursor-pointer underline"  onClick={() => navigate(`/users/sign_up`)}>
              'Sign up'
            </span>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default Login;
