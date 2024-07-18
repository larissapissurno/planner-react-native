import {
  Platform,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
} from "react-native";
import clsx from "clsx";
import { colors } from "@/styles/colors";

type Variants = "primary" | "secondary" | "tertiary";

type InputProps = ViewProps & {
  children: React.ReactNode;
  variant?: Variants;
};

function Input({
  children,
  className,
  variant = "primary",
  ...rest
}: InputProps) {
  return (
    <View
      className={clsx(
        "min-h-16 max-h-16 h-16 flex-row items-center gap-2",
        {
          "h-14 px-4 rounded-lg border border-zinc-800": variant !== "primary",
          "bg-zinc-950": variant === "secondary",
          "bg-zinc-900": variant === "tertiary",
        },
        className
      )}
      {...rest}
    >
      {children}
    </View>
  );
}

type FieldProps = TextInputProps & { innerRef?: React.Ref<TextInput> };

function Field({ innerRef, ...textInputProps }: FieldProps) {
  return (
    <TextInput
      ref={innerRef}
      className="flex-1 text-zinc-100 font-regular text-lg"
      placeholderTextColor={colors.zinc[400]}
      keyboardAppearance="dark"
      cursorColor={Platform.OS === "android" ? colors.zinc[100] : undefined}
      selectionColor={Platform.OS === "ios" ? colors.zinc[100] : undefined}
      {...textInputProps}
    />
  );
}

Input.Field = Field;

export { Input };
