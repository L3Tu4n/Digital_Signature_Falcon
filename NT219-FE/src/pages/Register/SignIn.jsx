import React from "react";
import SignInForm from "./SignInForm";
import Banner from "./Banner";

function SignIn() {
  return (
    <div>
      <Banner page="signin" />
      <SignInForm />
    </div>
  );
}

export default SignIn;
