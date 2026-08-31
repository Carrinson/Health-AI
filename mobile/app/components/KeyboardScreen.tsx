import { KeyboardAvoidingView, Platform, ScrollView, ScrollViewProps } from "react-native";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
}

/**
 * Wraps a screen so the keyboard doesn't cover the active input.
 * Provides its own ScrollView for plain-content screens (forms).
 * For screens with a FlatList, use KeyboardScreenRaw instead — FlatList
 * already scrolls on its own, and nesting it inside another ScrollView
 * causes React Native's VirtualizedList warning/misbehavior.
 */
export default function KeyboardScreen({ children, contentContainerStyle }: Props) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={contentContainerStyle} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function KeyboardScreenRaw({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      {children}
    </KeyboardAvoidingView>
  );
}