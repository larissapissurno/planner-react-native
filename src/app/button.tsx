import { createContext, useContext } from 'react'

import { clsx } from "clsx";
import { PropsWithChildren } from "react";
import { ActivityIndicator, Text, TextProps, TouchableOpacity, TouchableOpacityProps } from "react-native";

type Variants = "primary" | "secondary";

type ButtonProps = PropsWithChildren & TouchableOpacityProps & {
  variant?: Variants;
  isLoading?: boolean;
};

const ThemeContext = createContext<{variant?: Variants}>({});

function Button({
  children,
  variant = 'primary',
  isLoading,
  ...touchableOpacityProps
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={clsx(
        "w-full h-11 flex-row items-center justify-center rounded-lg gap-2",
        {
          "bg-lime-300": variant === "primary",
          "bg-zinc-800": variant === "secondary",
        }
      )} 
      disabled={isLoading}
      activeOpacity={0.7}
      {...touchableOpacityProps}
    >
      <ThemeContext.Provider value={{variant}}>
        {isLoading ? <ActivityIndicator className='text-lime-950' /> : children}
      </ThemeContext.Provider>
    </TouchableOpacity>
  );
}

function Title({children}: TextProps) {
  const { variant } = useContext(ThemeContext);

  return (
    <Text 
      className={clsx(
        "text-base font-semibold",
        {
          "text-lime-950 font-medium": variant === "primary",
          "text-zinc-200 font-regular": variant === "secondary",
        }
      )}
    >
      {children}
    </Text>
  )
}

Button.Title = Title;

export { Button };