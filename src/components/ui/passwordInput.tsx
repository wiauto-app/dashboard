import { useState } from "react";
import { Input } from "./input";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export const PasswordInput = ({ ...props }: React.ComponentProps<"input">) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative">
      <Input autoComplete="current-password" type={showPassword ? "text" : "password"} {...props} />
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeIcon className="size-4"/> : <EyeOffIcon className="size-4"/>}
      </button>
    </div>
  );
};
