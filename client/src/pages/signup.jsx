import React from "react";
import Button from "../components/Buttons/buttons";
import Input from "../components/input/input";
import { useFormik } from 'formik';
import * as Yup from "yup";
import axios from "axios";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {path_url} from "../config/config"
import { useNavigate } from "react-router-dom";

const Signup = () =>{


   const navigate = useNavigate();
    const validationSchema = Yup.object().shape({
      fullName: Yup.string().required("Name is required"),
      email: Yup.string().required("Email is required").email("Email is invalid"),
      password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(40, "Password must not exceed 40 characters"),
    });

    const formik = useFormik({
        initialValues: {
        fullName: "",
          email: "",
          password: "",
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting}) => {
            console.log(values)
          try {
            const response = await axios.post(
              `${path_url}register`,
              values
            );
           
          } catch (error) {
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
            <div className=" text-4xl font-extrabold">Welcome </div>
            <div className=" text-xl font-light mb-14">Sign up to get started</div>
            <form className="flex flex-col items-center w-full" onSubmit={formik.handleSubmit}>
            <Input label="Full name" name="fullName" placeholder="Enter your full name" className={"mb-6 w-[75%]"  +
                  (formik.errors.fullName && formik.touched.fullName
                    ? " is-invalid"
                    : "")
                }  onChange={formik.handleChange}
                value={formik.values.fullName}  /> 
                <div className="invalid-feedback">
                  {formik.errors.fullName && formik.touched.fullName
                    ? formik.errors.fullName
                    : null}
                </div>
            <Input label="Email address" type="email" name="email" placeholder="Enter your email" className={"mb-6 w-[75%]" +
                    (formik.errors.email && formik.touched.email
                      ? " is-invalid"
                      : "")
                  }
                  onChange={formik.handleChange}
                  value={formik.values.email}/>
                   <div className="invalid-feedback">
                  {formik.errors.email && formik.touched.email
                    ? formik.errors.email
                    : null}
                </div>
            <Input label="Password" type="password" name="password" placeholder="Enter your Password" className={"mb-14 w-[75%]" +
                    (formik.errors.password && formik.touched.password
                      ? " is-invalid"
                      : "")
                  }
                  onChange={formik.handleChange}
                  value={formik.values.password}/>
                  <div className="invalid-feedback">
                  {formik.errors.password && formik.touched.password
                    ? formik.errors.password
                    : null}
                </div>
                <Button label='Sign up' type='submit' className="w-[75%] mb-2" />

            </form>
            <div>Alredy have an account? <span className=" text-primary cursor-pointer underline" onClick={() => navigate(`/users/sign_in`)}>'Sign in'</span></div>
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
}

export default Signup;