// @ts-nocheck
import React from "react";
import { Button, ButtonProps } from "../ui";

type AuthButtonProps = ButtonProps;

const AuthButton: React.FC<AuthButtonProps> = (props) => (
  <Button
    {...props}
    variant="primary"
    className={`flex-row gap-2 ${props.className || ''}`}
    textClassName="font-bold"
  />
);

export default AuthButton;
