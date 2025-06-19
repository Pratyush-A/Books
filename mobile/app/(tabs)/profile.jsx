import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";

export default function Profile() {
  const { user, token, logout } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserBooks = async () => {
    try {
      const response = await fetch(`https://books-dat7.onrender.com/api/books/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load books");
      setBooks(data);
    } catch (err) {
      console.error("Failed to fetch user books", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserBooks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserBooks();
  };

  const handleDelete = async (id) => {
    Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`https://books-dat7.onrender.com/api/books/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to delete book");
            setBooks((prev) => prev.filter((b) => b._id !== id));
          } catch (err) {
            console.error("Delete error", err);
          }
        },
      },
    ]);
  };

  const renderStars = (rating) => (
    <View style={{ flexDirection: "row", marginTop: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color="#f4b400"
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.bookCard}>
      <Image source={{ uri: item.image }} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        {renderStars(item.rating)}
        <Text style={styles.bookCaption} numberOfLines={2}>
          {item.caption}
        </Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item._id)}>
        <Ionicons name="trash-outline" size={20} color="#888" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ✅ User Card */}
      <View style={styles.profileCard}>
        <Image source={{ uri: user?.profileImage }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      {/* ✅ Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={18} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* ✅ Header */}
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationText}>Your Recommendations</Text>
        <Text style={styles.count}>{books.length} books</Text>
      </View>

      {/* ✅ Book List */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4fefc",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  email: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: "#1976D2",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  count: {
    fontSize: 13,
    color: "#888",
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    elevation: 1,
    alignItems: "center",
  },
  bookImage: {
    width: 55,
    height: 70,
    borderRadius: 6,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 10,
  },
  bookTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#222",
  },
  bookCaption: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  date: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 2,
  },
});
