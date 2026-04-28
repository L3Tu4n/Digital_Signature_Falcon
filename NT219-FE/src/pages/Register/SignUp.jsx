import React from "react";
import SignUpForm from "./SignUpForm";
import Banner from "./Banner";

function SignUp() {
  return (
    <div>
      <Banner page="signup" />
      <SignUpForm />
    </div>
  );
}

export default SignUp;
