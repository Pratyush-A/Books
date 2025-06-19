import { View, Text, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../assets/styles/home.styles";
import COLORS from "../../constants/colors";

export default function Home() {
  const { token } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      const response = await fetch(
        `https://books-dat7.onrender.com/api/books?page=${pageNum}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch books");

      if (refresh) {
        setBooks(data.books);
      } else {
        const newBooks = data.books.filter(
          (newBook) => !books.some((b) => b._id === newBook._id)
        );
        setBooks((prevBooks) => [...prevBooks, ...newBooks]);
      }

      setHasMore(pageNum < data.totalPages);
      setPage(pageNum + 1);
    } catch (error) {
      console.log("Error fetching books", error);
    } finally {
      if (refresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(1);
  }, []);

  const onRefresh = () => {
    fetchBooks(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchBooks(page);
    }
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
          <Text style={styles.username}>{item.user.username}</Text>
        </View>
      </View>
      <View style={styles.bookImageContainer}>
        <Image source={{ uri: item.image }} style={styles.bookImage} resizeMode="cover" />
      </View>
      <Text style={styles.bookTitle}>{item.title}</Text>
      <Text style={styles.bookCaption}>{item.caption}</Text>
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        {renderRatingStars(item.rating)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListFooterComponent={
            hasMore && !refreshing ? <ActivityIndicator size="small" color="#888" /> : null
          }
          ListHeaderComponent={
            <View style={{ marginTop: 24, marginBottom: 20, alignItems: "center" }}>
              <Text style={{ fontSize: 26, fontWeight: "bold", color: COLORS.primary }}>
                BookWorm ✍️
              </Text>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 4, textAlign: "center" }}>
                Discover great reads from the community 📚
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={60} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No recommendations yet</Text>
              <Text style={styles.emptySubtext}>Be the first to share a book!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
