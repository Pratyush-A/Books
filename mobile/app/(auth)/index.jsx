import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from "@expo/vector-icons";
import styles from "../../assets/styles/login.styles";
import COLORS from "../../constants/colors";
import { Link } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "error" or "success"

  const { user, isLoading, login } = useAuthStore();

  const showAlert = (msg, type = "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleLogin = async () => {
    try {
      const result = await login(email, password);

      if (!result || typeof result !== "object") {
        showAlert("Unexpected response. Please try again.");
        return;
      }

      if (!result.success) {
        showAlert(result.error || "Login failed.");
      } else {
        showAlert("Login successful", "success");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error("Login error:", error);
      showAlert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* ILLUSTRATION */}
          <View style={styles.topIllustration}>
            <Image
              source={require("../../assets/images/i2.png")}
              style={styles.illustrationImage}
              contentFit="contain"
            />
          </View>

          {/* CARD */}
          <View style={styles.card}>
            <View style={styles.formContainer}>
              {/* ALERT MESSAGE */}
              {message !== "" && (
                <View
                  style={{
                    backgroundColor: messageType === "error" ? "#ffeded" : "#e6ffed",
                    borderColor: messageType === "error" ? "#ff5a5f" : "#00c851",
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 15,
                  }}
                >
                  <Text
                    style={{
                      color: messageType === "error" ? "#cc0000" : "#007e33",
                      textAlign: "center",
                    }}
                  >
                    {message}
                  </Text>
                </View>
              )}

              {/* EMAIL */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.placeholderText}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* PASSWORD */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.placeholderText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* LOGIN BUTTON */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>

              {/* SIGN UP LINK */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't Have an Account?</Text>
                <Link href="/signup" asChild>
                  <TouchableOpacity>
                    <Text style={styles.link}> Sign Up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
